import React, { useState } from "react";
import { ArrowLeft, Lock, Mail, KeyRound, ArrowRight } from "lucide-react";
import { ProfitLogo, FloatingDecorations } from "./BrandElements.jsx";
import { TeacherIllustration } from "./Illustrations.jsx";

export default function AdminLogin({ onBack, onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  return (
    <div className="relative min-h-screen bg-[#FAF9F6] text-slate-800 font-sans selection:bg-orange-100 selection:text-orange-900 flex flex-col justify-between overflow-x-hidden">
      <FloatingDecorations />

      {/* Top Header */}
      <div className="relative z-10 max-w-5xl mx-auto w-full px-6 pt-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-600 border border-slate-200 shadow-xs transition-all"
        >
          <ArrowLeft size={14} /> На главную
        </button>

        <div className="flex items-center gap-2">
          <ProfitLogo className="w-8 h-8" />
          <span className="font-extrabold font-heading text-slate-900">
            Prof<span className="text-[#FF8A00]">IT</span>
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="relative z-10 max-w-md w-full mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl p-8 border-2 border-orange-300/40 shadow-xl shadow-orange-500/5">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
              <TeacherIllustration className="w-14 h-14" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 font-heading mb-1">
              Кабинет преподавателя
            </h1>
            <p className="text-xs text-slate-500">
              Вход для кураторов, учителей и экспертов приёмной комиссии
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onLogin(email || "Преподаватель спецгруппы");
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Mail size={13} className="text-[#FF8A00]" />
                Email преподавателя
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#FF8A00] focus:bg-white text-sm transition-colors"
                placeholder="teacher@profit.kz"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <KeyRound size={13} className="text-[#FF8A00]" />
                Пароль доступа
              </label>
              <input
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                type="password"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#FF8A00] focus:bg-white text-sm transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-5 rounded-2xl font-bold text-white text-sm bg-[#22C55E] hover:bg-[#16A34A] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 mt-2"
            >
              <span>Войти в систему</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="relative z-10 text-center pb-6 text-xs text-slate-400">
        ProfIT Platform · Панель куратора
      </div>
    </div>
  );
}
