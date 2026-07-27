import React from 'react';
import { useUiStore, WorkstationViewId } from '@/stores';
import {
  LayoutDashboard,
  Plane,
  FileText,
  Box,
  Activity,
  Cpu,
  BrainCircuit,
  HelpCircle,
  Atom,
  Search,
  Wrench,
  FileSpreadsheet,
  RotateCcw,
  TrendingUp,
  Bell,
  Clock,
  Users,
  Settings,
} from 'lucide-react';

interface NavItem {
  id: WorkstationViewId;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'OPERATIONS',
    items: [
      { id: 'overview', label: 'Mission Overview', icon: LayoutDashboard },
      { id: 'fleet', label: 'Fleet Operations', icon: Plane, badge: '12 A/C' },
      { id: 'details', label: 'Aircraft Logbook', icon: FileText },
    ],
  },
  {
    label: 'DIGITAL TWIN',
    items: [
      { id: 'twin', label: '3D Digital Twin', icon: Box, badge: 'CAD' },
      { id: 'telemetry', label: 'Live Telemetry', icon: Activity, badge: '1Hz' },
      { id: 'engine', label: 'Thermodynamics', icon: Cpu },
      { id: 'physics', label: 'Physics Models', icon: Atom },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { id: 'ai', label: 'AI Diagnostics', icon: BrainCircuit, badge: 'v4' },
      { id: 'explain', label: 'XAI Explainability', icon: HelpCircle },
      { id: 'investigation', label: 'Root Cause Analysis', icon: Search },
    ],
  },
  {
    label: 'MAINTENANCE & LOGS',
    items: [
      { id: 'maintenance', label: 'Work Orders', icon: Wrench, badge: '4 WO' },
      { id: 'reports', label: 'Airworthiness Certs', icon: FileSpreadsheet },
      { id: 'replay', label: 'Mission Replay', icon: RotateCcw },
      { id: 'historical', label: 'Historical Trends', icon: TrendingUp },
      { id: 'eventtimeline', label: 'Event Timeline', icon: Clock },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { id: 'alerts', label: 'Active Alerts', icon: Bell, badge: '3' },
      { id: 'users', label: 'Clearance Roles', icon: Users },
      { id: 'settings', label: 'HUD Settings', icon: Settings },
    ],
  },
];

export const WorkstationSidebar: React.FC = React.memo(() => {
  const { currentView, setView } = useUiStore();

  return (
    <aside className="w-52 bg-white text-slate-800 flex flex-col border-r border-[#E4E9EF] select-none z-20 shrink-0">
      <div className="flex-1 overflow-y-auto py-3 space-y-3">
        {NAV_GROUPS.map((group, idx) => (
          <div key={idx} className="space-y-0.5">
            {group.label && (
              <div className="px-4 pt-1 pb-1 font-rajdhani text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`flex items-center justify-between gap-2 px-3 py-2 mx-2 rounded-md text-left w-[calc(100%-16px)] font-rajdhani font-bold text-[13px] tracking-wide uppercase transition-all ${
                    isActive
                      ? 'bg-[#EAF1FE] text-[#2563EB] shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#2563EB]' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm shrink-0 ${
                        isActive ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-[#E4E9EF] bg-slate-50 font-mono text-[9px] text-slate-500 flex flex-col gap-1">
        <div className="flex justify-between items-center text-slate-700 font-bold">
          <span>SYSTEM STATUS</span>
          <span className="text-[#16A34A]">NOMINAL • 60 FPS</span>
        </div>
        <div className="text-slate-400">HAL AEROTHON PLATFORM v2026.2</div>
      </div>
    </aside>
  );
});
WorkstationSidebar.displayName = 'WorkstationSidebar';
