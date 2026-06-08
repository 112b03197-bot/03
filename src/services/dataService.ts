/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, DoctorProfile, Appointment, MedicalRecord, StatsDashboard, UserRole } from "../types";
import { MOCK_USERS, MOCK_DOCTORS, MOCK_APPOINTMENTS, MOCK_MEDICAL_RECORDS } from "./mockData";

// Local storage key names
const STORAGE_PREFIX = "telehealth_link_";
const KEYS = {
  USERS: `${STORAGE_PREFIX}users`,
  DOCTORS: `${STORAGE_PREFIX}doctors`,
  APPOINTMENTS: `${STORAGE_PREFIX}appointments`,
  RECORDS: `${STORAGE_PREFIX}records`,
  CURRENT_USER: `${STORAGE_PREFIX}current_user`,
};

// Initialize database in LocalStorage if empty
function initializeStorage() {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(MOCK_USERS));
  }
  if (!localStorage.getItem(KEYS.DOCTORS)) {
    localStorage.setItem(KEYS.DOCTORS, JSON.stringify(MOCK_DOCTORS));
  }
  if (!localStorage.getItem(KEYS.APPOINTMENTS)) {
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(MOCK_APPOINTMENTS));
  }
  if (!localStorage.getItem(KEYS.RECORDS)) {
    localStorage.setItem(KEYS.RECORDS, JSON.stringify(MOCK_MEDICAL_RECORDS));
  }
}

// Ensure database state is bootstrapped
initializeStorage();

// Database read helpers
function getFromStorage<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
}

