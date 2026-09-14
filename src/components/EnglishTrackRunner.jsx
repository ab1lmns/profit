import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, Volume2, Mic, Square, Play, Sparkles, Send,
  CheckCircle, ArrowRight, BookOpen, Layers, CheckCircle2, Circle, Headphones
} from "lucide-react";
import { ENGLISH_TRACK_TASKS } from "../data/english_tasks.js";
import { FloatingDecorations } from "./BrandElements.jsx";

export default function EnglishTrackRunner({ student, onSaveResult, onBack }) {
  const [selectedLevelId, setSelectedLevelId] = useState("level1");
  const [stage, setStage] = useState("menu"); // 'menu' | 'level1' | 'level2' | 'level3' | 'summary'

  const existingData = (student.results && student.results.english_multi) || {
    levels: {}
  };

  // Level 1: Grammar Test State
  const [q1Idx, setQ1Idx] = useState(0);
  const [q1Answers, setQ1Answers] = useState({});
  const [q1Picked, setQ1Picked] = useState(null);

  // Level 2: Reading Comprehension State
  const [q2Idx, setQ2Idx] = useState(0);
  const [q2Answers, setQ2Answers] = useState({});
  const [q2Picked, setQ2Picked] = useState(null);

  // Level 3: Listening & Speaking State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [lAnswers, setLAnswers] = useState({});
  const [lPicked, setLPicked] = useState(null);
  const [lIdx, setLIdx] = useState(0);

  // Speaking recorder state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState("");
  const [speakingTextFallback, setSpeakingTextFallback] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // TTS playback for Listening
  const handlePlayAudio = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(ENGLISH_TRACK_TASKS.levels[2].listening.transcriptText);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Ваш браузер не поддерживает синтез речи. Прочитайте текст диалога для ответа на вопросы.");
    }
  };

  // Voice recording handlers
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setRecordedAudioUrl(reader.result);
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Не удалось получить доступ к микрофону. Вы можете написать текст вашего ответа вручную.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Level 1: Submit Grammar Test
  const handleNextL1 = () => {
    if (q1Picked === null) return;
    const updated = { ...q1Answers, [q1Idx]: q1Picked };
    setQ1Answers(updated);

    const questions = ENGLISH_TRACK_TASKS.levels[0].questions;
    if (q1Idx === questions.length - 1) {
      let correct = 0;
      questions.forEach((q, i) => {
        if (updated[i] === q.c) correct++;
      });
      const pct = Math.round((correct / questions.length) * 100);

      const newLevels = {
        ...existingData.levels,
        level1: {
          correct,
          total: questions.length,
          pct,
          completedAt: new Date().toISOString()
        }
      };

      onSaveResult({
        ...existingData,
        levels: newLevels,
        completedAt: new Date().toISOString()
      });
      setStage("summary");
    } else {
      setQ1Idx(q1Idx + 1);
      setQ1Picked(null);
    }
  };

  // Level 2: Submit Reading Comprehension
  const handleNextL2 = () => {
    if (q2Picked === null) return;
    const updated = { ...q2Answers, [q2Idx]: q2Picked };
    setQ2Answers(updated);

    const questions = ENGLISH_TRACK_TASKS.levels[1].reading.questions;
    if (q2Idx === questions.length - 1) {
      let correct = 0;
      questions.forEach((q, i) => {
        if (updated[i] === q.c) correct++;
      });
      const pct = Math.round((correct / questions.length) * 100);

      const newLevels = {
        ...existingData.levels,
        level2: {
          correct,
          total: questions.length,
          pct,
          completedAt: new Date().toISOString()
        }
      };

      onSaveResult({
        ...existingData,
        levels: newLevels,
        completedAt: new Date().toISOString()
      });
      setStage("summary");
    } else {
      setQ2Idx(q2Idx + 1);
      setQ2Picked(null);
    }
  };

  // Level 3: Submit Listening & Speaking
  const handleSubmitL3 = () => {
    const questions = ENGLISH_TRACK_TASKS.levels[2].listening.questions;
    let listeningCorrect = 0;
    questions.forEach((q, i) => {
      if (lAnswers[i] === q.c) listeningCorrect++;
    });

    const newLevels = {
      ...existingData.levels,
      level3: {
        listening: {
          correct: listeningCorrect,
          total: questions.length,
          pct: Math.round((listeningCorrect / questions.length) * 100)
        },
        speaking: {
          audioUrl: recordedAudioUrl,
          textFallback: speakingTextFallback,
          submittedAt: new Date().toISOString(),
          reviewStatus: existingData.levels?.level3?.speaking?.reviewStatus || "pending",
          scores: existingData.levels?.level3?.speaking?.scores || {},
          totalScore: existingData.levels?.level3?.speaking?.totalScore || 0,
          feedback: existingData.levels?.level3?.speaking?.feedback || ""
        },
        completedAt: new Date().toISOString()
      }
    };

    onSaveResult({
      ...existingData,
      levels: newLevels,
      completedAt: new Date().toISOString()
    });
    setStage("summary");
  };

  return (
    <div className="relative min-h-screen bg-[#FAF9F6] text-slate-800 font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden pb-16">
      <FloatingDecorations />

      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between">
        <button
          onClick={stage === "menu" ? onBack : () => setStage("menu")}
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-white/80 hover:bg-white text-slate-600 border border-slate-200 shadow-xs transition-all"
        >
          <ArrowLeft size={14} /> {stage === "menu" ? "В личный кабинет" : "К списку уровней"}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-100 text-[#FF8A00] font-mono">
            Английский язык CEFR (3 Уровня)
          </span>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-8">
        {/* STAGE: MENU */}
        {stage === "menu" && (
          <div>
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#FF8A00] text-xs font-bold font-mono mb-3">
                <Layers size={14} /> Грамматика · Чтение (IT) · Аудирование & Говорение
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
                Аттестация по английскому языку
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                Комплексная оценка уровня владения техническим и разговорным английским языком для спецгруппы.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {ENGLISH_TRACK_TASKS.levels.map((lvl, index) => {
                const lvlData = existingData.levels[lvl.levelId];
                let isCompleted = false;
                let statusBadge = "Ожидает сдачи";

                if (lvl.levelId === "level1" && lvlData?.pct !== undefined) {
                  isCompleted = true;
                  statusBadge = `Сдано: ${lvlData.correct}/10 (${lvlData.pct}%)`;
                } else if (lvl.levelId === "level2" && lvlData?.pct !== undefined) {
                  isCompleted = true;
                  statusBadge = `Сдано: ${lvlData.correct}/5 (${lvlData.pct}%)`;
                } else if (lvl.levelId === "level3" && lvlData?.speaking?.submittedAt) {
                  isCompleted = true;
                  statusBadge = lvlData.speaking.reviewStatus === "graded"
                    ? `Оценка: ${lvlData.speaking.totalScore}/15 баллов`
                    : "На проверке у куратора";
                }

                return (
                  <div
                    key={lvl.levelId}
                    className="bg-white rounded-3xl p-6 border-2 border-orange-300/40 shadow-lg shadow-orange-500/5 flex flex-col justify-between hover:shadow-xl transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-mono text-xs font-bold text-slate-400">
                          УРОВЕНЬ {index + 1}
                        </span>
                        <span
                          className="px-3 py-0.5 rounded-full text-xs font-bold font-mono"
                          style={{
                            backgroundColor: `${lvl.badgeColor}15`,
                            color: lvl.badgeColor,
                            border: `1px solid ${lvl.badgeColor}30`,
                          }}
                        >
                          {lvl.badge}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 font-heading mb-2">
                        {lvl.levelName}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-6">
                        {lvl.desc}
                      </p>

                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/60 mb-6 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">Результат:</span>
                          <span className={`font-bold font-mono ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {statusBadge}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedLevelId(lvl.levelId);
                        if (lvl.levelId === "level1") {
                          setQ1Idx(0);
                          setQ1Answers({});
                          setQ1Picked(null);
                          setStage("level1");
                        } else if (lvl.levelId === "level2") {
                          setQ2Idx(0);
                          setQ2Answers({});
                          setQ2Picked(null);
                          setStage("level2");
                        } else {
                          setLIdx(0);
                          setLAnswers({});
                          setLPicked(null);
                          setStage("level3");
                        }
                      }}
                      className="w-full py-3.5 px-4 rounded-2xl font-bold text-white text-sm bg-[#22C55E] hover:bg-[#16A34A] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                    >
                      <span>{isCompleted ? "Пройти повторно" : "Начать"}</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STAGE: LEVEL 1 (Grammar Test) */}
        {stage === "level1" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl p-8 border-2 border-orange-300/40 shadow-xl shadow-orange-500/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF8A00] font-mono">
                  Level 1: Grammar & Vocabulary
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Question {q1Idx + 1} of {ENGLISH_TRACK_TASKS.levels[0].questions.length}
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-100 mb-8 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${((q1Idx + 1) / ENGLISH_TRACK_TASKS.levels[0].questions.length) * 100}%`,
                    background: "linear-gradient(90deg, #FF8A00 0%, #22C55E 100%)",
                  }}
                />
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading mb-6 leading-snug">
                {ENGLISH_TRACK_TASKS.levels[0].questions[q1Idx].q}
              </h2>

              <div className="space-y-3 mb-8">
                {ENGLISH_TRACK_TASKS.levels[0].questions[q1Idx].o.map((opt, idx) => {
                  const isSelected = q1Picked === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setQ1Picked(idx)}
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
                onClick={handleNextL1}
                disabled={q1Picked === null}
                className="w-full py-3.5 px-6 rounded-2xl font-bold text-white text-sm bg-[#22C55E] hover:bg-[#16A34A] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <span>{q1Idx === ENGLISH_TRACK_TASKS.levels[0].questions.length - 1 ? "Complete Test" : "Next Question"}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STAGE: LEVEL 2 (Reading Comprehension) */}
        {stage === "level2" && (
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Article text (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-300/40 shadow-xl overflow-y-auto max-h-[620px]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FF8A00] uppercase font-mono mb-2">
                <BookOpen size={14} /> Reading Passage
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 font-heading mb-4">
                {ENGLISH_TRACK_TASKS.levels[1].reading.title}
              </h2>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
                {ENGLISH_TRACK_TASKS.levels[1].reading.article}
              </div>
            </div>

            {/* Questions (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-300/40 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FF8A00] font-mono">
                    Comprehension Questions
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {q2Idx + 1} of {ENGLISH_TRACK_TASKS.levels[1].reading.questions.length}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 font-heading mb-5 leading-snug">
                  {ENGLISH_TRACK_TASKS.levels[1].reading.questions[q2Idx].q}
                </h3>

                <div className="space-y-3 mb-6">
                  {ENGLISH_TRACK_TASKS.levels[1].reading.questions[q2Idx].o.map((opt, idx) => {
                    const isSelected = q2Picked === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setQ2Picked(idx)}
                        className={`w-full text-left p-3.5 rounded-2xl flex items-center gap-3 transition-all text-xs font-medium ${
                          isSelected
                            ? "bg-orange-50/70 border-2 border-[#FF8A00] text-slate-900 shadow-xs"
                            : "bg-[#FAF9F6] border border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                            isSelected ? "border-[#FF8A00] bg-[#FF8A00] text-white" : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected ? <CheckCircle2 size={12} /> : null}
                        </div>
                        <span className="flex-1">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleNextL2}
                disabled={q2Picked === null}
                className="w-full py-3.5 px-5 rounded-2xl font-bold text-white text-xs bg-[#22C55E] hover:bg-[#16A34A] active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <span>{q2Idx === ENGLISH_TRACK_TASKS.levels[1].reading.questions.length - 1 ? "Complete Reading Task" : "Next Question"}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STAGE: LEVEL 3 (Listening & Speaking) */}
        {stage === "level3" && (
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Part 1: Listening (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-300/40 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#FF8A00] uppercase font-mono mb-2">
                  <Headphones size={15} /> Part A: Listening Comprehension
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 font-heading mb-4">
                  {ENGLISH_TRACK_TASKS.levels[2].listening.title}
                </h3>

                {/* Audio player button */}
                <div className="p-4 bg-orange-50/70 rounded-2xl border border-orange-200/80 mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-orange-950">Audio Track (English US)</div>
                    <div className="text-[11px] text-orange-700">Listen carefully to answer questions</div>
                  </div>
                  <button
                    onClick={handlePlayAudio}
                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-all ${
                      isPlayingAudio ? "bg-red-500 animate-pulse" : "bg-[#FF8A00] hover:bg-[#E67A00]"
                    }`}
                  >
                    <Volume2 size={15} />
                    <span>{isPlayingAudio ? "Playing..." : "Play Audio"}</span>
                  </button>
                </div>

                {/* Listening Question */}
                <div className="space-y-4">
                  <div className="text-xs font-bold text-slate-500 font-mono">
                    Question {lIdx + 1} of {ENGLISH_TRACK_TASKS.levels[2].listening.questions.length}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {ENGLISH_TRACK_TASKS.levels[2].listening.questions[lIdx].q}
                  </h4>

                  <div className="space-y-2.5">
                    {ENGLISH_TRACK_TASKS.levels[2].listening.questions[lIdx].o.map((opt, idx) => {
                      const isSelected = lPicked === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setLPicked(idx);
                            setLAnswers(prev => ({ ...prev, [lIdx]: idx }));
                          }}
                          className={`w-full text-left p-3 rounded-xl flex items-center gap-2.5 text-xs transition-all ${
                            isSelected
                              ? "bg-orange-50 border-2 border-[#FF8A00] text-slate-900 font-bold"
                              : "bg-slate-50 border border-slate-200 text-slate-700"
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full border ${isSelected ? "border-[#FF8A00] bg-[#FF8A00]" : "border-slate-300"}`} />
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                <button
                  disabled={lIdx === 0}
                  onClick={() => {
                    setLIdx(lIdx - 1);
                    setLPicked(lAnswers[lIdx - 1] ?? null);
                  }}
                  className="text-xs font-bold text-slate-500 disabled:opacity-30"
                >
                  ← Previous
                </button>
                <button
                  disabled={lIdx === ENGLISH_TRACK_TASKS.levels[2].listening.questions.length - 1}
                  onClick={() => {
                    setLIdx(lIdx + 1);
                    setLPicked(lAnswers[lIdx + 1] ?? null);
                  }}
                  className="text-xs font-bold text-[#FF8A00] disabled:opacity-30"
                >
                  Next Audio Question →
                </button>
              </div>
            </div>

            {/* Part 2: Speaking (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-300/40 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase font-mono mb-2">
                  <Mic size={15} /> Part B: Speaking & Voice Response
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 font-heading mb-3">
                  {ENGLISH_TRACK_TASKS.levels[2].speaking.title}
                </h3>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 mb-4 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {ENGLISH_TRACK_TASKS.levels[2].speaking.prompt}
                </div>

                {/* Recorder Control */}
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-600 text-white'}`}>
                      <Mic size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        {isRecording ? "Recording Audio..." : recordedAudioUrl ? "Voice Recording Saved" : "Record Your Answer"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {isRecording ? "Click Stop when finished" : "Speak 1 - 2 minutes in English"}
                      </div>
                    </div>
                  </div>

                  {isRecording ? (
                    <button
                      onClick={handleStopRecording}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                    >
                      <Square size={13} fill="white" /> Stop
                    </button>
                  ) : (
                    <button
                      onClick={handleStartRecording}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                    >
                      <Mic size={13} /> {recordedAudioUrl ? "Re-record" : "Start"}
                    </button>
                  )}
                </div>

                {recordedAudioUrl && (
                  <div className="mb-4">
                    <audio controls src={recordedAudioUrl} className="w-full h-10" />
                  </div>
                )}

                {/* Text Fallback */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    Or write your speech transcript / notes (text fallback):
                  </label>
                  <textarea
                    value={speakingTextFallback}
                    onChange={(e) => setSpeakingTextFallback(e.target.value)}
                    placeholder="Hello, my name is... I am applying for the special IT development group because..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#FF8A00] h-20 resize-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmitL3}
                disabled={!recordedAudioUrl && !speakingTextFallback.trim()}
                className="w-full py-3.5 px-6 rounded-2xl font-bold text-white text-sm bg-[#22C55E] hover:bg-[#16A34A] active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 mt-4"
              >
                <Send size={16} />
                <span>Submit Speaking & Listening Level</span>
              </button>
            </div>
          </div>
        )}

        {/* STAGE: SUMMARY */}
        {stage === "summary" && (
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-3xl p-8 border-2 border-orange-300/40 shadow-xl shadow-orange-500/5">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 text-[#16A34A] rounded-2xl flex items-center justify-center">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 font-heading mb-2">
                Уровень английского сдан!
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Результаты грамматики и чтения подсчитаны, а аудиозапись говорения передана куратору для экспертной оценки по шкале CEFR.
              </p>

              <button
                onClick={() => setStage("menu")}
                className="w-full py-3.5 px-6 rounded-2xl font-bold text-white text-sm bg-[#22C55E] hover:bg-[#16A34A] active:scale-[0.98] transition-all shadow-md shadow-emerald-600/20"
              >
                Вернуться к списку уровней
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
