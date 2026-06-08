/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Users, UserCheck, Shield, BarChart3, Trash2, Edit, Plus, CheckCircle, 
  TrendingUp, Calendar, BookOpen, Stethoscope, BriefcaseMedical, Phone 
} from "lucide-react";
import { DataService } from "../services/dataService";
import { UserProfile, DoctorProfile, StatsDashboard, UserRole } from "../types";

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<"stats" | "users" | "doctors">("stats");
  
  // Dynamic state loaded from storage/DataService
  const [users, setUsers] = useState<UserProfile[]>(() => DataService.getUsers());
  const [doctors, setDoctors] = useState<DoctorProfile[]>(() => DataService.getDoctors());
  const [stats, setStats] = useState<StatsDashboard>(() => DataService.getStatsDashboard());

  // Add Doctor Form states
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocEmail, setNewDocEmail] = useState("");
  const [newDocDept, setNewDocDept] = useState("家醫科");
  const [newDocTitle, setNewDocTitle] = useState("主治醫師");
  const [newDocBio, setNewDocBio] = useState("");

  const refreshData = () => {
    setUsers(DataService.getUsers());
    setDoctors(DataService.getDoctors());
    setStats(DataService.getStatsDashboard());
  };

  // User removal handler
  const handleDeleteUser = (id: string, name: string) => {
    if (window.confirm(`當前刪除操作為不可逆！您確定要徹底註銷病患/醫護帳號【${name}】嗎？`)) {
      DataService.deleteUser(id);
      refreshData();
    }
  };

  // Convert Role handler
  const handleRoleChange = (id: string, newRole: UserRole) => {
    DataService.updateUserRole(id, newRole);
    refreshData();
  };

  // Doctor Form creation handler
  const handleAddDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName || !newDocEmail) {
      alert("請完整編寫醫師真實姓名與電子郵件。");
      return;
    }

    // First register the user profile
    const registeredUser = DataService.register({
      email: newDocEmail,
      name: newDocName,
      role: "doctor",
    });

    // Overwrite default profile
    const updatedDoc: DoctorProfile = {
      id: registeredUser.id,
      name: newDocName,
      email: newDocEmail,
      department: newDocDept,
      title: newDocTitle,
      bio: newDocBio || `${newDocName}醫師正式進駐本院${newDocDept}醫療團隊。`,
      photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300",
      schedule: [
        { dayOfWeek: 1, period: "morning", maxSlot: 15 },
        { dayOfWeek: 3, period: "afternoon", maxSlot: 15 },
        { dayOfWeek: 4, period: "evening", maxSlot: 15 }
      ]
    };
    
    DataService.saveDoctorProfile(updatedDoc);
    
    // Clear fields & refresh
    setNewDocName("");
    setNewDocEmail("");
    setNewDocBio("");
    setShowAddDoctor(false);
    refreshData();
  };

  // Helper values for department distribution
  const totalWeight = stats.departmentDistribution.reduce((acc, curr) => acc + curr.value, 0) || 1;

  return (
    <div id="admin-dashboard-view" className="max-w-6xl mx-auto my-6 px-4 animate-fade-in text-slate-300">
      
      {/* Admin control banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 mb-6 flex flex-wrap items-center justify-between gap-6 shadow-xl border border-slate-805 border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-slate-950">
            <Shield className="w-5.5 h-5.5 text-slate-950" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              遠距醫療掛號與線上診斷 ‧ 雲端中央后台
            </h2>
            <p className="text-xs text-cyan-400 font-medium font-semibold uppercase">權限階級: 系統最高防護管理員 (Root)</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl bg-slate-950 transition-colors cursor-pointer"
        >
          安全登出后台
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-805 border-slate-800 mb-6 gap-6">
        <button
          onClick={() => setActiveTab("stats")}
          className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === "stats" ? "text-cyan-400" : "text-slate-455 text-slate-400 hover:text-slate-200"
          }`}
        >
          數據儀表板 (Dashboard)
          {activeTab === "stats" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full"></span>}
        </button>
        
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === "users" ? "text-cyan-400" : "text-slate-455 text-slate-400 hover:text-slate-200"
          }`}
        >
          就診用戶管理 ({users.length})
          {activeTab === "users" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full"></span>}
        </button>

        <button
          onClick={() => setActiveTab("doctors")}
          className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === "doctors" ? "text-cyan-400" : "text-slate-455 text-slate-400 hover:text-slate-200"
          }`}
        >
          主治醫師團隊與排班及登錄 ({doctors.length})
          {activeTab === "doctors" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full"></span>}
        </button>
      </div>

      {/* Tab 1: Stats Board */}
      {activeTab === "stats" && (
        <div id="stats-tab-panel" className="space-y-6">
          
          {/* Key KPI numbers */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md text-center">
              <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">就診總病患</span>
              <strong className="text-2xl text-white block mt-1">{stats.totalPatients}</strong>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md text-center">
              <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">執照醫護員</span>
              <strong className="text-2xl text-white block mt-1">{stats.totalDoctors}</strong>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md text-center">
              <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">累計門診掛號</span>
              <strong className="text-2xl text-cyan-400 block mt-1">{stats.totalAppointments}</strong>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md text-center">
              <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">完診結算</span>
              <strong className="text-2xl text-emerald-400 block mt-1">{stats.completedAppointments}</strong>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md text-center col-span-2 lg:col-span-1">
              <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">解約/取消預約</span>
              <strong className="text-2xl text-rose-450 text-rose-400 block mt-1">{stats.cancelledAppointments}</strong>
            </div>
          </div>

          {/* Graphical Analytics (SVG charts) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Widget 1: Dept distribution */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
              <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-1">
                <BriefcaseMedical className="w-4 h-4 text-cyan-400" />
                就診人次科別分配比例
              </h3>
              
              <div className="space-y-4">
                {stats.departmentDistribution.map((d) => {
                  const pct = Math.round((d.value / totalWeight) * 100);
                  return (
                    <div key={d.name}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-200">{d.name}</span>
                        <span className="text-slate-400 font-medium">{d.value} 人次 ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-850">
                        <div 
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all" 
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Widget 2: Appointment Trend */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
              <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                日前就診預約掛號增減趨勢線 (每日掛號人次)
              </h3>

              <div className="h-44 flex items-end gap-2 px-2 pt-4">
                {stats.appointmentTrend.map((t, idx) => {
                  // Max visit count baseline
                  const maxCount = Math.max(...stats.appointmentTrend.map(i => i.count), 1);
                  const hPercentage = (t.count / maxCount) * 85 + 10; // offset index
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="w-full bg-slate-950 border border-slate-850 flex flex-col justify-end h-32 rounded-lg hover:bg-slate-800/20 transition-colors relative">
                        <div 
                          className="bg-gradient-to-t from-blue-500 to-cyan-500 rounded-lg absolute bottom-0 left-0 right-0 group-hover:from-blue-400 group-hover:to-cyan-400 transition-all flex items-center justify-center text-[9px] text-slate-950 font-bold font-mono"
                          style={{ height: `${hPercentage}%` }}
                        >
                          {t.count > 0 && t.count}
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-450 text-slate-400 font-mono tracking-tighter truncate max-w-full">
                        {t.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Quick info alerts */}
          <div className="p-4 bg-cyan-950/20 border border-cyan-800 rounded-xl text-cyan-300 text-xs font-medium leading-relaxed">
            系統管理提醒：當前系統運作正常。所有在線視訊看診通話採用 WebRTC 標準，看診紀錄與電子病歷已加密編碼。
          </div>

        </div>
      )}

      {/* Tab 2: Users Management list */}
      {activeTab === "users" && (
        <div id="users-tab-panel" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <h3 className="text-xs font-bold text-white">在冊病患與臨床醫護帳戶</h3>
            <span className="text-xs text-slate-455 text-slate-405 font-medium font-mono">共計 {users.length} 名用戶</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-350 border-collapse">
              <thead>
                <tr className="border-b border-slate-805 border-slate-800 bg-slate-950 font-bold text-slate-205 text-slate-200">
                  <th className="p-3">用戶名稱</th>
                  <th className="p-3">電子郵箱</th>
                  <th className="p-3">當前權限角色</th>
                  <th className="p-3 font-mono">註冊日期</th>
                  <th className="p-3 text-right">管理操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-950/40">
                    <td className="p-3 font-bold text-white">{u.name}</td>
                    <td className="p-3 font-mono">{u.email}</td>
                    <td className="p-3">
                      <select
                        id={`select-user-role-${u.id}`}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2.5 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold [color-scheme:dark]"
                      >
                        <option value="patient">病患 (Patient)</option>
                        <option value="doctor">醫師 (Doctor)</option>
                        <option value="admin">系統管理員 (Admin)</option>
                      </select>
                    </td>
                    <td className="p-3 font-mono text-slate-500 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-950 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 justify-end font-semibold text-[11px]"
                        title="註銷帳戶"
                      >
                        <Trash2 className="w-4 h-4" />
                        銷帳
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Doctors Management list */}
      {activeTab === "doctors" && (
        <div id="doctors-tab-panel" className="space-y-6">
          
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-1">
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              主治醫師班表配置中心
            </h3>

            {!showAddDoctor && (
              <button
                onClick={() => setShowAddDoctor(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-cyan-950/20"
              >
                <Plus className="w-4 h-4" />
                新增在院執配醫師
              </button>
            )}
          </div>

          {/* Add Doctor Panel form */}
          {showAddDoctor && (
            <form onSubmit={handleAddDoctorSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl flex flex-col gap-4 max-w-xl animate-scale-up">
              <h4 className="font-bold text-xs text-white border-b border-slate-800 pb-2">登錄新進執業醫師</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-slate-450 text-slate-400 mb-1">醫師真實姓名 *</label>
                  <input
                    id="txt-adddoc-name"
                    type="text"
                    required
                    placeholder="例如: 王建國"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none focus:bg-slate-900 text-white placeholder-slate-655 placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">電子郵件地 (醫護登入用) *</label>
                  <input
                    id="txt-adddoc-email"
                    type="email"
                    required
                    placeholder="email@telehealth.com"
                    value={newDocEmail}
                    onChange={(e) => setNewDocEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none focus:bg-slate-900 text-white placeholder-slate-655 placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">診療科別歸納 *</label>
                  <select
                    id="select-adddoc-dept"
                    value={newDocDept}
                    onChange={(e) => setNewDocDept(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-cyan-500 text-white [color-scheme:dark]"
                  >
                    <option value="家醫科">家醫科 (Family Medicine)</option>
                    <option value="小兒科">小兒科 (Pediatrics)</option>
                    <option value="內科">內科 (Internal Medicine)</option>
                    <option value="皮膚科">皮膚科 (Dermatology)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">職稱與銜級 *</label>
                  <select
                    id="select-adddoc-title"
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-cyan-500 text-white [color-scheme:dark]"
                  >
                    <option value="主治醫師">主治醫師</option>
                    <option value="主任醫師">主任醫師</option>
                    <option value="副教授醫師">副教授醫師</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-405 text-slate-400 mb-1">特別資歷與專長介紹 *</label>
                <textarea
                  id="txt-adddoc-bio"
                  rows={2}
                  placeholder="請簡單敘述醫師臨床經驗、長處（例如：專攻心臟疾病、氣喘）..."
                  value={newDocBio}
                  onChange={(e) => setNewDocBio(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none focus:bg-slate-900 text-white font-sans placeholder-slate-600"
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  id="btn-adddoc-cancel"
                  type="button"
                  onClick={() => setShowAddDoctor(false)}
                  className="px-4 py-2 border border-slate-800 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-800 hover:border-slate-700 cursor-pointer"
                >
                  取消
                </button>
                <button
                  id="btn-adddoc-save"
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-955 text-xs font-bold rounded-lg shadow-md cursor-pointer"
                >
                  確認儲存登錄
                </button>
              </div>
            </form>
          )}

          {/* Doctors profiles card list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doc) => (
              <div key={doc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex gap-4">
                <img 
                  src={doc.photoUrl} 
                  alt={doc.name} 
                  className="w-16 h-16 rounded-full object-cover border border-slate-800 shrink-0 shadow-md"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <strong className="text-sm text-white">{doc.name} 醫師</strong>
                      <span className="ml-1.5 text-[9px] bg-cyan-950 border border-cyan-800 font-bold text-cyan-400 px-1.5 py-0.5 rounded">
                        {doc.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-405 text-slate-450 font-mono">科別: {doc.department}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">{doc.bio}</p>
                  
                  {/* Schedules badges */}
                  <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap gap-1.5">
                    {doc.schedule.map((s, idx) => (
                      <span key={idx} className="text-[9px] bg-slate-950 border border-slate-850 text-slate-400 px-1.5 py-0.5 rounded font-mono font-medium">
                        W{s.dayOfWeek} {s.period === "morning" ? "上午" : s.period === "afternoon" ? "下午" : "夜間"} ({s.maxSlot}診)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
