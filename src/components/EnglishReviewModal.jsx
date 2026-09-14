import React, { useState } from "react";
import { X, CheckCircle, Volume2, Mic, Award, MessageSquare } from "lucide-react";
import { ENGLISH_TRACK_TASKS } from "../data/english_tasks.js";

export default function EnglishReviewModal({ student, onClose, onSaveGrade }) {
  const speakingConfig = ENGLISH_TRACK_TASKS.levels[2].speaking;
  const englishMulti = student.results?.english_multi?.levels || {};
  const speakingData = englishMulti.level3?.speaking || {};
  const listeningData = englishMulti.level3?.listening || {};

  const [scores, setScores] = useState(
    speakingData.scores || {
      fluency: 4,
      vocabulary: 5,
      structure: 4,
    }
  );
  const [cefrGrade, setCefrGrade] = useState(speakingData.cefrGrade || "B2");
  const [feedback, setFeedback] = useState(speakingData.feedback || "");

  const totalScore = Object.values(scores).reduce((a, b) => Number(a) + Number(b), 0);

  const handleScoreChange = (id, val) => {
    setScores(prev => ({ ...prev, [id]: Number(val) }));
  };

  const handleSave = () => {
    onSaveGrade(student.id, "english", "level3", {
      reviewStatus: "graded",
      scores,
      totalScore,
      cefrGrade,
      feedback,
      gradedAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-mono">
                English (CEFR) · Level 3 Speaking Review
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Студент: <strong className="text-slate-800">{student.name}</strong> ({student.grade || "Без группы"})
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 font-heading">
              Оценка говорения и аудирования
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-12 gap-6 my-4 flex-1 overflow-y-auto pr-1">
          {/* Left Col: Audio playback & Student answer (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="text-xs font-bold text-slate-500 font-mono mb-2 uppercase">
                1. Результат аудирования (Listening)
              </div>
              <div className="text-sm font-bold text-slate-800">
                {listeningData.correct !== undefined
                  ? `Верно ответов: ${listeningData.correct}/${listeningData.total} (${listeningData.pct}%)`
                  : "Не пройдено"}
              </div>
            </div>

            {/* Audio Voice Recording */}
            <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 font-mono mb-3 uppercase">
                <Mic size={14} /> 2. Запись устного ответа студента (Speaking Audio)
              </div>

              {speakingData.audioUrl ? (
                <div className="bg-white p-3 rounded-xl border border-emerald-200 mb-3">
                  <audio controls src={speakingData.audioUrl} className="w-full" />
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic mb-3">Аудиозапись не прикреплена</div>
              )}

              {speakingData.textFallback && (
                <div>
                  <div className="text-[11px] font-bold text-slate-600 mb-1">Текстовая расшифровка / заметки студента:</div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {speakingData.textFallback}
                  </div>
                </div>
              )}
            </div>

            {/* Topic Prompt reminder */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-700">Тема задания:</strong> Самопрезентация, выбор стека разработки и идея IT-проекта для спецгруппы ProfIT.
            </div>
          </div>

          {/* Right Col: Grading & CEFR level assignment (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Критерии оценки CEFR
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Итого: {totalScore} / 15 баллов
                </span>
              </div>

              {/* CEFR Level Picker */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Присвоенный уровень CEFR:
                </label>
                <div className="grid grid-cols-6 gap-1">
                  {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setCefrGrade(lvl)}
                      className={`py-1.5 rounded-lg font-bold text-xs transition-all ${
                        cefrGrade === lvl
                          ? "bg-[#FF8A00] text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rubric items */}
              {speakingConfig.rubric.map((item) => (
                <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800">{item.label}</span>
                    <span className="text-xs font-extrabold text-[#FF8A00] font-mono">
                      {scores[item.id] || 0} / {item.maxScore}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={item.maxScore}
                    value={scores[item.id] || 0}
                    onChange={(e) => handleScoreChange(item.id, e.target.value)}
                    className="w-full accent-[#FF8A00] cursor-pointer"
                  />
                </div>
              ))}

              {/* Feedback text */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <MessageSquare size={13} className="text-[#FF8A00]" />
                  Фидбек по английской речи:
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Good fluency and rich technical vocabulary..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#FF8A00] h-16 resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-3 px-4 rounded-xl font-bold text-white text-xs bg-[#22C55E] hover:bg-[#16A34A] transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 mt-4"
            >
              <CheckCircle size={15} />
              <span>Сохранить оценку по Английскому</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
