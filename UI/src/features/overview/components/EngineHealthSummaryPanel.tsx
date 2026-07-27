import React from 'react';
import { Panel, HealthRing } from '@/components';
import { Cpu } from 'lucide-react';
import { useMissionStore } from '@/stores';
import { statusColor } from '@/utils';

interface EngineHealthSummaryPanelProps {
  selectedStageRef: string | null;
  onSelectStage: (stageRef: string | null) => void;
}

export const EngineHealthSummaryPanel: React.FC<EngineHealthSummaryPanelProps> = React.memo(({ selectedStageRef, onSelectStage }) => {
  const subsystemStages = useMissionStore((s) => s.subsystemStages);
  return (
  <Panel title="Propulsion Health Ranking" icon={Cpu} className="h-full" noPad>
    <div className="divide-y divide-slate-200 font-mono text-xs">
      {subsystemStages.map((stg) => {
        const isSelected = selectedStageRef === stg.ref;
        const badgeCol = statusColor(stg.status);
        return (
          <div
            key={stg.ref}
            onClick={() => onSelectStage(stg.ref)}
            className={`flex items-center justify-between p-2.5 transition-all cursor-pointer ${
              isSelected
                ? 'bg-sky-50 border-l-4 border-[#003366] font-bold text-slate-900 shadow-2xs'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <HealthRing health={stg.health} size={32} stroke={3} />
              <div>
                <div className={isSelected ? 'text-slate-900 font-bold' : 'text-slate-800 font-medium'}>
                  {stg.name}
                </div>
                <div className="text-[10px] text-slate-500 font-normal">
                  Temp: {stg.temp}°C • Press: {stg.pressure} Bar
                </div>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-xs font-bold text-[9px] uppercase tracking-wider ${badgeCol}`}>
              {stg.status}
            </span>
          </div>
        );
      })}
    </div>
  </Panel>
  );
});
EngineHealthSummaryPanel.displayName = 'EngineHealthSummaryPanel';
