import React from "react";

export function ProfitLogo({ className = "w-12 h-12" }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer Circular Ring */}
        <circle cx="50" cy="50" r="45" stroke="#FF8A00" strokeWidth="4.5" fill="#FFFFFF" />
        
        {/* Graduation / Leaf sprout lines representing education and growth */}
        <path
          d="M32 64C32 50 40 40 50 36C46 44 46 54 44 64"
          stroke="#4EBA97"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M26 62C26 53 32 44 42 38C38 48 37 56 36 62"
          stroke="#4EBA97"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Dynamic human figure reaching upward */}
        {/* Head */}
        <circle cx="64" cy="38" r="7" fill="#FF8A00" />
        
        {/* Body & Arms dynamic curve */}
        <path
          d="M48 64C48 54 55 48 68 47C62 55 58 60 52 64"
          fill="#FF8A00"
        />
        <path
          d="M53 58C62 54 71 49 76 43C73 53 66 61 57 66Z"
          fill="#FFA940"
        />
      </svg>
    </div>
  );
}

export function FloatingDecorations() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Top right big orange sphere */}
      <div 
        className="absolute -top-20 -right-20 w-72 h-72 sm:w-88 sm:h-88 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle at 35% 35%, #FFB049 0%, #FF8A00 90%)",
          opacity: 0.95
        }}
      />

      {/* Top left grid pattern */}
      <div 
        className="absolute top-8 left-16 sm:left-32 w-32 h-32 opacity-25"
        style={{
          backgroundImage: "radial-gradient(#22C55E 2.5px, transparent 2.5px)",
          backgroundSize: "14px 14px",
        }}
      />

      {/* Top center-right grid pattern */}
      <div 
        className="absolute top-6 right-1/4 w-32 h-24 opacity-25"
        style={{
          backgroundImage: "radial-gradient(#FF8A00 2.5px, transparent 2.5px)",
          backgroundSize: "14px 14px",
        }}
      />

      {/* Book outline top-left */}
      <svg className="absolute top-36 left-8 sm:left-24 w-10 h-10 text-amber-500/50 -rotate-12 transition-transform hover:rotate-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-0-5H20"/>
      </svg>

      {/* Mortarboard icon top-right */}
      <svg className="absolute top-44 right-10 sm:right-28 w-11 h-11 text-amber-500/55 rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>

      {/* Notebook left middle */}
      <svg className="absolute top-80 left-6 sm:left-20 w-9 h-9 text-amber-500/40 rotate-6" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="2" width="16" height="20" rx="3" fill="#FDBA74" opacity="0.45" stroke="#EA580C" strokeWidth="1.5"/>
        <line x1="8" y1="7" x2="16" y2="7" stroke="#EA580C" strokeWidth="2" strokeLinecap="round"/>
        <line x1="8" y1="11" x2="16" y2="11" stroke="#EA580C" strokeWidth="2" strokeLinecap="round"/>
        <line x1="8" y1="15" x2="13" y2="15" stroke="#EA580C" strokeWidth="2" strokeLinecap="round"/>
      </svg>

      {/* File/Certificate right middle */}
      <svg className="absolute top-96 right-6 sm:right-20 w-8 h-10 text-amber-500/50 -rotate-6" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#FED7AA" opacity="0.5" stroke="#EA580C" strokeWidth="1.5"/>
        <path d="M14 2v6h6" fill="#FDBA74" opacity="0.7" stroke="#EA580C" strokeWidth="1.5"/>
      </svg>

      {/* Bottom organic wavy shapes */}
      {/* Bottom left orange wave */}
      <div 
        className="absolute -bottom-16 -left-20 w-80 sm:w-96 h-56 sm:h-72 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, #FF9C34 0%, #FF8A00 100%)",
          borderTopRightRadius: "65% 85%",
          borderBottomRightRadius: "35% 20%",
          transform: "rotate(-6deg)",
          zIndex: 0
        }}
      />

      {/* Bottom right mint-green wave */}
      <div 
        className="absolute -bottom-16 -right-20 w-96 sm:w-[28rem] h-60 sm:h-72 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, #57C7A2 0%, #34D399 100%)",
          borderTopLeftRadius: "70% 85%",
          borderBottomLeftRadius: "25% 15%",
          transform: "rotate(4deg)",
          zIndex: 0
        }}
      />
    </div>
  );
}
