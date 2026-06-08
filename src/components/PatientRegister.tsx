/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { 
  Upload, Sparkles, User, FileImage, CreditCard, Mail, 
  Phone, Calendar, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, Loader2 
} from "lucide-react";
import { DataService } from "../services/dataService";
import { UserProfile } from "../types";

interface PatientRegisterProps {
  onSuccess: (user: UserProfile) => void;
  onBackToLogin: () => void;
}

export function PatientRegister({ onSuccess, onBackToLogin }: PatientRegisterProps) {
  // Form fields
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [healthCardId, setHealthCardId] = useState("");
  
  // OCR and Image states
  const [cardPhotoBase64, setCardPhotoBase64] = useState<string | null>(null);
  const [cardPhotoUrl, setCardPhotoUrl] = useState<string | null>(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState<boolean | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert File to base64
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setOcrError("請上傳有效的健保卡圖片檔案 (png, jpeg, jpg)。");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64String = reader.result as string;
      setCardPhotoUrl(base64String); // For local preview

      // Keep only base64 data for API (strip mime meta)
      const dataOnly = base64String.split(",")[1];
      setCardPhotoBase64(dataOnly);
      
      // Clear previous OCR states
      setOcrSuccess(null);
      setOcrError(null);
      
      // Trigger Gemini Multimodal OCR
      await performOcr(dataOnly, file.type);
    };
    reader.onerror = () => {
      setOcrError("讀取高解析度健保卡照片失敗。");
    };
  };

  const performOcr = async (base64Data: string, mimeType: string) => {
    setIsOcrLoading(true);
    setOcrError(null);

    try {
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Data,
          mimeType: mimeType,
        }),
      });

      const result = await res.json();
      if (result.success && result.data) {
        if (result.data.name) {
          setName(result.data.name);
        }
        if (result.data.id) {
          setHealthCardId(result.data.id);
        }
        setOcrSuccess(true);
      } else {
        setOcrError(result.error || "無法從健保卡中提取欄位，可能相片角度有偏差，您仍可採手動輸入。");
      }
    } catch (err: any) {
      console.error("Gemini Card OCR Failed:", err);
      setOcrError("伺服器 AI 掛號模組連線異常，請手動輸入健保卡資料。");
    } finally {
      setIsOcrLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Submit registration form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim() || !phone.trim() || !birthday || !healthCardId.trim()) {
      alert("請填寫所有必要掛號與個人資料欄位。");
      return;
    }

    try {
      const newUser = DataService.register({
        email,
        name,
        role: "patient",
        phone,
        birthday,
        gender,
        healthCardId,
        healthCardPhotoUrl: cardPhotoUrl || undefined,
      });

      // Automatically sign in the user
      DataService.setCurrentUser(newUser);
      onSuccess(newUser);
    } catch (err: any) {
      console.error("Register Error:", err);
      alert("帳號註冊失敗，請重試。");
    }
  };

  return (
    <div id="patient-registration-screen" className="max-w-4xl mx-auto my-6 bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl overflow-hidden animate-fade-in text-slate-300">
      
      {/* Banner design */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-8 text-white relative">
        <div className="absolute top-4 right-4 bg-cyan-950/60 border border-cyan-805 border-cyan-800 text-cyan-400 rounded-full px-3 py-1 text-xs backdrop-blur font-medium flex items-center gap-1.5 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
          資安部特許安全控管
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-2">
          遠距醫療病患註冊登錄
        </h2>
        <p className="text-slate-100/95 text-sm max-w-xl font-medium leading-relaxed">
          建立您的醫療就診個人化帳戶。為落實健保雲端遠距看診過卡及複查身分，請上傳健保卡照片，我們將為您自動由系統讀取登錄資訊。
        </p>
      </div>

      <div className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Panel: Upload Health Insurance Card photo */}
          <div className="md:col-span-6 flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 mb-1 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-405 text-cyan-400" />
                步驟一：上傳健保卡照片（智慧 OCR 申報）
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                將使用 Gemini AI 安全模型自動擷取卡面姓名與統一編號
              </p>
            </div>

            {/* Drag drop zone container */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 min-h-[220px] ${
                dragActive 
                  ? "border-cyan-400 bg-cyan-950/20" 
                  : cardPhotoUrl 
                  ? "border-slate-700 bg-slate-950" 
                  : "border-slate-805 border-slate-800 hover:border-cyan-500 hover:bg-slate-950/20 bg-slate-950/5"
              }`}
            >
              <input 
                id="file-healthcard-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {cardPhotoUrl ? (
                <div className="w-full flex flex-col items-center gap-4">
                  <div className="relative w-full max-w-[280px] h-40 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 shadow-inner">
                    <img 
                      src={cardPhotoUrl} 
                      alt="Health Card Preview" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-slate-205 text-slate-200 flex items-center justify-center gap-1">
                      <FileImage className="w-3.5 h-3.5 text-cyan-400" />
                      已更換健保卡相片
                    </p>
                    <span className="text-[10px] text-slate-500">點此區域可重上傳照片</span>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center text-slate-500 border border-slate-800 shadow-sm">
                    <Upload className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-xs font-semibold text-slate-300">
                    拖曳檔案至此 或 <span className="text-cyan-400 font-bold hover:underline">瀏覽本機檔案</span>
                  </p>
                  <p className="text-[10px] text-slate-500">支持 PNG, JPG, JPEG 等高解析度健保卡相片</p>
                </div>
              )}
            </div>

            {/* OCR Processing & feedback messages */}
            {isOcrLoading && (
              <div className="bg-cyan-955/40 bg-cyan-950/20 border border-cyan-800 rounded-xl p-4 flex items-center gap-3.5 animate-pulse text-cyan-300">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                <div className="text-xs">
                  <p className="font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 fill-cyan-950 animate-bounce" />
                    Gemini AI 智慧健保卡辨識中...
                  </p>
                  <p className="text-[10px] text-cyan-400/85 mt-0.5">正在提取晶片卡片姓名及身分證號</p>
                </div>
              </div>
            )}

            {ocrSuccess && (
              <div className="bg-emerald-950/40 border border-emerald-900 rounded-xl p-4 flex items-center gap-3 text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold">✓ 健保卡資料辨識成功</p>
                  <p className="text-[10px] text-emerald-400/85 mt-0.5">已自動將姓名與身分證字號填入右側欄位，請檢查修正。</p>
                </div>
              </div>
            )}

            {ocrError && (
              <div className="bg-amber-950/30 border border-amber-900 rounded-xl p-4 flex items-center gap-3 text-amber-300">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold">提醒：健保卡辨識稍有落差</p>
                  <p className="text-[10px] text-amber-400/85 mt-0.5">{ocrError}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Fields form */}
          <div className="md:col-span-6 flex flex-col gap-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 mb-1 flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                步驟二：確認註冊與診療通聯檔案
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                請確認您註冊本診所之通訊醫療個人帳號
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  電子郵件 (登入帳號) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    id="txt-register-email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-3 py-2 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none focus:bg-slate-900 transition-all text-white placeholder-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  真實姓名 <span className="text-rose-500">*</span>
                </label>
                <input
                  id="txt-register-name"
                  type="text"
                  placeholder="姓名 (上傳自動辨識)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none focus:bg-slate-900 transition-all font-medium text-white placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  身分證字號 <span className="text-rose-500">*</span>
                </label>
                <input
                  id="txt-register-cardid"
                  type="text"
                  placeholder="身分證編號"
                  value={healthCardId}
                  onChange={(e) => setHealthCardId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none focus:bg-slate-900 transition-all font-mono font-medium text-white placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  電話號碼 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    id="txt-register-phone"
                    type="tel"
                    placeholder="0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none focus:bg-slate-900 transition-all font-mono text-white placeholder-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  性別 <span className="text-rose-500">*</span>
                </label>
                <select
                  id="select-register-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none focus:bg-slate-900 transition-all text-white [color-scheme:dark]"
                >
                  <option value="male">男 (Male)</option>
                  <option value="female">女 (Female)</option>
                  <option value="other">其他 (Other)</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  出生年月日 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    id="txt-register-birthday"
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-3 py-2 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none focus:bg-slate-900 transition-all font-mono text-white [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            {/* Terms reminder */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-[10px] text-slate-400 leading-relaxed mt-1">
              個人資料保護聲明：當前診療登錄所填寫、辨識和生成的所有電子病歷跟健保卡影本資訊，皆經 128-bit SSL 數位加密封鎖，嚴格禁止任何未授權之第三方醫療及銷售機構存取讀取。
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                id="btn-perform-register"
                type="submit"
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs tracking-wide py-2.5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                註冊並自動登入
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                id="btn-return-login"
                type="button"
                onClick={onBackToLogin}
                className="px-4 py-2.5 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 rounded-xl text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                返回登入
              </button>
            </div>

          </div>

        </form>
      </div>

    </div>
  );
}
