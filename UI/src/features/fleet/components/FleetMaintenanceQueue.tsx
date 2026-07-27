import React from 'react';
import { Panel, StatusBadge } from '@/components';
import { Wrench } from 'lucide-react';
import { OPERATIONAL_MAINTENANCE_TASKS } from '@/constants';
import { useUiStore } from '@/stores';

export const FleetMaintenanceQueue: React.FC = React.memo(() => {
  const { setView } = useUiStore();
  const tasks = OPERATIONAL_MAINTENANCE_TASKS;

  return (
    <Panel
      title="HAL Overhaul & Borescope Work Order Queue"
      icon={Wrench}
      className="h-full"
      right={
        <button
          onClick={() => setView('maintenance')}
          className="text-xs font-bold font-rajdhani uppercase tracking-wider text-[#003366] hover:underline"
        >
          Manage Work Orders ({tasks.length}) →
        </button>
      }
    >
      <div className="space-y-2 font-mono text-xs">
        {tasks.map((wo) => (
          <div
            key={wo.id}
            onClick={() => setView('maintenance')}
            className="p-2 bg-white border border-slate-300 hover:border-[#003366] rounded-sm shadow-2xs transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#003366]">{wo.id}</span>
                <StatusBadge status={wo.priority} size="sm" />
                <span className="text-[10px] text-slate-500 font-bold uppercase">A/C: {wo.aircraftTail}</span>
              </div>
              <div className="font-bold text-slate-800 text-xs">{wo.title}</div>
              <div className="text-[10px] text-slate-500">{wo.assignedCrew} • {wo.location}</div>
            </div>
            <div className="text-right">
              <StatusBadge status={wo.status} size="sm" />
              <div className="text-[10px] text-slate-500 mt-1 font-medium">{wo.estimatedHours}h Est.</div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
});
FleetMaintenanceQueue.displayName = 'FleetMaintenanceQueue';
