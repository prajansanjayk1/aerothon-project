import React from 'react';
import { useAuthStore, useAircraftStore, useUiStore } from '@/stores';
import { Shield, Clock, Wifi, Globe, Plane, Radio, Activity, Lock } from 'lucide-react';
import { useLiveIndicators } from '@/hooks/useLiveIndicators';

export const WorkstationHeader: React.FC = React.memo(() => {
  const { user, logout } = useAuthStore();
  const { selectedAircraft } = useAircraftStore();
  const { hudUnits, toggleHudUnits } = useUiStore();
  const { utcTime, missionTime, packetCount, signalQuality, heartbeat, linkStatus } = useLiveIndicators();

  return (
    <header className="h-14 bg-white text-slate-900 px-4 flex items-center justify-between border-b border-[#E4E9EF] shadow-2xs select-none z-30 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 pr-4 border-r border-[#E4E9EF]">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-2xs" style={{ background: 'conic-gradient(#2563EB, #16A34A, #D97706, #2563EB)' }}>
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
              <Plane size={12} className="text-[#2563EB]" />
            </div>
          </div>
          <div>
            <div className="font-rajdhani text-[14px] font-bold leading-tight text-slate-900">
              HAL <span className="font-normal text-slate-600">Mission Control</span>
            </div>
            <div className="font-rajdhani text-[10px] tracking-wider uppercase text-slate-400 font-semibold">
              Digital Twin Intelligence System • {selectedAircraft.squadron}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 font-mono text-xs">

        {/* Live Heartbeat Indicator */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-[#E4E9EF] rounded-md">
          <span
            className="w-2 h-2 rounded-full transition-colors duration-300"
            style={{ backgroundColor: heartbeat ? '#16A34A' : '#86efac' }}
          />
          <span className="text-[10px] font-bold text-slate-600 tracking-wider">LIVE</span>
        </div>

        {/* ARINC-429 Telemetry Stream */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-700 text-[10px] font-semibold">
          <Activity className="w-3 h-3 animate-pulse text-emerald-600" />
          <span>PKT: {packetCount.toLocaleString()}</span>
        </div>

        {/* Signal Quality */}
        <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 border border-[#E4E9EF] rounded-md text-[10px] font-bold text-slate-600">
          <Wifi className="w-3 h-3 text-[#2563EB]" />
          <span>{signalQuality}%</span>
        </div>

        {/* Link-17 Status */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-[#E4E9EF] rounded-md text-[10px] font-semibold text-slate-600">
          <Radio className="w-3 h-3 text-[#2563EB]" />
          <span className="text-[#16A34A] font-bold">{linkStatus}</span>
        </div>

        {/* Mission Time */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#EAF1FE] border border-blue-200 rounded-md text-[#003366] font-bold tracking-wider text-[10px]">
          <span className="text-slate-400 font-normal">MSRT</span>
          <span>{missionTime}</span>
        </div>

        {/* HUD Units Toggle */}
        <button
          onClick={toggleHudUnits}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-[#E4E9EF] text-slate-700 hover:bg-slate-100 text-[11px] uppercase tracking-wider font-semibold"
          title="Toggle Metric vs Imperial HUD Units"
        >
          <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>HUD: {hudUnits === 'metric' ? 'METRIC (Bar / °C)' : 'IMPERIAL (PSI / °F)'}</span>
        </button>

        {/* UTC Live Clock */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-[#E4E9EF] rounded-md text-slate-800 font-bold tracking-wider text-[11px]">
          <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>{utcTime}</span>
        </div>

        {/* Operator Security Clearance Badge */}
        {user && (
          <div className="flex items-center gap-2 pl-3 border-l border-[#E4E9EF]">
            <div className="flex flex-col text-right">
              <span className="text-[12px] font-bold text-slate-900 tracking-wide leading-none">{user.name}</span>
              <span className="text-[9px] text-[#2563EB] font-bold uppercase tracking-widest leading-none mt-0.5">
                CLEARANCE: {user.role} ({user.callsign})
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB] shadow-2xs">
              <Shield className="w-4 h-4" />
            </div>
            <button
              onClick={logout}
              className="ml-1 px-2.5 py-1.5 bg-slate-900 hover:bg-red-900 text-white rounded-md flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer border border-slate-800 hover:border-red-700 font-rajdhani font-bold text-[11px] tracking-wider uppercase"
              title="Lock Workstation & Return to Pre-Authentication Gateway"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>LOCK</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
});
WorkstationHeader.displayName = 'WorkstationHeader';
