import React from 'react';
import { useUiStore } from '@/stores';
import { Play, Activity, FileText, RotateCcw, Download, Wrench, ShieldCheck, Zap, Square } from 'lucide-react';
import { useMissionDemo } from '@/hooks/useMissionDemo';
import { missionPlaybackEngine } from '@/services/missionPlaybackEngine';

export const QuickActionsBar: React.FC = React.memo(() => {
  const { setView } = useUiStore();
  const { isDemoRunning, demoPhase, demoProgress, startDemo, stopDemo } = useMissionDemo();

  const actions = [
    { label: 'Live Transducer Matrix', icon: Activity, onClick: () => setView('telemetry'), variant: 'outline' as const },
    { label: 'Logbook & Airworthiness', icon: FileText, onClick: () => setView('details'), variant: 'outline' as const },
    { label: 'Mission Replay', icon: RotateCcw, onClick: () => setView('replay'), variant: 'outline' as const },
    { label: 'Physics Model', icon: Play, onClick: () => setView('physics'), variant: 'outline' as const },
    { label: 'Export Package', icon: Download, onClick: () => setView('reports'), variant: 'outline' as const },
    { label: 'Schedule Overhaul', icon: Wrench, onClick: () => setView('maintenance'), variant: 'outline' as const },
    { label: 'Demo Scenarios', icon: Zap, onClick: () => setView('settings'), variant: 'outline' as const },
    { label: 'Validate Link-17', icon: ShieldCheck, onClick: () => alert('Link-17 SATCOM Crypto Key Validated — AES-256-GCM LOCKED'), variant: 'outline' as const },
  ];

  return (
    <div className="bg-white border border-slate-300 rounded-sm p-2 shadow-2xs flex items-center justify-between gap-2 select-none shrink-0 overflow-x-auto">
      <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider px-2 shrink-0 border-r border-slate-200 flex items-center gap-1">
        <span>AEROSPACE WORKFLOW</span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto flex-1">
        {/* Mission Demo Button — primary CTA */}
        {isDemoRunning ? (
          <button
            onClick={stopDemo}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-xs font-rajdhani font-bold text-xs uppercase tracking-wider transition-all shadow-sm shrink-0 bg-amber-600 text-white border border-amber-600 hover:bg-amber-700"
          >
            <Square className="w-3 h-3 text-white" />
            <span>STOP DEMO</span>
            <span className="bg-amber-800 text-white text-[9px] px-1.5 py-0.5 rounded-xs font-mono">
              {demoProgress}%
            </span>
          </button>
        ) : (
          <button
            onClick={startDemo}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs font-rajdhani font-bold text-xs uppercase tracking-wider transition-all shadow-sm shrink-0 bg-[#16A34A] text-white border border-[#16A34A] hover:bg-[#15803d] animate-pulse"
          >
            <Play className="w-3.5 h-3.5 text-white fill-white" />
            <span>▶ RUN FULL MISSION DEMO</span>
          </button>
        )}

        {isDemoRunning && demoPhase && (
          <div className="px-2 py-1 bg-[#EAF1FE] border border-blue-200 rounded-xs font-mono text-[10px] font-bold text-[#2563EB] shrink-0 max-w-[200px] truncate">
            {demoPhase}
          </div>
        )}

        <div className="w-px h-4 bg-slate-200 mx-1 shrink-0" />

        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <button
              key={idx}
              onClick={act.onClick}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs font-rajdhani font-bold text-xs uppercase tracking-wider transition-all shadow-2xs shrink-0 bg-slate-50 border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400"
            >
              <Icon className="w-3.5 h-3.5 text-[#003366]" />
              <span>{act.label}</span>
            </button>
          );
        })}

        {/* Playback speed control */}
        <div className="ml-auto flex items-center gap-1 shrink-0 pl-2 border-l border-slate-200">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">SPEED</span>
          {[1, 8, 20, 60].map((spd) => (
            <button
              key={spd}
              onClick={() => missionPlaybackEngine.setSpeed(spd)}
              className="px-1.5 py-0.5 rounded-xs font-mono text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-600 hover:bg-[#EAF1FE] hover:border-blue-300 hover:text-[#2563EB] transition-colors"
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
QuickActionsBar.displayName = 'QuickActionsBar';
