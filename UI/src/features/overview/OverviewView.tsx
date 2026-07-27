import React from 'react';
import { useOverviewData } from './hooks';
import { MissionSummaryRibbon } from './components/MissionSummaryRibbon';
import { QuickActionsBar } from './components/QuickActionsBar';
import { MissionOperationsPanel } from './components/MissionOperationsPanel';
import { FlightEnvelopePanel } from './components/FlightEnvelopePanel';
import { DigitalTwinViewport } from './components/DigitalTwinViewport';
import { DigitalTwinInspector } from './components/DigitalTwinInspector';
import { EngineHealthSummaryPanel } from './components/EngineHealthSummaryPanel';
import { AiMissionSummaryPanel } from './components/AiMissionSummaryPanel';
import { LiveTelemetryPanel } from './components/LiveTelemetryPanel';
import { AlertsPanel } from './components/AlertsPanel';
import { MissionTimelinePanel } from './components/MissionTimelinePanel';

export const OverviewView: React.FC = React.memo(() => {
  const { ac, selectedStageRef, summaryMetrics, handleStageSelect } = useOverviewData();

  return (
    <div className="flex flex-col h-full gap-3 p-3 overflow-y-auto bg-[#F4F6F8]">
      {/* TIER 1: MISSION SUMMARY RIBBON & WORKFLOW SHORTCUTS */}
      <MissionSummaryRibbon metrics={summaryMetrics} />
      <QuickActionsBar />

      {/* TIER 2: MAIN WORKSTATION VIEWPORT DOCK (25% Left, 50% Center CAD, 25% Right) */}
      <div className="grid grid-cols-12 gap-3 min-h-[460px] shrink-0">
        <div className="col-span-3 flex flex-col gap-3">
          <div className="flex-1 min-h-[220px]">
            <MissionOperationsPanel ac={ac} />
          </div>
          <div className="flex-1 min-h-[220px]">
            <FlightEnvelopePanel ac={ac} />
          </div>
        </div>

        <div className="col-span-6 h-full">
          <DigitalTwinViewport selectedStageRef={selectedStageRef} onSelectStage={handleStageSelect} />
        </div>

        <div className="col-span-3 flex flex-col gap-3">
          <div className="flex-1 min-h-[140px]">
            <DigitalTwinInspector selectedStageRef={selectedStageRef} onSelectStage={handleStageSelect} />
          </div>
          <div className="flex-1 min-h-[160px]">
            <EngineHealthSummaryPanel selectedStageRef={selectedStageRef} onSelectStage={handleStageSelect} />
          </div>
          <div className="flex-1 min-h-[140px]">
            <AiMissionSummaryPanel />
          </div>
        </div>
      </div>

      {/* TIER 3: BOTTOM ANALYTICS DOCK */}
      <div className="grid grid-cols-12 gap-3 min-h-[260px] shrink-0 pb-6">
        <div className="col-span-6 h-full">
          <LiveTelemetryPanel onSelectStage={handleStageSelect} />
        </div>
        <div className="col-span-6 flex flex-col gap-3">
          <div className="flex-1 min-h-[125px]">
            <AlertsPanel onSelectStage={handleStageSelect} />
          </div>
          <div className="flex-1 min-h-[125px]">
            <MissionTimelinePanel onSelectStage={handleStageSelect} />
          </div>
        </div>
      </div>
    </div>
  );
});
OverviewView.displayName = 'OverviewView';
