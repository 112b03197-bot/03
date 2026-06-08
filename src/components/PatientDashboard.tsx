/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Calendar, Clock, User, Heart, ChevronRight, CheckCircle, 
  Trash2, Video, FileText, Pill, PlusCircle, Search, Stethoscope, BriefcaseMedical 
} from "lucide-react";
import { DataService } from "../services/dataService";
import { Appointment, DoctorProfile, MedicalRecord, UserProfile, PeriodType } from "../types";

interface PatientDashboardProps {
  user: UserProfile;
  onEnterConsultation: (appointment: Appointment) => void;
  onLogout: () => void;
}

export function PatientDashboard({ user, onEnterConsultation, onLogout }: PatientDashboardProps) {
  const [activeTab, setActiveTab] = useState<"appointments" | "register" | "records">("appointments");
  
  // Local state retrieved from unified DB
  const [appointments, setAppointments] = useState<Appointment[]>(() => 
    DataService.getAppointmentsByPatient(user.id)
  );
  const [records, setRecords] = useState<MedicalRecord[]>(() => 
    DataService.getMedicalRecordsByPatient(user.id)
  );

  const doctors = DataService.getDoctors();

  // Registration state variables
  const [selectedDept, setSelectedDept] = useState("家醫科");
  const [selectedDocId, setSelectedDocId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("morning");
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);

  const departments = ["家醫科", "小兒科", "內科", "皮膚科"];

  // Filter doctors list based on selected department
  const filteredDoctors = doctors.filter((d) => d.department === selectedDept);

  // Set default doctor on department selection change
  React.useEffect(() => {
    if (filteredDoctors.length > 0) {
      setSelectedDocId(filteredDoctors[0].id);
    } else {
      setSelectedDocId("");
    }
  }, [selectedDept]);

  // Appointment scheduling handler
  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocId || !selectedDate || !selectedPeriod) {
      alert("請完整選取就診醫師、看診日期與時段。");
      return;
    }

    const doctor = doctors.find((d) => d.id === selectedDocId);
    if (!doctor) return;

    // Create appointment via service
    const newAppt = DataService.createAppointment({
      patientId: user.id,
      patientName: user.name,
      patientBirthday: user.birthday,
      patientGender: user.gender === "male" ? "男" : user.gender === "female" ? "女" : "其他",
      patientHealthCardId: user.healthCardId,
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: doctor.department,
      date: selectedDate,
      period: selectedPeriod,
    });

    // Refresh local lists
    setAppointments(DataService.getAppointmentsByPatient(user.id));
    
    // Feedback and reset
    setRegSuccessMsg(`掛號成功！您的看診號碼為【No.${newAppt.slotNumber}】號，請依時段就診。`);
    setSelectedDate("");
    
    // Clear message after 4s
    setTimeout(() => setRegSuccessMsg(null), 6000);
    setActiveTab("appointments");
  };

  // Cancel appointment handler
  const handleCancelAppointment = (id: string) => {
    if (window.confirm("您確定要取消此視訊看診預約嗎？")) {
      DataService.updateAppointmentStatus(id, "cancelled");
      setAppointments(DataService.getAppointmentsByPatient(user.id));
    }
  };

  return (
    <div id="patient-dashboard-view" className="max-w-6xl mx-auto my-6 px-4 animate-fade-in text-slate-300">
      
      {/* Patient header card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 flex flex-wrap items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold flex items-center justify-center text-xl shadow-lg border border-slate-800">
            {user.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{user.name} 病患</h2>
              <span className="text-[10px] bg-cyan-950 border border-cyan-800 text-cyan-400 px-2.5 py-0.5 rounded-full font-semibold uppercase">健保卡已登錄</span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              身分證號: <span className="font-mono text-slate-300">{user.healthCardId || "未填"}</span> | 生日: <span className="font-mono text-slate-300">{user.birthday || "未填"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("register")}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            線上門診掛號
          </button>
          
          <button
            onClick={onLogout}
            className="px-4 py-2 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            登出系統
          </button>
        </div>
      </div>

      {/* Tabs list switchers */}
      <div className="flex border-b border-slate-800 mb-6 gap-6">
        <button
          onClick={() => setActiveTab("appointments")}
          className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === "appointments" ? "text-cyan-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          查看門診預約 ({appointments.filter(a => a.status === "scheduled" || a.status === "calling").length})
          {activeTab === "appointments" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full"></span>}
        </button>
        
        <button
          onClick={() => setActiveTab("register")}
          className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === "register" ? "text-cyan-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          線上預約掛號
          {activeTab === "register" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full"></span>}
        </button>

        <button
          onClick={() => setActiveTab("records")}
          className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === "records" ? "text-cyan-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          就診紀錄與電子病歷 ({records.length})
          {activeTab === "records" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full"></span>}
        </button>
      </div>

      {/* REGISTRATION SUCCESS BANNER */}
      {regSuccessMsg && (
        <div className="bg-emerald-950/40 border border-emerald-900 rounded-xl p-4 mb-6 text-emerald-300 text-xs font-medium flex items-center gap-3 animate-fade-in shadow-sm">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />
          <span>{regSuccessMsg}</span>
        </div>
      )}

      {/* CONTENT BOARDS */}
      
      {/* Tab: View Appointments */}
      {activeTab === "appointments" && (
        <div id="appointments-tab-panel" className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-cyan-400" />
              就診中或已預約班表
            </h3>
            <span className="text-xs text-slate-400">診療當天，請提前5分鐘點選進入診間。</span>
          </div>

          {appointments.length === 0 ? (
            <div className="border border-slate-805 border-slate-800 rounded-2xl p-10 text-center bg-slate-900/40 backdrop-blur">
              <Stethoscope className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-300">目前尚無預約看診安排</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                如果您身體有些許不適或需要開立連續處方箋，可以點選上方「線上預約掛號」挑選適合班表。
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map((a) => (
                <div 
                  key={a.id} 
                  className={`border rounded-xl p-5 transition-all shadow-md flex flex-col justify-between ${
                    a.status === "calling" 
                      ? "border-amber-500 bg-amber-950/20 ring-1 ring-amber-500/20 shadow-lg" 
                      : a.status === "scheduled"
                      ? "border-slate-800 bg-slate-900 hover:border-slate-700"
                      : "border-slate-850 bg-slate-950/50"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center gap-1">
                        <Stethoscope className="w-3 h-3" />
                        {a.department}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                        a.status === "scheduled" 
                          ? "bg-blue-950/50 border-blue-900/60 text-blue-400" 
                          : a.status === "calling"
                          ? "bg-amber-950 border-amber-805 border-amber-800 text-amber-400 font-bold animate-pulse"
                          : a.status === "completed"
                          ? "bg-slate-950 border-slate-850 text-slate-550 text-slate-500"
                          : "bg-rose-950/40 border-rose-900/60 text-rose-450 text-rose-400"
                      }`}>
                        {a.status === "scheduled" && "已排定看診"}
                        {a.status === "calling" && "醫師已上線 - 看診中"}
                        {a.status === "completed" && "已完成看診"}
                        {a.status === "cancelled" && "已取消"}
                      </span>
                    </div>

                    <div className="flex items-start gap-3.5 mt-2">
                      <div className="w-10 h-10 rounded-full bg-slate-950 border-slate-800 border flex items-center justify-center text-slate-350 text-slate-300 font-bold text-sm shrink-0 uppercase">
                        {a.doctorName[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{a.doctorName} 醫師</h4>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>看診日期：{a.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>時段：{a.period === "morning" ? "上午診 (09:00 - 12:00)" : a.period === "afternoon" ? "下午診 (14:00 - 17:00)" : "夜間診 (18:00 - 21:00)"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-4 mt-4 flex items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-450 text-slate-400">
                      看診號碼：<strong className="text-cyan-400 text-xs">No.{a.slotNumber}</strong> 號
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Active video entry button for today's calling sessions */}
                      {(a.status === "scheduled" || a.status === "calling") && (
                        <button
                          onClick={() => onEnterConsultation(a)}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-md hover:scale-[1.02] transition-all cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5 text-slate-950" />
                          進入視訊診療間
                        </button>
                      )}

                      {a.status === "scheduled" && (
                        <button
                          onClick={() => handleCancelAppointment(a.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-455 hover:text-rose-400 rounded-lg hover:bg-slate-950 transition-colors cursor-pointer"
                          title="取消預約"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Online Registration */}
      {activeTab === "register" && (
        <div id="register-tab-panel" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4 mb-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BriefcaseMedical className="w-4.5 h-4.5 text-cyan-400" />
              雲端掛號窗口掛號中心
            </h3>
            <p className="text-xs text-slate-400 mt-1">選定科別、主治團隊與就診時間完成掛號。</p>
          </div>

          <form onSubmit={handleCreateAppointment} className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Step 1: Dept */}
            <div className="md:col-span-4 space-y-4">
              <label className="block text-xs font-bold text-slate-300">就診科別分類</label>
              <div className="grid grid-cols-2 gap-2">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSelectedDept(dept)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-2 cursor-pointer ${
                      selectedDept === dept 
                        ? "border-cyan-500 bg-cyan-950/40 text-cyan-400 shadow-md shadow-cyan-950/10" 
                        : "border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900 text-slate-400"
                    }`}
                  >
                    <Stethoscope className="w-4 h-4 mx-auto text-cyan-400" />
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Doctor list */}
            <div className="md:col-span-4 space-y-4">
              <label className="block text-xs font-bold text-slate-300">主治醫師名單</label>
              
              {filteredDoctors.length === 0 ? (
                <p className="text-xs text-slate-550 text-slate-500">當前科別無當值主治團隊人員。</p>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto scroll-thin pr-1">
                  {filteredDoctors.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                        selectedDocId === doc.id 
                          ? "border-cyan-500 bg-cyan-950/30" 
                          : "border-slate-800 bg-slate-950 hover:border-slate-705 hover:border-slate-700"
                      }`}
                    >
                      <img 
                        src={doc.photoUrl} 
                        alt={doc.name} 
                        className="w-10 h-10 rounded-full object-cover border border-slate-800"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{doc.name} 醫師</span>
                          <span className="text-[10px] text-cyan-400 bg-cyan-950 border border-cyan-900 px-1.5 py-0.5 rounded-md font-semibold">{doc.title}</span>
                        </div>
                        <p className="text-[10px] text-slate-450 mt-0.5 line-clamp-1">{doc.bio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 3: Date period selection */}
            <div className="md:col-span-4 space-y-4">
              <label className="block text-xs font-bold text-slate-300">日期與看診班表</label>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-450 text-slate-400 mb-1">看診日期</label>
                  <input
                    id="txt-dashboard-reg-date"
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none focus:bg-slate-900 transition-all font-mono text-white [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-450 text-slate-400 mb-1">時段選擇</label>
                  <select
                    id="select-dashboard-reg-period"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value as PeriodType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none focus:bg-slate-900 transition-all text-white [color-scheme:dark]"
                  >
                    <option value="morning">上午診 (09:00 - 12:00)</option>
                    <option value="afternoon">下午診 (14:00 - 17:00)</option>
                    <option value="evening">夜間診 (18:00 - 21:00)</option>
                  </select>
                </div>

                <button
                  id="btn-confirm-register"
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-955 font-bold text-xs py-2.5 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1 shadow-cyan-950/20"
                >
                  <CheckCircle className="w-4 h-4 text-slate-950" />
                  送出預約並登記掛號
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Medical Prescription and records */}
      {activeTab === "records" && (
        <div id="records-tab-panel" className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 pb-1">
            <FileText className="w-4 h-4 text-cyan-400" />
            歷次視訊診療病歷檔案與處方明細
          </h3>

          {records.length === 0 ? (
            <div className="border border-slate-805 border-slate-800 rounded-2xl p-10 text-center bg-slate-900/40">
              <Pill className="w-12 h-12 text-slate-655 text-slate-600 mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-300">查無任何已完診病歷資料</p>
              <p className="text-[11px] text-slate-500 mt-1">完診後由主治醫師填列存查處方將顯示於此。</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((r) => (
                <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl hover:border-slate-700 transition-all">
                  
                  {/* Record item card header */}
                  <div className="bg-slate-950 border-b border-slate-855 border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{r.date}</span>
                      <span className="text-xs text-slate-500 font-medium font-mono">ID: {r.id}</span>
                      <span className="text-[10px] bg-blue-950/50 border border-blue-900/40 text-blue-400 px-2 py-0.5 rounded font-semibold">{r.department}</span>
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      主治醫護：<span className="font-bold text-white">{r.doctorName} 醫師</span>
                    </div>
                  </div>

                  {/* Record detail description grids */}
                  <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-6 space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                          就診主訴紀錄 (Symptoms)
                        </h4>
                        <p className="text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-lg border border-slate-850 mt-1 leading-relaxed">
                          {r.symptoms}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                          診斷結果 (Diagnosis)
                        </h4>
                        <p className="text-xs text-slate-200 bg-slate-950/50 p-2.5 rounded-lg border border-slate-850 mt-1 leading-relaxed font-semibold">
                          {r.diagnosis}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                          處理解釋與衛教 (Treatment Details)
                        </h4>
                        <p className="text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-lg border border-slate-850 mt-1 leading-relaxed">
                          {r.treatment}
                        </p>
                      </div>
                    </div>

                    {/* Prescription sheet (處方箋 display card style) */}
                    <div className="md:col-span-6 bg-amber-950/10 border border-amber-900/30 rounded-xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 h-16 w-16 bg-amber-900/10 -rotate-45 translate-x-8 translate-y-[-16px] border border-amber-80 *0/10 hidden md:block"></div>
                      
                      <div className="flex items-center gap-2 border-b border-amber-900/30 pb-2 mb-3">
                        <Pill className="w-4 h-4 text-amber-400" />
                        <h4 className="text-xs font-bold text-amber-300">開立處方明細表 (Prescription Sheet)</h4>
                      </div>

                      <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-loose">
                        {r.prescription}
                      </pre>

                      <div className="border-t border-amber-900/30 pt-3 mt-4 text-[10px] text-amber-400/80 flex items-center justify-between">
                        <span>複查核發合格條碼編列完成</span>
                        <span className="font-bold text-amber-300">台灣健康保險署核備</span>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
