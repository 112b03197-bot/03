/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Users, Stethoscope, Video, ChevronRight, FileText, CheckCircle2, 
  Search, Eye, HelpCircle, Save, Heart, Shield, Calendar, Clock, Pill, Trash2 
} from "lucide-react";
import { DataService } from "../services/dataService";
import { Appointment, DoctorProfile, MedicalRecord, UserProfile } from "../types";

interface DoctorDashboardProps {
  doctorUser: UserProfile;
  onEnterConsultation: (appointment: Appointment) => void;
  onLogout: () => void;
}

export function DoctorDashboard({ doctorUser, onEnterConsultation, onLogout }: DoctorDashboardProps) {
  const [activeTab, setActiveTab] = useState<"queue" | "history">("queue");
  
  // Doctor profile mapping
  const docProfile = DataService.getDoctors().find(d => d.id === doctorUser.id) || {
    id: doctorUser.id,
    name: doctorUser.name,
    email: doctorUser.email,
    department: "家醫科",
    title: "主任醫師",
    bio: "預設主治醫師資料",
    photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300"
  };

  const [appointments, setAppointments] = useState<Appointment[]>(() => 
    DataService.getAppointmentsByDoctor(doctorUser.id)
  );

  const [records, setRecords] = useState<MedicalRecord[]>(() => 
    DataService.getMedicalRecordsByDoctor(doctorUser.id)
  );

  // States for diagnostic formulation modal / form
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [prescription, setPrescription] = useState("");
  const [isRecordSuccess, setIsRecordSuccess] = useState(false);

  // States to view patient card modal
  const [viewingPatientCardUrl, setViewingPatientCardUrl] = useState<string | null>(null);

  // Refresh lists
  const syncData = () => {
    setAppointments(DataService.getAppointmentsByDoctor(doctorUser.id));
    setRecords(DataService.getMedicalRecordsByDoctor(doctorUser.id));
  };

  // Select appointment to write medical record
  const handleOpenDiagnoseForm = (appt: Appointment) => {
    setSelectedAppt(appt);
    setSymptoms("");
    setDiagnosis("");
    setTreatment("");
    
    // Auto populate prescription template to make it very fast
    setPrescription(
      "1. 美卡多膜衣錠 (Micardis) 40mg - 每日一次，早餐後口服一錠\n" +
      "2. 息寧控釋錠 (Sinemet CR) 200mg - 每日兩次，早晚飯後口服一錠"
    );
    setIsRecordSuccess(false);
  };

  // Submit diagnosis
  const handleSubmitRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;

    if (!symptoms.trim() || !diagnosis.trim() || !treatment.trim() || !prescription.trim()) {
      alert("請完整編列診斷報告之主訴、診斷描述及開藥單。");
      return;
    }

    DataService.createMedicalRecord({
      appointmentId: selectedAppt.id,
      patientId: selectedAppt.patientId,
      patientName: selectedAppt.patientName,
      patientBirthday: selectedAppt.patientBirthday,
      patientGender: selectedAppt.patientGender,
      doctorId: docProfile.id,
      doctorName: docProfile.name,
      department: docProfile.department,
      date: new Date().toISOString().split("T")[0],
      symptoms,
      diagnosis,
      treatment,
      prescription
    });

    setIsRecordSuccess(true);
    syncData();

    // Close screen after a brief delay
    setTimeout(() => {
      setSelectedAppt(null);
      setIsRecordSuccess(false);
    }, 2000);
  };

  return (
    <div id="doctor-dashboard-view" className="max-w-6xl mx-auto my-6 px-4 animate-fade-in text-slate-300">
      
      {/* Clinician Profile banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 mb-6 border border-slate-805 border-slate-800 flex flex-wrap items-center justify-between gap-6 shadow-xl animate-fade-in">
        <div className="flex items-center gap-4">
          <img 
            src={docProfile.photoUrl} 
            alt={docProfile.name} 
            className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500/80 shadow-md"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-cyan-400">{docProfile.name} 醫師</h2>
              <span className="text-[10px] bg-cyan-950 border border-cyan-800 text-cyan-400 px-2.5 py-0.5 rounded-full font-bold">
                {docProfile.department} • {docProfile.title}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1 pr-6 leading-relaxed max-w-xl">
              {docProfile.bio}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 hover:text-white text-slate-350 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
        >
          登出醫護端
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-805 border-slate-800 mb-6 gap-6">
        <button
          onClick={() => setActiveTab("queue")}
          className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === "queue" ? "text-cyan-400" : "text-slate-450 text-slate-400 hover:text-slate-200"
          }`}
        >
          今日就診掛號病患 ({appointments.filter(a => a.status === "scheduled" || a.status === "calling").length})
          {activeTab === "queue" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full"></span>}
        </button>
        
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === "history" ? "text-cyan-400" : "text-slate-455 text-slate-400 hover:text-slate-200"
          }`}
        >
          已歸檔看診歷程 ({records.length})
          {activeTab === "history" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full"></span>}
        </button>
      </div>

      {/* VIEW PATIENT INSURANCE ID CARD MODAL */}
      {viewingPatientCardUrl && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden max-w-lg w-full text-white shadow-2xl animate-scale-up">
            <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-cyan-400 tracking-wide flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                病患全民健保晶片卡影本 (複核用)
              </h3>
              <button 
                onClick={() => setViewingPatientCardUrl(null)}
                className="text-slate-400 hover:text-white text-xs font-bold font-mono px-2 py-1 rounded hover:bg-slate-800"
              >
                關閉 [ESC]
              </button>
            </div>
            <div className="p-6 bg-slate-950 flex justify-center">
              <img 
                src={viewingPatientCardUrl} 
                alt="Patient Health Card" 
                className="max-h-[300px] w-auto rounded-lg object-contain border border-slate-800 shadow shadow-slate-950"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-4 bg-slate-900 text-[10px] text-slate-400 text-center border-t border-slate-800 leading-relaxed font-sans">
              依衛生福利部健保過卡規章，凡視訊診療皆須線上影本複本對照，確保診斷、簽章人身份相符
            </div>
          </div>
        </div>
      )}

      {/* LAYOUT BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
        
        {/* Left Side: Main Tables / lists */}
        <div className="lg:col-span-8 space-y-4">
          
          {activeTab === "queue" && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 pb-1">
                <Users className="w-4.5 h-4.5 text-cyan-400" />
                今日掛號就診佇列清單
              </h3>

              {appointments.length === 0 ? (
                <div className="border border-slate-800 rounded-2xl p-10 text-center bg-slate-900/40 backdrop-blur">
                  <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-xs font-bold text-slate-300">目前尚無預約看診病患</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    若有病患線上送出本院科別預約掛號，系統將在佇列中即時排班。
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((a) => (
                    <div 
                      key={a.id} 
                      className={`border rounded-xl p-5 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        a.status === "calling" 
                          ? "border-cyan-500 bg-cyan-950/20 shadow-md ring-1 ring-cyan-500/20" 
                          : a.status === "scheduled"
                          ? "border-slate-800 bg-slate-900 hover:border-slate-700"
                          : "border-slate-850 bg-slate-950/50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center text-base shrink-0 border border-cyan-800 shadow-inner">
                          {a.patientName[0]}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-slate-100">{a.patientName}</span>
                            <span className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                              {a.patientGender || "未知"} | {a.patientBirthday || "生日未知"}
                            </span>
                            
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              a.status === "scheduled" 
                                ? "bg-blue-950/50 border-blue-900/50 text-blue-400" 
                                : a.status === "calling"
                                ? "bg-amber-950 border-amber-800 text-amber-400 animate-pulse"
                                : a.status === "completed"
                                ? "bg-slate-950 border-slate-850 text-slate-500"
                                : "bg-rose-955/35 bg-rose-950/30 border-rose-900 text-rose-400"
                            }`}>
                              {a.status === "scheduled" && "等待就診"}
                              {a.status === "calling" && "視訊看診中"}
                              {a.status === "completed" && "已完成"}
                              {a.status === "cancelled" && "已取消"}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span>預約時段：<strong>{a.date} ({a.period === "morning" ? "上午" : a.period === "afternoon" ? "下午" : "晚上"}診)</strong></span>
                            <span>掛號編號：<strong className="text-cyan-400">No.{a.slotNumber}</strong> 號</span>
                          </p>

                          {a.patientHealthCardId && (
                            <p className="text-[11px] text-slate-405 text-slate-400 mt-1 font-mono">
                              身分證字號：{a.patientHealthCardId}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Clinician Action keys */}
                      <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                        {/* Option to look up NHI health insurance card */}
                        {userProfileOfPatient(a.patientId)?.healthCardPhotoUrl && (
                          <button
                            onClick={() => setViewingPatientCardUrl(userProfileOfPatient(a.patientId)?.healthCardPhotoUrl || null)}
                            className="px-2.5 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                            title="檢查身分健保卡"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-400" />
                            過卡複查
                          </button>
                        )}

                        {/* Trigger screen session */}
                        {(a.status === "scheduled" || a.status === "calling") && (
                          <button
                            onClick={() => {
                              // Automatically set status to 'calling' and trigger session
                              DataService.updateAppointmentStatus(a.id, "calling");
                              onEnterConsultation(a);
                            }}
                            className="px-3 py-1.5 bg-slate-950 border border-slate-805 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5 text-cyan-400" />
                            視訊通話
                          </button>
                        )}

                        {/* Diagnose report tab */}
                        {a.status === "calling" && (
                          <button
                            onClick={() => handleOpenDiagnoseForm(a)}
                            className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1 shadow-lg cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-950" />
                            撰寫病歷
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 pb-1">
                <FileText className="w-4.5 h-4.5 text-cyan-400" />
                已存電子檔案就診病歷歸檔
              </h3>

              {records.length === 0 ? (
                <div className="border border-slate-800 rounded-2xl p-10 text-center bg-slate-900/40">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-xs font-bold text-slate-300">尚無任何看診病歷歸檔</p>
                  <p className="text-[11px] text-slate-500 mt-1">有開立處方或完成診斷之病患將載入於此。</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {records.map((r) => (
                    <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl hover:border-slate-700 transition-all">
                      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-850 flex flex-wrap items-center justify-between text-xs gap-3">
                        <div className="font-bold text-slate-205 text-slate-200 flex items-center gap-1.5">
                          <span>{r.date}</span>
                          <span className="text-[10px] bg-cyan-950 border border-cyan-900 text-cyan-400 px-1.5 py-0.5 rounded font-semibold">病患: {r.patientName}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">編號: {r.id}</span>
                      </div>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs select-none">
                        <div>
                          <strong className="text-slate-200 block mb-1">✓ 診斷主訴描述</strong>
                          <p className="text-slate-305 text-slate-300 leading-relaxed bg-slate-950/40 p-2 rounded-lg border border-slate-850">{r.symptoms}</p>
                          <strong className="text-slate-200 block mt-3 mb-1">✓ 專業病理診斷</strong>
                          <p className="text-slate-200 font-semibold leading-relaxed bg-slate-950/40 p-2 rounded-lg border border-slate-850">{r.diagnosis}</p>
                        </div>
                        <div className="bg-amber-950/10 border border-amber-900/20 rounded-lg p-3">
                          <strong className="text-amber-400 block mb-1 flex items-center gap-1">
                            <Pill className="w-3.5 h-3.5 text-amber-500" />
                            開立處方箋
                          </strong>
                          <pre className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed mt-1.5">
                            {r.prescription}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Right Side: Diagnose fill card form */}
        <div className="lg:col-span-4">
          
          {selectedAppt ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-5 sticky top-6 animate-scale-up">
              <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">臨床電子病歷登錄</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">病患: {selectedAppt.patientName} ({selectedAppt.patientGender || "男"})</p>
                </div>
                <button 
                  onClick={() => setSelectedAppt(null)}
                  className="text-xs text-slate-400 hover:text-white font-bold border border-slate-800 hover:border-slate-700 rounded px-1.5 py-0.5 hover:bg-slate-800 cursor-pointer"
                >
                  取消填寫
                </button>
              </div>

              {isRecordSuccess ? (
                <div className="py-12 text-center text-emerald-400 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                  <p className="font-bold text-xs">電子病歷已妥為儲存歸檔！</p>
                  <p className="text-[10px] text-slate-500">正在自動完診並通知病患端...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitRecord} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-405 text-slate-400 mb-1">主訴症狀 (Symptoms) *</label>
                    <textarea
                      id="txt-diagnose-symptoms"
                      rows={2}
                      required
                      placeholder="病患常態性心悸、並有胸部壓迫感..."
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none focus:bg-slate-950 transition-all text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">病原診斷結果 (Diagnosis) *</label>
                    <textarea
                      id="txt-diagnose-code"
                      rows={2}
                      required
                      placeholder="臨床懷疑輕微二尖瓣脫垂，併發心律過速..."
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none focus:bg-slate-950 transition-all text-slate-100 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">治療與臨床衛教 (Treatment Details) *</label>
                    <textarea
                      id="txt-diagnose-treatment"
                      rows={2}
                      required
                      placeholder="安排下診執行靜止心電圖。禁止劇烈或缺氧運動。"
                      value={treatment}
                      onChange={(e) => setTreatment(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none focus:bg-slate-950 transition-all text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">開立健保給付處方箋 (Prescription) *</label>
                    <textarea
                      id="txt-diagnose-prescription"
                      rows={3}
                      required
                      placeholder="名列處方、劑量、服用次數..."
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none focus:bg-slate-950 transition-all text-slate-200 font-mono text-[10px]"
                    />
                  </div>

                  <button
                    id="btn-save-diagnose"
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-955 font-bold text-xs py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950/20"
                  >
                    <Save className="w-4 h-4" />
                    核對無誤並確認歸檔
                  </button>
                </form>
              )}

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-805 border-slate-800 border-dashed rounded-2xl p-6 text-center sticky top-6">
              <HelpCircle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-300">診斷病歷編譯視窗</h4>
              <p className="text-[10px] text-slate-455 text-slate-400 mt-1 leading-relaxed">
                在左方看診清單佇列中，點選「視訊看診通話」激活與病患的視訊諮詢。
                當看診中時，可點選「撰寫病歷」在此處快速輸入診斷結果並開立電子處方箋，已備病患過卡查驗。
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

// Inline helper to resolve patient photo link
function userProfileOfPatient(patientId: string): UserProfile | undefined {
  return DataService.getUsers().find(u => u.id === patientId);
}
