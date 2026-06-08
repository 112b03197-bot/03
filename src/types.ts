/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'patient' | 'doctor' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  birthday?: string;
  gender?: 'male' | 'female' | 'other';
  healthCardId?: string; // 身分證字號
  healthCardPhotoUrl?: string;
  createdAt: string;
  isVerified: boolean;
}

export type PeriodType = 'morning' | 'afternoon' | 'evening';

export interface DoctorSchedule {
  dayOfWeek: number; // 1 (Mon) - 5 (Fri)
  period: PeriodType;
  maxSlot: number;
}

export interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  department: string; // 科別 (例如: 內科, 家醫科, 小兒科, 皮膚科)
  title: string; // 職稱 (例如: 主治醫師, 主任醫師)
  bio: string;
  photoUrl: string;
  schedule: DoctorSchedule[];
}

export type AppointmentStatus = 'scheduled' | 'calling' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientBirthday?: string;
  patientGender?: string;
  patientHealthCardId?: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string; // YYYY-MM-DD
  period: PeriodType;
  slotNumber: number; // 掛號號碼
  status: AppointmentStatus;
  createdAt: string;
  meetingJoined?: {
    patient?: boolean;
    doctor?: boolean;
  };
}

export interface MedicalRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientBirthday?: string;
  patientGender?: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  symptoms: string; // 主訴
  diagnosis: string; // 診斷結果
  treatment: string; // 治療處置
  prescription: string; // 處方箋
  createdAt: string;
}

export interface StatsDashboard {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  departmentDistribution: { name: string; value: number }[];
  appointmentTrend: { date: string; count: number }[];
}