export const DataService = {
  // Authentication Simulated Services
  getCurrentUser(): UserProfile | null {
    try {
      const u = localStorage.getItem(KEYS.CURRENT_USER);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: UserProfile | null): void {
    if (user) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  },

  // Log in using mock profile matching email and password (for testing)
  login(email: string): { success: boolean; user?: UserProfile; error?: string } {
    const users = getFromStorage<UserProfile>(KEYS.USERS);
    const matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (matched) {
      this.setCurrentUser(matched);
      return { success: true, user: matched };
    }
    return { success: false, error: "用戶電子郵件未註冊或密碼錯誤。" };
  },

  // Register account
  register(profile: Omit<UserProfile, "id" | "createdAt" | "isVerified">): UserProfile {
    const users = getFromStorage<UserProfile>(KEYS.USERS);
    
    // Generates a mock Firestore human-friendly document ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const prefix = profile.role === "patient" ? "pat" : profile.role === "doctor" ? "doc" : "adm";
    const id = `${prefix}_${randomSuffix}`;

    const newUser: UserProfile = {
      ...profile,
      id,
      createdAt: new Date().toISOString(),
      isVerified: true,
    };

    users.push(newUser);
    saveToStorage(KEYS.USERS, users);

    // If registering a doctor, also add to doctors profile entity list
    if (profile.role === "doctor") {
      const doctors = getFromStorage<DoctorProfile>(KEYS.DOCTORS);
      const newDoctor: DoctorProfile = {
        id,
        name: profile.name,
        email: profile.email,
        department: "家醫科", // default department
        title: "主治醫師",
        bio: `${profile.name}醫師。新進駐遠距醫療團隊提供視訊全人醫療健康諮詢。`,
        photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300",
        schedule: [
          { dayOfWeek: 1, period: "morning", maxSlot: 10 },
          { dayOfWeek: 3, period: "afternoon", maxSlot: 10 }
        ]
      };
      doctors.push(newDoctor);
      saveToStorage(KEYS.DOCTORS, doctors);
    }

    return newUser;
  },

  updateHealthCard(userId: string, cardId: string, photoBase64: string): UserProfile | null {
    const users = getFromStorage<UserProfile>(KEYS.USERS);
    const index = users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      users[index].healthCardId = cardId;
      users[index].healthCardPhotoUrl = photoBase64; // In mock mode, we embed base64 string
      saveToStorage(KEYS.USERS, users);

      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        const updated = users[index];
        this.setCurrentUser(updated);
        return updated;
      }
      return users[index];
    }
    return null;
  },

  // Users Management Services
  getUsers(): UserProfile[] {
    return getFromStorage<UserProfile>(KEYS.USERS);
  },

  updateUserRole(userId: string, newRole: UserRole): UserProfile | null {
    const users = getFromStorage<UserProfile>(KEYS.USERS);
    const idx = users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      users[idx].role = newRole;
      saveToStorage(KEYS.USERS, users);
      return users[idx];
    }
    return null;
  },

  deleteUser(userId: string): void {
    const users = getFromStorage<UserProfile>(KEYS.USERS);
    const filtered = users.filter((u) => u.id !== userId);
    saveToStorage(KEYS.USERS, filtered);

    // Also remove from matching Doctor entity if applicable
    const doctors = getFromStorage<DoctorProfile>(KEYS.DOCTORS);
    const filteredDocs = doctors.filter((d) => d.id !== userId);
    saveToStorage(KEYS.DOCTORS, filteredDocs);
  },

  // Doctors Management services
  getDoctors(): DoctorProfile[] {
    return getFromStorage<DoctorProfile>(KEYS.DOCTORS);
  },

  saveDoctorProfile(docProfile: DoctorProfile): void {
    const doctors = getFromStorage<DoctorProfile>(KEYS.DOCTORS);
    const index = doctors.findIndex((d) => d.id === docProfile.id);
    if (index !== -1) {
      doctors[index] = docProfile;
    } else {
      doctors.push(docProfile);
    }
    saveToStorage(KEYS.DOCTORS, doctors);
  },

  // Appointment Registrations
  getAppointments(): Appointment[] {
    return getFromStorage<Appointment>(KEYS.APPOINTMENTS);
  },

  getAppointmentsByPatient(patientId: string): Appointment[] {
    return this.getAppointments().filter((a) => a.patientId === patientId);
  },

  getAppointmentsByDoctor(doctorId: string): Appointment[] {
    return this.getAppointments().filter((a) => a.doctorId === doctorId);
  },

  createAppointment(appt: Omit<Appointment, "id" | "slotNumber" | "status" | "createdAt">): Appointment {
    const appts = getFromStorage<Appointment>(KEYS.APPOINTMENTS);
    
    // Count existing bookings for this doctor, date and period to assign the slot number (號碼)
    const activeSlots = appts.filter(
      (a) => a.doctorId === appt.doctorId && a.date === appt.date && a.period === appt.period
    );
    const slotNumber = activeSlots.length + 1;
    const id = `apt_${Math.floor(1000 + Math.random() * 9000)}`;

    const newAppt: Appointment = {
      ...appt,
      id,
      slotNumber,
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };

    appts.push(newAppt);
    saveToStorage(KEYS.APPOINTMENTS, appts);
    return newAppt;
  },

  updateAppointmentStatus(id: string, status: "scheduled" | "calling" | "completed" | "cancelled"): Appointment | null {
    const appts = getFromStorage<Appointment>(KEYS.APPOINTMENTS);
    const idx = appts.findIndex((a) => a.id === id);
    if (idx !== -1) {
      appts[idx].status = status;
      saveToStorage(KEYS.APPOINTMENTS, appts);
      return appts[idx];
    }
    return null;
  },

  // Medical Record diagnostic records
  getMedicalRecords(): MedicalRecord[] {
    return getFromStorage<MedicalRecord>(KEYS.RECORDS);
  },

  getMedicalRecordsByPatient(patientId: string): MedicalRecord[] {
    return this.getMedicalRecords().filter((r) => r.patientId === patientId);
  },

  getMedicalRecordsByDoctor(doctorId: string): MedicalRecord[] {
    return this.getMedicalRecords().filter((r) => r.doctorId === doctorId);
  },

  createMedicalRecord(record: Omit<MedicalRecord, "id" | "createdAt">): MedicalRecord {
    const records = getFromStorage<MedicalRecord>(KEYS.RECORDS);
    const id = `rec_${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecord: MedicalRecord = {
      ...record,
      id,
      createdAt: new Date().toISOString()
    };

    records.push(newRecord);
    saveToStorage(KEYS.RECORDS, records);

    // Automatically transition the linked appointment to "completed"
    this.updateAppointmentStatus(record.appointmentId, "completed");

    return newRecord;
  },

  // Statistics Dashboard details
  getStatsDashboard(): StatsDashboard {
    const users = this.getUsers();
    const doctors = this.getDoctors();
    const appts = this.getAppointments();

    const totalPatients = users.filter((u) => u.role === "patient").length;
    const totalDoctors = doctors.length;
    const totalAppointments = appts.length;
    const completedAppointments = appts.filter((a) => a.status === "completed").length;
    const cancelledAppointments = appts.filter((a) => a.status === "cancelled").length;

    // Calculate department booking list distribution
    const depMap: { [key: string]: number } = {};
    appts.forEach((a) => {
      depMap[a.department] = (depMap[a.department] || 0) + 1;
    });
    // Fill defaults if empty
    if (Object.keys(depMap).length === 0) {
      depMap["家醫科"] = 0;
      depMap["小兒科"] = 0;
      depMap["內科"] = 0;
      depMap["皮膚科"] = 0;
    }

    const departmentDistribution = Object.keys(depMap).map((k) => ({
      name: k,
      value: depMap[k],
    }));

    // Daily trends (last 7 days)
    const trends: { [key: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split("T")[0];
      trends[str] = 0;
    }

    appts.forEach((a) => {
      if (trends[a.date] !== undefined) {
        trends[a.date]++;
      }
    });

    const appointmentTrend = Object.keys(trends).map((date) => ({
      date: date.substring(5), // Keep MM-DD format
      count: trends[date],
    }));

    return {
      totalPatients,
      totalDoctors,
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      departmentDistribution,
      appointmentTrend,
    };
  }
};
