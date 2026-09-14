import { LayoutGrid, Code2, Terminal, FileCode2, Languages } from "lucide-react";

export const C = {
  paper: "#FAF9F6",
  paperDeep: "#F1EFE7",
  ink: "#1E293B",
  inkSoft: "#64748B",
  rule: "#E2E8F0",
  orange: "#FF8A00",
  orangeLight: "#FFF4E6",
  orangeBorder: "#FFD8A8",
  green: "#22C55E",
  greenDark: "#16A34A",
  greenLight: "#EBFBEE",
  teal: "#4EBA97",
  blue: "#3B82F6",
  blueDeep: "#0F172A",
  red: "#EF4444",
  card: "#FFFFFF",
};

export const TRACKS = [
  { id: "htmlcss", label: "HTML/CSS", no: "01", icon: LayoutGrid, accent: "#B4863A" },
  { id: "js", label: "JavaScript", no: "02", icon: Code2, accent: "#3F6B4F" },
  { id: "python", label: "Python", no: "03", icon: Terminal, accent: "#334B66" },
  { id: "csharp", label: "C#", no: "04", icon: FileCode2, accent: "#6A4C93" },
  { id: "english", label: "Английский (CEFR)", no: "05", icon: Languages, accent: "#A6402F" },
];
