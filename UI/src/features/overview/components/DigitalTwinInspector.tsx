import React, { useMemo } from 'react';
import { Panel, InspectorRow } from '@/components';
import { Box, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useMissionStore } from '@/stores/useMissionStore';

interface DigitalTwinInspectorProps {
  selectedStageRef: string | null;
  onSelectStage: (stageRef: string | null) => void;
}

export const DigitalTwinInspector: React.FC<DigitalTwinInspectorProps> = React.memo(({ selectedStageRef, onSelectStage: _onSelectStage }) => {
  const subsystemStages = useMissionStore((state) => state.subsystemStages);
  const alerts = useMissionStore((state) => state.alerts);

  const stage = useMemo(() => {
    return subsystemStages.find((s) => s.ref === selectedStageRef) || subsystemStages[3]; // Default combustor
  }, [selectedStageRef, subsystemStages]);

  const activeAlert = useMemo(() => {
    return alerts.find((a) => a.subsystemRef === stage.ref);
  }, [stage.ref, alerts]);

  return (
    <Panel title={`Digital Twin Inspector: ${stage.name}`} icon={Box} className="h-full" highContrastHeader>
      <div className="space-y-3 font-mono">
        {/* Active Diagnostic Alert Banner */}
        {activeAlert ? (
          <div className="p-2.5 bg-red-50 border-2 border-red-600 rounded-sm shadow-2xs space-y-1 animate-pulse">
            <div className="flex items-center gap-1.5 text-red-700 font-bold font-rajdhani text-xs tracking-wider uppercase">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>ACTIVE DIAGNOSTIC ALERT • {activeAlert.severity}</span>
            </div>
            <div className="text-xs font-bold text-slate-900 leading-tight">
              {activeAlert.title}
            </div>
            <div className="text-[10px] text-slate-700 leading-normal">
              {activeAlert.description}
            </div>
            <div className="pt-1 mt-1 border-t border-red-200 text-[10px] font-bold text-[#003366]">
              👉 AI ACTION: {activeAlert.recommendedAction}
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-emerald-50 border border-emerald-600 rounded-sm shadow-2xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-xs font-bold text-emerald-900 font-rajdhani uppercase tracking-wider">
              SUBSYSTEM STATUS: NOMINAL • NO ACTIVE TRIAGE WARNINGS
            </div>
          </div>
        )}

        {/* Thermodynamic & Structural Readout Table */}
        <div className="space-y-1 bg-slate-50 border border-slate-200 rounded-sm p-2">
          <div className="text-[10px] font-bold text-[#003366] border-b border-slate-200 pb-1 mb-1 uppercase tracking-wider">
            THERMODYNAMIC & STRUCTURAL TELEMETRY
          </div>
          <InspectorRow label="Subsystem Stage Code" val={stage.ref.toUpperCase()} unit="" active />
          <InspectorRow label="Structural Fatigue Health" val={stage.health} unit="%" />
          <InspectorRow label="Gas Path Temp (Total)" val={stage.temp} unit="°C" />
          <InspectorRow label="Stage Pressure Ratio" val={stage.pressure} unit="Bar" />
          <InspectorRow label="Vibration Harmonic RMS" val={stage.vibration} unit="G" />
          <InspectorRow label="ARINC-429 Bus Status" val="ONLINE" unit="(Ch 1)" />
        </div>
      </div>
    </Panel>
  );
});
DigitalTwinInspector.displayName = 'DigitalTwinInspector';
