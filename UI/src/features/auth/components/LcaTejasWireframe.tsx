import React from 'react';

export const LcaTejasWireframe: React.FC = React.memo(() => {
  return (
    <div className="relative w-full h-full min-h-[380px] max-h-[460px] bg-[#FFFFFF] border border-[#D9E1EA] rounded-sm p-5 overflow-hidden flex flex-col justify-between shadow-sm group select-none">
      {/* CAD Technical Engineering Grid Layer */}
      <div 
        className="absolute inset-0 opacity-80 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #EEF2F7 1px, transparent 1px),
            linear-gradient(to bottom, #EEF2F7 1px, transparent 1px),
            linear-gradient(to right, #D9E1EA 1px, transparent 1px),
            linear-gradient(to bottom, #D9E1EA 1px, transparent 1px)
          `,
          backgroundSize: '16px 16px, 16px 16px, 80px 80px, 80px 80px'
        }}
      />

      {/* Engineering Blueprint Title Block (Top Left) */}
      <div className="relative z-10 flex items-start justify-between border-b border-[#D9E1EA] pb-2.5 font-mono">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#1565C0] rounded-xs" />
            <span className="font-bold text-[#10233A] text-xs tracking-wider uppercase">
              LCA TEJAS MK1A • AERO-STRUCTURAL & PROPULSION CAD BLUEPRINT
            </span>
            <span className="text-[10px] bg-[#F7F8FA] border border-[#D9E1EA] text-[#1565C0] px-1.5 py-0.5 rounded-xs font-semibold">
              DWG NO: HAL-45SQN-2026-CAD
            </span>
          </div>
          <div className="text-[10px] text-[#5E738D] flex items-center gap-4">
            <span>SCALE: 1:50 // WASM ENGINE VIEW</span>
            <span>DIMENSIONS: LENGTH 13.20M • WINGSPAN 8.20M • HEIGHT 4.40M</span>
            <span>POWERPLANT: 1× GE F404-IN20 TURBOFAN (84 kN REHEAT)</span>
          </div>
        </div>

        {/* Top Right Specs Block */}
        <div className="text-right text-[10px] space-y-0.5 text-[#5E738D]">
          <div>AIRWORTHINESS: <span className="text-[#10233A] font-bold">MIL-STD-1553B / ARINC-429</span></div>
          <div>SQUADRON ASSIGNMENT: <span className="text-[#1565C0] font-bold">NO. 45 SQN (FLYING DAGGERS)</span></div>
          <div>TELEMETRY LINK: <span className="text-[#0097A7] font-bold">AERONET-V4 SECURE DATABUS</span></div>
        </div>
      </div>

      {/* Central High-Resolution CAD Blueprint Drawing */}
      <div className="relative flex-1 w-full my-3 flex items-center justify-center">
        <svg
          viewBox="0 0 1000 320"
          className="w-full h-full max-h-[300px] overflow-visible transition-transform duration-700 group-hover:scale-[1.01]"
          fill="none"
          stroke="currentColor"
        >
          {/* Longitudinal Axis Line */}
          <line x1="20" y1="160" x2="980" y2="160" stroke="#1565C0" strokeWidth="0.8" strokeDasharray="6 4" opacity="0.6" />

          {/* Fuselage Length Reference Line (Top) */}
          <line x1="120" y1="20" x2="880" y2="20" stroke="#5E738D" strokeWidth="0.8" />
          <line x1="120" y1="15" x2="120" y2="25" stroke="#5E738D" strokeWidth="1" />
          <line x1="880" y1="15" x2="880" y2="25" stroke="#5E738D" strokeWidth="1" />
          <text x="500" y="15" className="text-[9px] font-mono fill-[#10233A] font-bold" textAnchor="middle">STRUCTURAL LENGTH: 13.20 METERS (EXCLUDING PITOT PROBE)</text>

          {/* Wingspan Reference Line (Right) */}
          <line x1="940" y1="45" x2="940" y2="275" stroke="#5E738D" strokeWidth="0.8" />
          <line x1="935" y1="45" x2="945" y2="45" stroke="#5E738D" strokeWidth="1" />
          <line x1="935" y1="275" x2="945" y2="275" stroke="#5E738D" strokeWidth="1" />
          <text x="955" y="160" className="text-[9px] font-mono fill-[#10233A] font-bold" textAnchor="middle" transform="rotate(-90 955 160)">WINGSPAN: 8.20M</text>

          {/* Main Delta Wing Outer Structural Outline */}
          <path
            d="M 220 160 L 420 45 L 640 40 L 690 90 L 800 90 L 830 125 L 850 140 L 880 150 L 880 170 L 850 180 L 830 195 L 800 230 L 690 230 L 640 280 L 420 275 Z"
            className="stroke-[#1565C0] fill-[#1565C0]/[0.03]"
            strokeWidth="1.5"
          />

          {/* Internal Structural Spars & Ribs (Light Technical Engineering Lines) */}
          <path d="M 320 100 L 650 90 M 320 220 L 650 230 M 420 45 L 420 275 M 540 42 L 540 278 M 640 40 L 640 280" className="stroke-[#1565C0]" strokeWidth="0.6" strokeDasharray="3 3" opacity="0.7" />

          {/* Fuselage Central Spine & Cockpit Canopy */}
          <path
            d="M 120 160 L 260 142 L 440 138 L 640 138 L 800 142 L 880 150 L 880 170 L 800 178 L 640 182 L 440 182 L 260 178 Z"
            className="stroke-[#10233A] fill-[#FFFFFF]"
            strokeWidth="1.5"
          />
          {/* Cockpit Canopy Transparency & Pilot Station */}
          <path d="M 220 160 L 300 147 L 380 147 L 410 160 L 380 173 L 300 173 Z" className="stroke-[#0097A7] fill-[#0097A7]/10" strokeWidth="1.2" />
          <circle cx="310" cy="160" r="4" className="fill-[#1565C0]" />
          <text x="310" y="140" className="text-[8px] font-mono fill-[#1565C0] font-bold" textAnchor="middle">COCKPIT STATION (MARTIN-BAKER MK16G)</text>

          {/* Leading Edge Root Extensions (LERX) / Canard Vortex Generators */}
          <path d="M 300 160 L 390 110 L 440 110 L 410 160 L 440 210 L 390 210 Z" className="stroke-[#1565C0]" strokeWidth="1" opacity="0.8" />

          {/* UTTAM AESA Radar Nose Cone Node & Annotation */}
          <circle cx="130" cy="160" r="5" className="fill-[#2E7D32] stroke-[#FFFFFF]" strokeWidth="1.5" />
          <line x1="130" y1="160" x2="80" y2="120" stroke="#2E7D32" strokeWidth="1" />
          <text x="75" y="115" className="text-[8.5px] font-mono fill-[#2E7D32] font-bold" textAnchor="end">UTTAM AESA ACTIVE RADAR (#STA-0)</text>

          {/* ========================================================================= */}
          {/* GE F404-IN20 PROPULSION BAY & ENGINE CORE BREAKDOWN (CENTER-RIGHT) */}
          {/* ========================================================================= */}
          <g className="transition-all">
            {/* Engine Housing Outline */}
            <rect x="580" y="142" width="280" height="36" rx="2" className="stroke-[#ED6C02] fill-[#ED6C02]/[0.05]" strokeWidth="1.5" strokeDasharray="4 2" />
            
            {/* 1. LP Compressor (Low Pressure 3-Stage) */}
            <rect x="590" y="146" width="45" height="28" rx="1" className="stroke-[#1565C0] fill-[#1565C0]/10" strokeWidth="1" />
            <text x="612" y="163" className="text-[7.5px] font-mono fill-[#10233A] font-bold" textAnchor="middle">LP COMP</text>

            {/* 2. HP Compressor (High Pressure 7-Stage) */}
            <rect x="640" y="146" width="55" height="28" rx="1" className="stroke-[#1565C0] fill-[#1565C0]/15" strokeWidth="1" />
            <text x="667" y="163" className="text-[7.5px] font-mono fill-[#10233A] font-bold" textAnchor="middle">HP COMP</text>

            {/* 3. Annular Combustor (High Temperature Zone) */}
            <rect x="700" y="146" width="50" height="28" rx="1" className="stroke-[#ED6C02] fill-[#ED6C02]/20 animate-pulse" strokeWidth="1.2" />
            <text x="725" y="163" className="text-[7.5px] font-mono fill-[#ED6C02] font-bold" textAnchor="middle">COMBUSTOR</text>

            {/* 4. Turbine (HP/LP Single Stage) */}
            <rect x="755" y="146" width="45" height="28" rx="1" className="stroke-[#0097A7] fill-[#0097A7]/15" strokeWidth="1" />
            <text x="777" y="163" className="text-[7.5px] font-mono fill-[#10233A] font-bold" textAnchor="middle">TURBINE</text>

            {/* 5. Afterburner & Exhaust Nozzle */}
            <path d="M 805 146 L 860 148 L 875 160 L 860 172 L 805 174 Z" className="stroke-[#C62828] fill-[#C62828]/15" strokeWidth="1.2" />
            <text x="835" y="163" className="text-[7.5px] font-mono fill-[#C62828] font-bold" textAnchor="middle">EXHAUST</text>

            {/* Propulsion Bay Callout Leader */}
            <circle cx="725" cy="142" r="4" className="fill-[#ED6C02] stroke-[#FFFFFF]" strokeWidth="1.5" />
            <line x1="725" y1="142" x2="725" y2="90" stroke="#ED6C02" strokeWidth="1" />
            <rect x="635" y="70" width="180" height="18" rx="2" className="fill-[#FFFFFF] stroke-[#ED6C02]" strokeWidth="1" />
            <text x="725" y="82" className="text-[8.5px] font-mono fill-[#ED6C02] font-bold" textAnchor="middle">GE F404-IN20 TURBOFAN CORE • T4: 1723 K</text>
          </g>

          {/* ========================================================================= */}
          {/* HARDPOINT STATIONS & WEAPONS / TELEMETRY BUS ASSIGNMENTS */}
          {/* ========================================================================= */}
          {/* Station 1 & 8 (Wingtip AAMs) */}
          <circle cx="500" cy="42" r="3.5" className="fill-[#1565C0]" />
          <text x="500" y="32" className="text-[8px] font-mono fill-[#5E738D]" textAnchor="middle">STA 1: ASRAAM / R-73</text>

          <circle cx="500" cy="278" r="3.5" className="fill-[#1565C0]" />
          <text x="500" y="295" className="text-[8px] font-mono fill-[#5E738D]" textAnchor="middle">STA 8: ASRAAM / R-73</text>

          {/* Station 2 & 7 (Outer Wing BVR AAMs) */}
          <circle cx="450" cy="65" r="4" className="fill-[#0097A7]" />
          <line x1="450" y1="65" x2="330" y2="40" stroke="#0097A7" strokeWidth="0.8" strokeDasharray="2 2" />
          <text x="325" y="38" className="text-[8px] font-mono fill-[#0097A7] font-bold" textAnchor="end">STA 2: ASTRA MK1 BVR MISSILE</text>

          <circle cx="450" cy="255" r="4" className="fill-[#0097A7]" />
          <line x1="450" y1="255" x2="330" y2="280" stroke="#0097A7" strokeWidth="0.8" strokeDasharray="2 2" />
          <text x="325" y="284" className="text-[8px] font-mono fill-[#0097A7] font-bold" textAnchor="end">STA 7: ASTRA MK1 BVR MISSILE</text>

          {/* Station 3 & 6 (Mid Wing Drop Tanks / Telemetry Pods) */}
          <circle cx="480" cy="95" r="4" className="fill-[#1565C0]" />
          <line x1="480" y1="95" x2="570" y2="60" stroke="#1565C0" strokeWidth="0.8" strokeDasharray="2 2" />
          <text x="575" y="58" className="text-[8px] font-mono fill-[#1565C0] font-bold" textAnchor="start">STA 3: 1200L DROP TANK / TELEMETRY POD</text>

          <circle cx="480" cy="225" r="4" className="fill-[#1565C0]" />
          <line x1="480" y1="225" x2="570" y2="260" stroke="#1565C0" strokeWidth="0.8" strokeDasharray="2 2" />
          <text x="575" y="264" className="text-[8px] font-mono fill-[#1565C0] font-bold" textAnchor="start">STA 6: 1200L DROP TANK / TELEMETRY POD</text>

          {/* Fuel Line Feed Conduits (Blue dashed curves) */}
          <path d="M 480 95 Q 520 140 590 150 M 480 225 Q 520 180 590 170" className="stroke-[#0097A7]" strokeWidth="1" strokeDasharray="2 2" fill="none" />

          {/* Telemetry Transducer Nodes (T1 - T4) */}
          <circle cx="600" cy="138" r="3" className="fill-[#2E7D32]" />
          <text x="595" y="130" className="text-[7px] font-mono fill-[#2E7D32] font-bold">T1: VIBE</text>

          <circle cx="710" cy="138" r="3" className="fill-[#ED6C02]" />
          <text x="705" y="130" className="text-[7px] font-mono fill-[#ED6C02] font-bold">T2: TEMP</text>

          <circle cx="780" cy="138" r="3" className="fill-[#0097A7]" />
          <text x="775" y="130" className="text-[7px] font-mono fill-[#0097A7] font-bold">T3: N2 RPM</text>

          <circle cx="835" cy="138" r="3" className="fill-[#1565C0]" />
          <text x="830" y="130" className="text-[7px] font-mono fill-[#1565C0] font-bold">T4: PRESSURE</text>
        </svg>
      </div>

      {/* Blueprint Bottom Telemetry Summary Footer */}
      <div className="relative z-10 flex items-center justify-between border-t border-[#D9E1EA] pt-2 font-mono text-[10px]">
        <div className="flex items-center gap-4 text-[#5E738D]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
            <span className="text-[#10233A] font-bold">DATABUS STREAM: ARINC-429 LINK-17 ONLINE</span>
          </span>
          <span>TRANSDUCERS: 88 ACTIVE CHANNELS</span>
          <span>SOLVER FREQUENCY: 1.00 Hz (REAL-TIME)</span>
        </div>
        <div className="text-[#1565C0] font-bold tracking-wider">
          HAL AEROSPACE • ENGINE HEALTH INDEX: 94.2% NOMINAL
        </div>
      </div>
    </div>
  );
});

LcaTejasWireframe.displayName = 'LcaTejasWireframe';
