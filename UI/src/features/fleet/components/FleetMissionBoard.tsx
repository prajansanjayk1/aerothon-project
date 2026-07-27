import React from 'react';
import { Panel, StatusBadge } from '@/components';
import { Radio } from 'lucide-react';
import { FleetMember } from '@/types';
import { useUiStore } from '@/stores';

interface FleetMissionBoardProps {
  fleet: FleetMember[];
  onSelectTail: (tail: string) => void;
}

export const FleetMissionBoard: React.FC<FleetMissionBoardProps> = React.memo(({ fleet, onSelectTail }) => {
  const { setView } = useUiStore();
  const airborne = fleet.filter((a) => a.status.includes('Combat') || a.status.includes('Supersonic') || a.status.includes('Escort'));

  return (
    <Panel
      title="Active Airborne Combat & Test Sorties Board"
      icon={Radio}
      className="h-full"
      right={
        <button
          onClick={() => setView('eventtimeline')}
          className="text-xs font-bold font-rajdhani uppercase tracking-wider text-[#003366] hover:underline"
        >
          View Live Sortie Radar →
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-2 font-mono text-xs">
        {airborne.map((ac) => (
          <div
            key={ac.id}
            onClick={() => onSelectTail(ac.tail)}
            className="p-2.5 bg-white border border-slate-300 hover:border-[#003366] rounded-sm shadow-2xs transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold font-rajdhani text-sm uppercase text-[#003366]">{ac.tail}</span>
                <StatusBadge status="ACTIVE" size="sm" />
              </div>
              <div className="font-bold text-slate-800">{ac.missionType} • {ac.pilot}</div>
              <div className="text-[10px] text-slate-500">{ac.location}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500 font-bold uppercase">FUEL / RUL</div>
              <div className="font-bold text-slate-900">{ac.fuelPct}% / {ac.tboRulHrs}h</div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
});
FleetMissionBoard.displayName = 'FleetMissionBoard';
