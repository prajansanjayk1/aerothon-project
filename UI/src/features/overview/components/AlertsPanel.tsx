import React from 'react';
import { Panel, StatusBadge } from '@/components';
import { Bell, ArrowRight } from 'lucide-react';
import { useUiStore } from '@/stores';
import { useMissionStore } from '@/stores/useMissionStore';
import { Alert } from '@/types';

interface AlertsPanelProps {
  onSelectStage: (stageRef: string) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = React.memo(({ onSelectStage }) => {
  const { setView, setSelectedAlert } = useUiStore();
  const alerts = useMissionStore((state) => state.alerts);

  const handleInvestigate = (alt: Alert) => {
    setSelectedAlert(alt);
    onSelectStage(alt.subsystemRef);
    setView('alerts');
  };

  return (
    <Panel
      title="Active Diagnostic Alerts & Mitigation Center"
      icon={Bell}
      className="h-full"
      right={
        <button
          onClick={() => setView('alerts')}
          className="text-xs font-bold font-rajdhani uppercase tracking-wider text-[#2563EB] hover:underline flex items-center gap-1"
        >
          <span>Expand Alerts Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      }
    >
      <div className="space-y-2 font-mono text-xs">
        {alerts.slice(0, 4).map((alt) => (
          <div
            key={alt.id}
            onClick={() => handleInvestigate(alt)}
            className={`p-2.5 bg-white border rounded-sm shadow-2xs transition-all cursor-pointer flex items-start justify-between gap-3 group ${
              alt.severity === 'CRITICAL' ? 'border-red-300 hover:border-red-600 bg-red-50/20' : 'border-slate-300 hover:border-[#2563EB]'
            }`}
          >
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#2563EB] group-hover:underline">{alt.id}</span>
                <StatusBadge status={alt.severity} size="sm" />
                <span className="text-[10px] text-slate-500 font-bold uppercase">STAGE: {alt.subsystemRef}</span>
              </div>
              <div className="font-bold text-slate-900 text-xs">{alt.title}</div>
              <p className="text-slate-600 text-[11px] leading-tight line-clamp-1">{alt.description}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] text-slate-400 font-bold">{alt.timestamp}</div>
              <button className="mt-1 px-2 py-0.5 bg-[#EAF1FE] hover:bg-blue-100 text-[#2563EB] rounded-xs font-rajdhani font-bold text-[10px] uppercase tracking-wider border border-blue-200 transition-colors">
                Investigate →
              </button>
            </div>
          </div>
        ))}
        {alerts.length === 0 && (
          <div className="p-4 text-center text-slate-400 font-semibold bg-slate-50 rounded-sm border border-slate-200">
            No active propulsion or avionics alerts. All subsystems nominal.
          </div>
        )}
      </div>
    </Panel>
  );
});
AlertsPanel.displayName = 'AlertsPanel';
