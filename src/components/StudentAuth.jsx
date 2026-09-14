import React, { useState } from "react";
import { ArrowLeft, User, Mail, GraduationCap, ArrowRight, Sparkles } from "lucide-react";
import { ProfitLogo, FloatingDecorations } from "./BrandElements.jsx";
import { StudentIllustration } from "./Illustrations.jsx";

export default function StudentAuth({ onBack, onLogin, students }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [grade, setGrade] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Пожалуйста, укажите имя и email");
      return;
    }
    const existing = students.find((s) => s.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      onLogin(existing);
      return;
    }
    const student = {
      id: `st_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      email: email.trim(),
      grade: grade.trim(),
      createdAt: new Date().toISOString(),
      results: {},
    };
    onLogin(student, true);
  };

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

      {/* Content Form */}
      <div className="relative z-10 max-w-md w-full mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl p-8 border-2 border-orange-300/40 shadow-xl shadow-orange-500/5">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100">
              <StudentIllustration className="w-14 h-14" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 font-heading mb-1">
              Регистрация ученика
            </h1>
            <p className="text-xs text-slate-500">
              Если вы уже сдавали тесты, введите тот же email для входа в профиль
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <User size={13} className="text-[#FF8A00]" />
                Имя и фамилия
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#FF8A00] focus:bg-white text-sm transition-colors"
                placeholder="Иван Иванов"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Mail size={13} className="text-[#FF8A00]" />
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#FF8A00] focus:bg-white text-sm transition-colors"
                placeholder="ivan@school.edu.kz"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <GraduationCap size={13} className="text-[#FF8A00]" />
                Учебная группа
              </label>
              <input
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#FF8A00] focus:bg-white text-sm transition-colors"
                placeholder="ИС-21, ВТ-32, ПИ-11..."
              />
            </div>

            {error && (
              <div className="text-xs text-red-500 bg-red-50 p-2.5 rounded-xl border border-red-200 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-5 rounded-2xl font-bold text-white text-sm bg-[#22C55E] hover:bg-[#16A34A] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 mt-2"
            >
              <span>Продолжить к тестам</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="relative z-10 text-center pb-6 text-xs text-slate-400">
        ProfIT Platform · Отбор в спецгруппу
      </div>
    </div>
  );
}
