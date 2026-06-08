/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, DoctorProfile, Appointment, MedicalRecord } from "../types";

export const MOCK_USERS: UserProfile[] = [
  {
    id: "pat_001",
    email: "patient@telehealth.com",
    name: "王小明",
    role: "patient",
    phone: "0912-345-678",
    birthday: "1988-05-15",
    gender: "male",
    healthCardId: "A123456789",
    healthCardPhotoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=300",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    isVerified: true,
  },
  {
    id: "doc_101",
    email: "doctor@telehealth.com",
    name: "林志豪",
    role: "doctor",
    phone: "0922-111-222",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    isVerified: true,
  },
  {
    id: "adm_001",
    email: "admin@telehealth.com",
    name: "醫療系統管理員",
    role: "admin",
    phone: "0988-999-999",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    isVerified: true,
  }
];

export const MOCK_DOCTORS: DoctorProfile[] = [
  {
    id: "doc_101",
    name: "林志豪",
    email: "doctor@telehealth.com",
    department: "家醫科",
    title: "主任醫師",
    bio: "擁有超過十五年家醫科臨床經驗，專長慢性病管理、預防醫學與全人照護健康諮詢。",
    photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80",
    schedule: [
      { dayOfWeek: 1, period: "morning", maxSlot: 15 },
      { dayOfWeek: 1, period: "afternoon", maxSlot: 15 },
      { dayOfWeek: 3, period: "morning", maxSlot: 15 },
      { dayOfWeek: 5, period: "evening", maxSlot: 15 }
    ]
  },
  {
    id: "doc_102",
    name: "陳雅婷",
    email: "chen.yating@telehealth.com",
    department: "小兒科",
    title: "主治醫師",
    bio: "台大醫院小兒專科訓練，溫柔有耐心，專精嬰幼兒生長發育評估、小兒呼吸道及過敏體質調整。",
    photoUrl: "https://images.unsplash.com/photo-1594824813573-246434e33963?w=300&auto=format&fit=crop&q=80",
    schedule: [
      { dayOfWeek: 2, period: "afternoon", maxSlot: 10 },
      { dayOfWeek: 4, period: "morning", maxSlot: 10 }
    ]
  },
  {
    id: "doc_103",
    name: "張家榮",
    email: "chang.jiarong@telehealth.com",
    department: "內科",
    title: "主治醫師",
    bio: "專長心血管疾病疾病、糖尿病前期調控、老年醫學與各種內科危急重症諮詢。",
    photoUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop&q=80",
    schedule: [
      { dayOfWeek: 3, period: "afternoon", maxSlot: 20 },
      { dayOfWeek: 5, period: "morning", maxSlot: 20 }
    ]
  },
  {
    id: "doc_104",
    name: "李美玲",
    email: "lee.meiling@telehealth.com",
    department: "皮膚科",
    title: "主治醫師",
    bio: "專攻遠距皮膚科快篩、濕疹、異位性皮膚炎、青春痘複合式治療及各類常見皮膚疾患。",
    photoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80",
    schedule: [
      { dayOfWeek: 1, period: "evening", maxSlot: 15 },
      { dayOfWeek: 4, period: "afternoon", maxSlot: 15 }
    ]
  }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "apt_001",
    patientId: "pat_001",
    patientName: "王小明",
    patientBirthday: "1988-05-15",
    patientGender: "男",
    patientHealthCardId: "A123456789",
    doctorId: "doc_101",
    doctorName: "林志豪",
    department: "家醫科",
    date: new Date().toISOString().split("T")[0], // Today
    period: "afternoon",
    slotNumber: 3,
    status: "scheduled",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "apt_002",
    patientId: "pat_001",
    patientName: "王小明",
    patientBirthday: "1988-05-15",
    patientGender: "男",
    patientHealthCardId: "A123456789",
    doctorId: "doc_103",
    doctorName: "張家榮",
    department: "內科",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 5 days ago
    period: "afternoon",
    slotNumber: 8,
    status: "completed",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "apt_003",
    patientId: "pat_001",
    patientName: "王小明",
    patientBirthday: "1988-05-15",
    patientGender: "男",
    patientHealthCardId: "A123456789",
    doctorId: "doc_102",
    doctorName: "陳雅婷",
    department: "小兒科",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 2 days later
    period: "morning",
    slotNumber: 5,
    status: "scheduled",
    createdAt: new Date().toISOString()
  }
];

export const MOCK_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: "rec_001",
    appointmentId: "apt_002",
    patientId: "pat_001",
    patientName: "王小明",
    patientBirthday: "1988-05-15",
    patientGender: "男",
    doctorId: "doc_103",
    doctorName: "張家榮",
    department: "內科",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    symptoms: "自訴近兩週偶有心悸，合併輕微胸悶。無明顯呼吸困難，平時血壓偏高(約145/92 mmHg)。",
    diagnosis: "輕微高血壓合併竇性心律過速，疑因近期生活或工作壓力大引發。",
    treatment: "衛教維持健康作息，減少攝取刺激性食物與咖啡因。記錄每日早晚血壓。預約下週心電圖門診追蹤。",
    prescription: "1. Amlodipine (脈優) 5mg - 每日一次，早餐後口服一錠 (7天份)\n2. Propranolol (心律整) 10mg - 必要時心搏過速服用一錠",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];
