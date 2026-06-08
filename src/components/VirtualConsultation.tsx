/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Video, VideoOff, Mic, MicOff, PhoneOff, Send, MessageSquare, 
  Activity, Radio, Shield, Heart, FileText, CheckCircle2 
} from "lucide-react";
import { Appointment } from "../types";

interface VirtualConsultationProps {
  appointment: Appointment;
  currentUserRole: "patient" | "doctor" | "admin";
  onBack: () => void;
  onDiagnose?: () => void; // If doctor, triggers diagnosis action
}

interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: string;
  text: string;
  time: string;
}

export function VirtualConsultation({ 
  appointment, 
  currentUserRole, 
  onBack,
  onDiagnose 
}: VirtualConsultationProps) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [heartRate, setHeartRate] = useState(72);
  const [signalStrength, setSignalStrength] = useState("極佳");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_1",
      senderName: "系統導引",
      senderRole: "system",
      text: "歡迎進入視訊看診診間。本診療室採用端對端視訊加密傳輸，看診過程符合通訊診療法規。請確保您的鏡頭與麥克風已正常開啟。",
      time: "現在"
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-connect effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnected(true);
      // Post a welcome message based on role
      if (currentUserRole === "patient") {
        setMessages(prev => [
          ...prev,
          {
            id: `msg_rec_1`,
            senderName: `${appointment.doctorName} 醫師`,
            senderRole: "doctor",
            text: `王先生您好，我是${appointment.doctorName}醫師。我已經上線了，請問今天身體有哪裡不舒服嗎？`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else if (currentUserRole === "doctor") {
        setMessages(prev => [
          ...prev,
          {
            id: `msg_rec_2`,
            senderName: `${appointment.patientName} 病患`,
            senderRole: "patient",
            text: "醫師好，我已經進入視訊畫面了，聲音和畫面都聽得到、看得清。",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentUserRole, appointment]);

  // Simulate heart rate changes
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      setHeartRate(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = prev + delta;
        return next > 90 ? 82 : next < 60 ? 68 : next;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [isConnected]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const myName = currentUserRole === "doctor" ? `${appointment.doctorName} 醫師` : `${appointment.patientName}`;
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderName: myName,
      senderRole: currentUserRole,
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newMsg]);
    setChatInput("");

    // Simulate doctor/patient response in 2 seconds
    setTimeout(() => {
      if (currentUserRole === "patient") {
        setMessages(prev => [
          ...prev,
          {
            id: `msg_reply_${Date.now()}`,
            senderName: `${appointment.doctorName} 醫師`,
            senderRole: "doctor",
            text: "收到，明白您的狀況，我們稍後進行線上診斷與開藥程序。",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else if (currentUserRole === "doctor") {
        setMessages(prev => [
          ...prev,
          {
            id: `msg_reply_${Date.now()}`,
            senderName: `${appointment.patientName}`,
            senderRole: "patient",
            text: "好的，謝謝醫師，我待會再依指示到附近的社區藥局過卡領藥。",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    }, 2000);
  };

  return (
    <div id="telehealth-consultation-room" className="bg-slate-900 border border-slate-805 border-slate-800 text-white rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[calc(100vh-140px)] min-h-[500px]">
      
      {/* Header indicators */}
      <div className="bg-slate-950 px-6 py-4 flex flex-wrap items-center justify-between border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected ? "bg-emerald-400" : "bg-amber-400"} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? "bg-emerald-500" : "bg-amber-500"}`}></span>
          </span>
          <div>
            <h2 className="font-semibold text-sm tracking-tight flex items-center gap-2 text-slate-100">
              通訊診療診室
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-405 text-cyan-400 font-bold uppercase">
                {appointment.department}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              預約號碼: No.{appointment.slotNumber} | 醫師: {appointment.doctorName} | 病患: {appointment.patientName}
            </p>
          </div>
        </div>

        {isConnected && (
          <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <Activity className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span>病患心率: <strong className="text-rose-450 text-rose-400">{heartRate} BPM</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 hidden sm:flex">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>訊號強度: <strong className="text-cyan-400">{signalStrength}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-cyan-950/40 px-3 py-1.5 rounded-lg border border-cyan-900/60 text-cyan-300">
              <Shield className="w-3.5 h-3.5" />
              <span>資安加密中</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-slate-900">
        
        {/* Videos Area */}
        <div className="flex-1 p-4 flex flex-col justify-between relative min-h-[280px]">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full relative">
            
            {/* Primary View (Doctor's Feed / Large local) */}
            <div id="video-feed-1" className="relative bg-slate-950 rounded-xl overflow-hidden border border-slate-805 border-slate-800 shadow-inner flex items-center justify-center min-h-[160px]">
              {isVideoOn && isConnected ? (
                <>
                  <img 
                    src={currentUserRole === "doctor" 
                      ? "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80" // If current role is doctor, display patient feed large
                      : "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&auto=format&fit=crop&q=80" // If current is patient, display doctor feed large
                    } 
                    alt="Active Video Feed"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 px-2 py-1 rounded text-xs font-medium text-slate-200 border border-slate-800">
                    {currentUserRole === "doctor" ? `${appointment.patientName} (病患端)` : `${appointment.doctorName} 醫師 (醫護端)`}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-cyan-500/80 text-slate-950 text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold flex items-center gap-1 shadow">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-950 animate-ping"></span>
                    LIVE - 1080P
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="h-16 w-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shadow-md">
                    <VideoOff className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-slate-400 mt-3 font-medium">醫護端視訊鏡頭關閉中</p>
                </div>
              )}
            </div>

            {/* Sub View (Patient's Feed / Minor panel) */}
            <div id="video-feed-2" className="relative bg-slate-950 rounded-xl overflow-hidden border border-slate-805 border-slate-800 shadow-inner flex items-center justify-center min-h-[160px]">
              {isVideoOn ? (
                <>
                  <img 
                    src={currentUserRole === "doctor" 
                      ? "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&auto=format&fit=crop&q=80" // If doctor, small feed is doctor
                      : "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80" // If patient, small feed is patient
                    } 
                    alt="My Feed"
                    className="w-full h-full object-cover scale-x-[-1]" // mirror effect
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 px-2 py-1 rounded text-xs font-medium text-slate-200 border border-slate-800">
                    您自己 ({currentUserRole === "doctor" ? "醫師" : "病患"})
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-950 border border-slate-800 text-cyan-400 text-[10px] px-1.5 py-0.5 rounded-md font-mono">
                    本地鏡頭 {!isAudioOn && "已靜音"}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 shadow-md">
                    <VideoOff className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-505 text-slate-500 mt-2 font-medium">您的鏡頭已關閉</p>
                </div>
              )}
            </div>

          </div>

          {/* Floating Media Controls Overlay */}
          <div className="flex justify-center gap-3 pt-4 pb-2 z-10">
            <button 
              id="btn-toggle-mic"
              onClick={() => setIsAudioOn(!isAudioOn)}
              className={`p-3.5 rounded-full transition-all duration-200 shadow-lg border hover:scale-105 cursor-pointer ${
                isAudioOn 
                  ? "bg-slate-800 hover:bg-slate-755 hover:bg-slate-700 border-slate-700 text-cyan-400" 
                  : "bg-rose-950/60 hover:bg-rose-900 border-rose-900 text-rose-400"
              }`}
              title={isAudioOn ? "關閉麥克風" : "開啟麥克風"}
            >
              {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button 
              id="btn-toggle-camera"
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3.5 rounded-full transition-all duration-200 shadow-lg border hover:scale-105 cursor-pointer ${
                isVideoOn 
                  ? "bg-slate-800 hover:bg-slate-755 hover:bg-slate-700 border-slate-700 text-cyan-400" 
                  : "bg-rose-950/60 hover:bg-rose-900 border-rose-900 text-rose-400"
              }`}
              title={isVideoOn ? "關閉相機" : "開啟相機"}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            {currentUserRole === "doctor" && onDiagnose && (
              <button
                id="btn-doctor-diagnose"
                onClick={onDiagnose}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-950" />
                填寫並存取病歷檔案
              </button>
            )}

            <button 
              id="btn-hangup"
              onClick={onBack}
              className="px-5 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs tracking-wide flex items-center gap-2 shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              結束診療通話
            </button>
          </div>

        </div>

        {/* Chat Panel & Details Right Hand side */}
        <div className="w-full lg:w-[350px] border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-950 flex flex-col h-[280px] lg:h-full">
          
          <div className="p-4 border-b border-slate-900 flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-950 header-chat">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>診間即時對話視窗 (含加密防護)</span>
          </div>

          {/* Messages container list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scroll-thin">
            {messages.map((m) => {
              const isMe = (currentUserRole === "doctor" && m.senderRole === "doctor") ||
                           (currentUserRole === "patient" && m.senderRole === "patient");
              if (m.senderRole === "system") {
                return (
                  <div key={m.id} className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-900/40 text-[11px] text-cyan-300 leading-relaxed font-sans">
                    {m.text}
                  </div>
                );
              }
              return (
                <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-0.5">
                    <span className="font-medium text-slate-450">{m.senderName}</span>
                    <span>• {m.time}</span>
                  </div>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    isMe 
                      ? "bg-cyan-500 text-slate-950 rounded-tr-none font-bold" 
                      : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/55"
                  }`}>
                    {m.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Form panel */}
          <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-900 flex items-center gap-2">
            <input 
              id="txt-consultation-chat-input"
              type="text"
              placeholder="輸入訊息給醫師或病患..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-transparent font-medium"
            />
            <button 
              id="btn-submit-consultation-chat"
              type="submit"
              className="p-2 bg-cyan-400 text-slate-950 rounded-lg hover:bg-cyan-300 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-slate-950" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
