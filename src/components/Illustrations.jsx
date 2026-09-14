import React from "react";

// 1. Student / Graduate Illustration (Thumbs up, graduate hat, holding books)
export function StudentIllustration({ className = "w-full h-48" }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soft backdrop circle */}
        <circle cx="100" cy="100" r="80" fill="#FFF7ED" />
        
        {/* Character Body / Robe */}
        <path d="M50 180C50 145 70 135 100 135C130 135 150 145 150 180H50Z" fill="#1E293B" />
        {/* White shirt collar & red tie */}
        <polygon points="100,135 90,150 110,150" fill="#FFFFFF" />
        <polygon points="100,146 95,170 100,175 105,170" fill="#EF4444" />

        {/* Neck */}
        <rect x="92" y="115" width="16" height="24" rx="4" fill="#FDBA74" />

        {/* Head */}
        <circle cx="100" cy="105" r="26" fill="#FED7AA" />
        
        {/* Cheerful face */}
        {/* Eyes (happy curves) */}
        <path d="M90 104C92 101 96 101 98 104" stroke="#7C2D12" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M102 104C104 101 108 101 110 104" stroke="#7C2D12" strokeWidth="2.5" strokeLinecap="round" />
        {/* Smile */}
        <path d="M95 114C98 119 102 119 105 114" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
        {/* Rosy cheeks */}
        <circle cx="88" cy="111" r="3.5" fill="#FCA5A5" opacity="0.6" />
        <circle cx="112" cy="111" r="3.5" fill="#FCA5A5" opacity="0.6" />

        {/* Orange Hair */}
        <path d="M74 102C74 88 84 82 100 82C116 82 126 88 126 102C126 104 122 96 114 94C106 92 94 92 86 94C78 96 74 104 74 102Z" fill="#EA580C" />
        <path d="M76 96C72 105 74 115 76 118C78 112 80 106 82 102" fill="#EA580C" />
        <path d="M124 96C128 105 126 115 124 118C122 112 120 106 118 102" fill="#EA580C" />

        {/* Graduation Cap (Mortarboard) */}
        <polygon points="100,52 142,66 100,80 58,66" fill="#0F172A" />
        <polygon points="76,73 76,86 100,94 124,86 124,73 100,81" fill="#1E293B" />
        {/* Tassel */}
        <path d="M100 66C120 66 136 78 136 92" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="136" cy="94" r="3" fill="#EF4444" />

        {/* Left Hand: Thumbs Up */}
        <g transform="translate(48, 120)">
          <circle cx="16" cy="16" r="12" fill="#1E293B" />
          <path d="M14 14V6C14 4 17 4 17 6V12H22C24 12 24 18 20 18H14" fill="#FED7AA" stroke="#EA580C" strokeWidth="1" />
        </g>

        {/* Right Hand holding Books & Diploma */}
        <g transform="translate(108, 136)">
          {/* Bottom Blue Book */}
          <rect x="0" y="24" width="46" height="10" rx="2" fill="#3B82F6" />
          <rect x="4" y="26" width="38" height="6" rx="1" fill="#EFF6FF" />
          {/* Middle Red Book */}
          <rect x="4" y="14" width="42" height="10" rx="2" fill="#EF4444" />
          <rect x="8" y="16" width="34" height="6" rx="1" fill="#FEF2F2" />
          {/* Top Diploma Scroll */}
          <rect x="8" y="4" width="34" height="10" rx="5" fill="#FFFFFF" stroke="#E2E8F0" />
          <rect x="22" y="4" width="6" height="10" fill="#EF4444" />
          {/* Hand holding it */}
          <circle cx="8" cy="20" r="7" fill="#FED7AA" />
        </g>
      </svg>
    </div>
  );
}

