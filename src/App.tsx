/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Stethoscope, Mail, ShieldAlert, Sparkles, AlertCircle, 
  HelpCircle, User, ArrowRight, ShieldCheck, Video, HeartPulse, Activity
} from "lucide-react";
import { DataService } from "./services/dataService";
import { PatientRegister } from "./components/PatientRegister";
import { PatientDashboard } from "./components/PatientDashboard";
import { DoctorDashboard } from "./components/DoctorDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { VirtualConsultation } from "./components/VirtualConsultation";
import { UserProfile, Appointment } from "./types";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => DataService.getCurrentUser());
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Selected video consultation session mapping
  const [activeConsultationAppt, setActiveConsultationAppt] = useState<Appointment | null>(null);

  // Sync session changes
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsRegistering(false);
    setLoginError(null);
  };

  const handleLogout = () => {
    DataService.setCurrentUser(null);
    setCurrentUser(null);
    setActiveConsultationAppt(null);
    setIsRegistering(false);
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;

    const res = DataService.login(loginEmail.trim());
    if (res.success && res.user) {
      handleLoginSuccess(res.user);
    } else {
      setLoginError(res.error || "查無此登記電子郵箱或密碼錯誤。");
    }
  };

  // Helper shortcut click login
  const handleShortcutLogin = (email: string) => {
    setLoginEmail(email);
    const res = DataService.login(email);
    if (res.success && res.user) {
      handleLoginSuccess(res.user);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300">
      
      {/* Top medical navigation header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-white shadow-lg shrink-0">
            <HeartPulse className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5 leading-none">
              遠距醫療線上諮詢系統 
              <span className="text-[10px] bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold px-2 py-0.5 rounded-full uppercase scale-90">
                Telehealth Link
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">台灣全民衛福遠距看診安全標準合格平台</p>
          </div>
        </div>

        {currentUser ? (
          <div className="flex items-center gap-3 text-xs bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <User className="w-3.5 h-3.5 text-slate-405 text-slate-400" />
            <span className="font-semibold text-slate-200">{currentUser.name}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500 text-slate-950 uppercase tracking-wider">
              {currentUser.role === "patient" ? "病患" : currentUser.role === "doctor" ? "醫師" : "管理員"}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 font-semibold bg-cyan-950/40 px-3 py-1.5 rounded-xl border border-cyan-900 hidden sm:flex">
            <ShieldCheck className="w-4 h-4" />
            線上伺服器模組：就緒運作中
          </div>
        )}
      </header>

      {/* Main Container screen routing */}
      <main className="py-6 min-h-[calc(100vh-140px)]">
        
        {/* Route 1: Active Video consultation full-screen override */}
        {currentUser && activeConsultationAppt ? (
          <div className="max-w-6xl mx-auto px-4">
            <VirtualConsultation 
              appointment={activeConsultationAppt}
              currentUserRole={currentUser.role}
              onBack={() => {
                setActiveConsultationAppt(null);
                // Refresh records when returning to dashboard
                window.location.reload();
              }}
              onDiagnose={() => {
                // If doctor, they can fill record and save on returning screen
                setActiveConsultationAppt(null);
              }}
            />
          </div>
        ) : (
          // Standard login / dashboard screens
          <div className="px-4">
            
            {currentUser ? (
              // Dashboard Routing based on account level
              <>
                {currentUser.role === "patient" && (
                  <PatientDashboard 
                    user={currentUser}
                    onEnterConsultation={(appt) => setActiveConsultationAppt(appt)}
                    onLogout={handleLogout}
                  />
                )}

                {currentUser.role === "doctor" && (
                  <DoctorDashboard 
                    doctorUser={currentUser}
                    onEnterConsultation={(appt) => setActiveConsultationAppt(appt)}
                    onLogout={handleLogout}
                  />
                )}

                {currentUser.role === "admin" && (
                  <AdminDashboard 
                    onLogout={handleLogout}
                  />
                )}
              </>
            ) : isRegistering ? (
              // Registration Desk Form
              <PatientRegister 
                onSuccess={(user) => handleLoginSuccess(user)}
                onBackToLogin={() => setIsRegistering(false)}
              />
            ) : (
              // LOGIN CARD PORTAL
              <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl overflow-hidden animate-scale-up">
                
                {/* Visual Header */}
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-950/25 flex items-center justify-center border border-white/20 mb-3 shadow">
                    <Stethoscope className="w-6 h-6 text-cyan-300 animate-pulse" />
                  </div>
                  <h3 className="font-extrabold text-base tracking-tight text-white">遠距復健診療掛號前台</h3>
                  <p className="text-xs text-slate-100/90 mt-1 font-medium">請選擇您的就診帳號，或直接採用快速測試通道。</p>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  
                  {/* Shortcut test accounts list */}
                  <div className="space-y-2.5">
                    <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 fill-cyan-950/50" />
                      快速測試通道（一鍵自動登入就緒）
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => handleShortcutLogin("patient@telehealth.com")}
                        className="p-3 text-left bg-slate-950/55 border border-slate-800 hover:border-cyan-500 hover:bg-cyan-950/20 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <strong className="text-xs text-slate-200 font-bold block group-hover:text-cyan-400">病患端 測試登入</strong>
                          <span className="text-[10px] text-slate-400">王小明 (已登錄健保卡身分照)</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:transform group-hover:translate-x-1 group-hover:text-cyan-400 transition-all" />
                      </button>

                      <button
                        onClick={() => handleShortcutLogin("doctor@telehealth.com")}
                        className="p-3 text-left bg-slate-950/55 border border-slate-800 hover:border-cyan-500 hover:bg-cyan-950/20 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <strong className="text-xs text-slate-200 font-bold block group-hover:text-cyan-400">醫護端 測試登入</strong>
                          <span className="text-[10px] text-slate-400">林志豪 主任醫師 (家醫科)</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:transform group-hover:translate-x-1 group-hover:text-cyan-400 transition-all" />
                      </button>

                      <button
                        onClick={() => handleShortcutLogin("admin@telehealth.com")}
                        className="p-3 text-left bg-slate-950/55 border border-slate-800 hover:border-cyan-500 hover:bg-cyan-950/20 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <strong className="text-xs text-slate-200 font-bold block group-hover:text-cyan-400">最高管理員 測試登入</strong>
                          <span className="text-[10px] text-slate-400">登入系統，配置醫師執照與統計 dashboard</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:transform group-hover:translate-x-1 group-hover:text-cyan-400 transition-all" />
                      </button>
                    </div>
                  </div>

                  {/* Standard login separators */}
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-850"></div>
                    <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">或以手動註冊之郵箱</span>
                    <div className="flex-grow border-t border-slate-850"></div>
                  </div>

                  {/* Manual sign in Form */}
                  <form onSubmit={handleFormLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">
                        電子郵聯信箱 (Email)
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                          id="txt-login-email"
                          type="email"
                          placeholder="例如: test@example.com"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-3 py-2 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none focus:bg-slate-900 transition-all text-white placeholder-slate-550"
                        />
                      </div>
                    </div>

                    {loginError && (
                      <div className="p-3 bg-rose-950/50 border border-rose-920/50 rounded-lg text-rose-300 text-xs font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{loginError}</span>
                      </div>
                    )}

                    <button
                      id="btn-login-submit"
                      type="submit"
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center"
                    >
                      驗證並登入系統
                    </button>
                  </form>

                  {/* Register link */}
                  <div className="text-center pt-2 border-t border-slate-850">
                    <p className="text-xs text-slate-400">
                      尚未有遠距看診帳戶？{" "}
                      <button
                        onClick={() => setIsRegistering(true)}
                        className="text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                      >
                        免費智慧註冊掛號帳戶
                      </button>
                    </p>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer bar */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-center text-[10px] leading-relaxed select-none">
        <p>© 2026 Telehealth Link Co. 遠距看診過卡醫療系統. 版權所有.</p>
        <p className="mt-1 text-slate-500">
          系統建置標準符合：HPA 台灣通訊診療防護安全標準、GDPR 數據隱私保護法案。
        </p>
      </footer>

    </div>
  );
}
