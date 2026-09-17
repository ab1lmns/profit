import { Monitor, Globe, Box, Calculator, Palette, PenTool, BookOpen, Languages } from "lucide-react";

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
  { id: "it-solutions", label: "ИТ-решения", no: "01", icon: Monitor, accent: "#3B82F6" },
  { id: "web-technologies", label: "Веб-технологии", no: "02", icon: Globe, accent: "#22C55E" },
  { id: "3d-modeling", label: "3D моделирование", no: "03", icon: Box, accent: "#8B5CF6" },
  { id: "1c-accounting", label: "1С бухгалтерия", no: "04", icon: Calculator, accent: "#F59E0B" },
  { id: "graphic-design", label: "Графический дизайн", no: "05", icon: Palette, accent: "#EC4899" },
  { id: "industrial-design", label: "Промышленный дизайн", no: "06", icon: PenTool, accent: "#14B8A6" },
  { id: "subject-disciplines", label: "Предметные дисциплины", no: "07", icon: BookOpen, accent: "#334B66" },
  { id: "english", label: "Английский язык", no: "08", icon: Languages, accent: "#A6402F" },
];