// 2. Teacher Illustration (Glasses, holding opened book & pointing stick near chalkboard)
export function TeacherIllustration({ className = "w-full h-48" }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soft backdrop circle */}
        <circle cx="100" cy="100" r="80" fill="#F0FDF4" />

        {/* Mini Chalkboard in background */}
        <rect x="100" y="55" width="85" height="65" rx="4" fill="#1E3A34" stroke="#854D0E" strokeWidth="3" />
        {/* Chalk drawings on board */}
        <path d="M120 75L128 70L136 78" stroke="#A7F3D0" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <line x1="120" y1="88" x2="150" y2="88" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" opacity="0.7" />
        <line x1="120" y1="96" x2="165" y2="96" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

        {/* Character Body (Sweater + Shirt) */}
        <path d="M42 180C42 142 62 130 90 130C118 130 138 142 138 180H42Z" fill="#451A03" />
        <path d="M85 130L90 142L95 130" stroke="#FFFFFF" strokeWidth="4" />
        {/* White shirt inner */}
        <polygon points="90,130 84,142 96,142" fill="#FFFFFF" />

        {/* Neck */}
        <rect x="82" y="112" width="16" height="22" rx="3" fill="#FDBA74" />

        {/* Head */}
        <circle cx="90" cy="100" r="24" fill="#FED7AA" />

        {/* Dark Curly Hair */}
        <path d="M68 96C66 80 78 72 90 72C104 72 114 80 112 96C110 88 102 85 90 85C78 85 70 90 68 96Z" fill="#292524" />
        <circle cx="74" cy="84" r="7" fill="#292524" />
        <circle cx="86" cy="76" r="8" fill="#292524" />
        <circle cx="100" cy="77" r="7" fill="#292524" />
        <circle cx="110" cy="85" r="7" fill="#292524" />

        {/* Glasses */}
        <circle cx="83" cy="99" r="6" stroke="#0F172A" strokeWidth="2" fill="none" />
        <circle cx="97" cy="99" r="6" stroke="#0F172A" strokeWidth="2" fill="none" />
        <line x1="89" y1="99" x2="91" y2="99" stroke="#0F172A" strokeWidth="2" />
        {/* Eyes inside glasses */}
        <circle cx="83" cy="99" r="1.8" fill="#1E293B" />
        <circle cx="97" cy="99" r="1.8" fill="#1E293B" />
        {/* Friendly smile */}
        <path d="M86 109C88 112 92 112 94 109" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />

        {/* Right Arm: Holding pointer stick towards board */}
        <path d="M125 142L152 108" stroke="#451A03" strokeWidth="12" strokeLinecap="round" />
        <circle cx="154" cy="106" r="6" fill="#FED7AA" />
        <line x1="154" y1="106" x2="178" y2="76" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />

        {/* Left Arm: Holding blue open book */}
        <path d="M60 148L76 158" stroke="#451A03" strokeWidth="12" strokeLinecap="round" />
        {/* Open Book */}
        <g transform="translate(62, 142)">
          <path d="M0 8C8 4 16 6 24 12C32 6 40 4 48 8V24C40 20 32 22 24 28C16 22 8 20 0 24Z" fill="#2563EB" />
          <path d="M2 9C9 6 16 8 23 13V26C16 21 9 19 2 22Z" fill="#F8FAFC" />
          <path d="M46 9C39 6 32 8 25 13V26C32 21 39 19 46 22Z" fill="#F8FAFC" />
          <circle cx="24" cy="24" r="5" fill="#FED7AA" />
        </g>
      </svg>
    </div>
  );
}

// 3. Practice / Corporate Mentor Illustration (With laptop, clipboard, pen)
export function PracticeIllustration({ className = "w-full h-48" }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soft backdrop circle */}
        <circle cx="100" cy="100" r="80" fill="#ECFDF5" />

        {/* Laptop on desk in background */}
        <rect x="25" y="145" width="48" height="30" rx="3" fill="#94A3B8" />
        <polygon points="20,175 78,175 74,178 24,178" fill="#CBD5E1" />
        <circle cx="49" cy="158" r="4" fill="#E2E8F0" />

        {/* Character Body (Modern brown jacket + black shirt) */}
        <path d="M60 180C60 144 80 132 110 132C140 132 160 144 160 180H60Z" fill="#3E2723" />
        {/* Collar opening */}
        <polygon points="110,132 102,148 118,148" fill="#1E293B" />

        {/* Neck */}
        <rect x="102" y="114" width="16" height="22" rx="3" fill="#FDBA74" />

        {/* Head */}
        <circle cx="110" cy="102" r="24" fill="#FED7AA" />

        {/* Brown neat side-part hair */}
        <path d="M88 98C86 82 98 74 112 74C126 74 134 82 132 98C128 86 118 84 110 84C98 84 90 90 88 98Z" fill="#5D4037" />
        <path d="M88 96C92 84 106 80 120 80C128 80 132 85 132 92" fill="#5D4037" />

        {/* Expressive Face */}
        {/* Eyes with happy squint */}
        <path d="M102 101C104 98 108 98 110 101" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M116 101C118 98 122 98 124 101" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" />
        {/* Confident smile */}
        <path d="M107 111C110 115 116 115 119 111" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="98" cy="108" r="3.5" fill="#FCA5A5" opacity="0.6" />
        <circle cx="126" cy="108" r="3.5" fill="#FCA5A5" opacity="0.6" />

        {/* Right Hand holding Pen */}
        <g transform="translate(85, 120)">
          <line x1="8" y1="2" x2="20" y2="18" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="16" cy="14" r="6" fill="#FED7AA" />
        </g>

        {/* Left Arm: Holding Blue Clipboard */}
        <g transform="translate(112, 130)">
          {/* Clipboard Board */}
          <rect x="6" y="8" width="42" height="48" rx="4" fill="#2563EB" />
          {/* Clip on top */}
          <rect x="20" y="4" width="14" height="7" rx="2" fill="#94A3B8" />
          {/* Paper sheet */}
          <rect x="11" y="14" width="32" height="36" rx="2" fill="#FFFFFF" />
          <line x1="16" y1="22" x2="38" y2="22" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="28" x2="34" y2="28" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="34" x2="36" y2="34" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="40" x2="28" y2="40" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          {/* Hand holding clipboard */}
          <circle cx="44" cy="38" r="6" fill="#FED7AA" />
        </g>
      </svg>
    </div>
  );
}
