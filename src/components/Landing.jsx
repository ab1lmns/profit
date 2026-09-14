import React from "react";
import { ArrowRight, Sparkles, BookOpen, UserCheck, ShieldCheck, CheckCircle2 } from "lucide-react";
import { TRACKS } from "../data/tracks.js";
import { QUESTION_BANKS } from "../data/questions.js";
import { ProfitLogo, FloatingDecorations } from "./BrandElements.jsx";

export default function Landing({ goStudent, goAdmin }) {
  return (
    <div className="relative min-h-screen bg-[#FAF9F6] text-slate-800 font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden">
      {/* Background organic graphics & geometric floating dots */}
      <FloatingDecorations />

      {/* Top Navigation Bar */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ProfitLogo className="w-11 h-11" />
          <div>
            <div className="text-xl font-extrabold tracking-tight text-slate-900 font-heading flex items-center gap-1.5">
              Prof<span className="text-[#FF8A00]">IT</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                Спецгруппа
              </span>
            </div>
            <div className="text-xs text-slate-400 font-medium hidden sm:block">
              Отбор и распределение учащихся
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={goAdmin}
            className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200 shadow-xs transition-all flex items-center gap-1.5"
          >
            Кабинет учителя
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-12 sm:pt-16 pb-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-xs font-bold tracking-wider uppercase mb-5 shadow-xs">
            <Sparkles size={14} className="text-[#FF8A00]" />
            Цифровая образовательная платформа
          </div>

          {/* Main Title */}
          <h1 className="text-5xl sm:text-7xl font-extrabold text-[#FF8A00] font-heading tracking-tight mb-3">
            ProfIT
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl font-semibold text-slate-700 font-heading tracking-wide mb-4">
            отбор и распределение в специальную группу разработки
          </p>

          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed mb-8">
            Пройдите комплексное тестирование по IT-стеку (HTML/CSS, JavaScript, Python, C#) и английскому языку CEFR.
            Получите персональную оценку уровня и рекомендацию для зачисления!
          </p>

          {/* Primary CTA Buttons in Hero */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <button
              onClick={goStudent}
              className="w-full sm:w-auto py-3.5 px-8 rounded-2xl font-bold text-white text-sm bg-[#22C55E] hover:bg-[#16A34A] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <span>Пройти тестирование</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={goAdmin}
              className="w-full sm:w-auto py-3.5 px-7 rounded-2xl font-bold text-slate-700 text-sm bg-white/90 hover:bg-white border-2 border-slate-200 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Я преподаватель</span>
            </button>
          </div>
        </div>

        {/* Tracks Section */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm max-w-5xl mx-auto mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#FF8A00] font-mono mb-1">
                Направления тестирования
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                5 специализированных треков
              </h2>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600">
              <BookOpen size={14} className="text-[#FF8A00]" />
              Взвешенная система оценки
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRACKS.map((t) => {
              const count = QUESTION_BANKS[t.id] ? QUESTION_BANKS[t.id].length : 6;
              return (
                <div
                  key={t.id}
                  className="p-5 rounded-2xl bg-[#FAF9F6] border border-slate-200/80 hover:border-orange-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-xs border border-slate-200/60">
                        <t.icon size={20} style={{ color: t.accent }} />
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-400">
                        #{t.no}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base mb-1 font-heading">
                      {t.label}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      {t.id === "english"
                        ? "Проверка грамматики и словарного запаса (A1–C2)"
                        : `${count} вопросов: теория, синтаксис и практические задачи`}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {t.id === "english" ? "Шкала CEFR" : "3 уровня сложности"}
                    </span>
                    <button
                      onClick={goStudent}
                      className="text-[#FF8A00] hover:text-[#E67A00] font-bold flex items-center gap-1"
                    >
                      Сдать <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How it works: 3 Steps */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mb-2">
              Как проходит отбор?
            </h3>
            <p className="text-sm text-slate-500">Простой и прозрачный процесс зачисления в группу</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF8A00] font-extrabold flex items-center justify-center font-heading text-lg mb-4">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2 font-heading">Регистрация</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Введите имя, email и группу. Профиль сохранится, и вы сможете продолжить в любое время.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#16A34A] font-extrabold flex items-center justify-center font-heading text-lg mb-4">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2 font-heading">Тестирование</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Пройдите все или выбранные направления. Ответы проверяются мгновенно алгоритмом платформы.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-[#0F766E] font-extrabold flex items-center justify-center font-heading text-lg mb-4">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2 font-heading">Зачисление</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Преподаватель видит баллы, формирует состав спецгруппы и распределяет по проектам.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <footer className="pt-8 border-t border-slate-200 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <ProfitLogo className="w-6 h-6" />
            <span className="font-bold text-slate-700 font-heading">ProfIT Platform</span>
            <span>· Отбор в спецгруппу разработки</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={goAdmin} className="hover:text-slate-800 underline">
              Панель администратора
            </button>
            <span>© {new Date().getFullYear()} ProfIT</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
