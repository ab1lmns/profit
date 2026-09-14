import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, Circle, Sparkles, Award, ArrowRight } from "lucide-react";
import { TRACKS } from "../data/tracks.js";
import { QUESTION_BANKS, scoreTrack } from "../data/questions.js";
import { ProfitLogo, FloatingDecorations } from "./BrandElements.jsx";
import { StudentIllustration } from "./Illustrations.jsx";

export function TestRunner({ trackId, onFinish, onCancel }) {
  const track = TRACKS.find((t) => t.id === trackId) || TRACKS[0];
  const bank = QUESTION_BANKS[trackId] || [];
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState({});
  const [picked, setPicked] = useState(null);

  const q = bank[qi];
  const isLast = qi === bank.length - 1;

  const next = () => {
    if (picked === null) return;
    const updated = { ...answers, [qi]: picked };
    setAnswers(updated);
    if (isLast) {
      onFinish(scoreTrack(trackId, updated));
    } else {
      setQi(qi + 1);
      setPicked(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FAF9F6] text-slate-800 font-sans selection:bg-orange-100 selection:text-orange-900 flex flex-col justify-between overflow-x-hidden pb-12">
      <FloatingDecorations />

      {/* Top Bar */}
      <header className="relative z-10 max-w-4xl mx-auto w-full px-6 pt-6 flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-600 border border-slate-200 shadow-xs transition-all"
        >
          <ArrowLeft size={14} /> Прервать
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-100 text-[#FF8A00] font-mono">
            {track.label}
          </span>
          <span className="text-xs font-semibold text-slate-500 font-mono">
            Вопрос {qi + 1} из {bank.length}
          </span>
        </div>
      </header>

      {/* Question Card */}
      <main className="relative z-10 max-w-2xl w-full mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-300/40 shadow-xl shadow-orange-500/5">
          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-100 mb-8 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${((qi + 1) / bank.length) * 100}%`,
                background: "linear-gradient(90deg, #FF8A00 0%, #22C55E 100%)",
              }}
            />
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading mb-6 leading-snug">
            {q.q}
          </h2>

          <div className="space-y-3 mb-8">
            {q.o.map((opt, idx) => {
              const isSelected = picked === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setPicked(idx)}
                  className={`w-full text-left p-4 rounded-2xl flex items-center gap-3.5 transition-all text-sm font-medium ${
                    isSelected
                      ? "bg-orange-50/70 border-2 border-[#FF8A00] text-slate-900 shadow-xs"
                      : "bg-[#FAF9F6] border border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                      isSelected
                        ? "border-[#FF8A00] bg-[#FF8A00] text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected ? <CheckCircle2 size={14} /> : <Circle size={10} className="text-transparent" />}
                  </div>
                  <span className="flex-1">{opt}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={next}
            disabled={picked === null}
            className="w-full py-3.5 px-6 rounded-2xl font-bold text-white text-sm bg-[#22C55E] hover:bg-[#16A34A] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <span>{isLast ? "Завершить тест" : "Следующий вопрос"}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </main>

      <div className="relative z-10 text-center text-xs text-slate-400">
        ProfIT Platform · Тестирование
      </div>
    </div>
  );
}

export function TestResult({ trackId, result, onBack }) {
  const track = TRACKS.find((t) => t.id === trackId) || TRACKS[0];

  return (
    <div className="relative min-h-screen bg-[#FAF9F6] text-slate-800 font-sans selection:bg-orange-100 selection:text-orange-900 flex flex-col justify-between overflow-x-hidden pb-12">
      <FloatingDecorations />

      <header className="relative z-10 max-w-4xl mx-auto w-full px-6 pt-6 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <ProfitLogo className="w-8 h-8" />
          <span className="font-extrabold font-heading text-slate-900">ProfIT</span>
        </div>
      </header>

      <main className="relative z-10 max-w-md w-full mx-auto px-6 py-8 text-center">
        <div className="bg-white rounded-3xl p-8 border-2 border-orange-300/40 shadow-xl shadow-orange-500/5">
          <div className="w-20 h-20 mx-auto mb-4 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100">
            <StudentIllustration className="w-16 h-16" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-[#FF8A00] text-xs font-bold uppercase font-mono mb-3">
            {track.label} · Результат
          </div>

          <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-heading mb-2">
            {result.level}
          </div>

          <p className="text-sm text-slate-500 mb-6">
            Правильных ответов: <strong className="text-slate-800">{result.correctCount} из {result.total}</strong> ({result.pct}%)
          </p>

          <button
            onClick={onBack}
            className="w-full py-3.5 px-6 rounded-2xl font-bold text-white text-sm bg-[#22C55E] hover:bg-[#16A34A] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <span>Вернуться в личный кабинет</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </main>

      <div className="relative z-10 text-center text-xs text-slate-400">
        Результат успешно сохранен в профиле
      </div>
    </div>
  );
}
