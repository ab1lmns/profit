import React from "react";
import { C, TRACKS } from "../data/tracks.js";
import { TECH_LEVELS } from "../data/questions.js";

export function LevelBadge({ level, trackId }) {
  const color =
    trackId === "english" ? "#FF8A00" : (TECH_LEVELS.find((l) => l.label === level) || {}).color || "#64748B";
  return (
    <span
      className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full shadow-sm"
      style={{
        backgroundColor: `${color}15`,
        border: `1px solid ${color}40`,
        color: color,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {level}
    </span>
  );
}

export function Rule() {
  return <div className="border-t border-slate-200/80 my-2" />;
}

export function PrimaryButton({ children, onClick, style, type = "button", disabled, className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 text-sm font-bold text-white rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
      style={{ background: "#22C55E", ...style }}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, style, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 text-sm font-bold rounded-2xl transition-all duration-200 border-2 bg-white/80 hover:bg-white active:scale-95 flex items-center justify-center gap-2 ${className}`}
      style={{ borderColor: "#E2E8F0", color: "#1E293B", ...style }}
    >
      {children}
    </button>
  );
}
