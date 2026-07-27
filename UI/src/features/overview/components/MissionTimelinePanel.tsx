import React, { useState } from 'react';
import { Panel, StatusBadge } from '@/components';
import { Clock, Play, Pause, FastForward } from 'lucide-react';
import { useMissionStore } from '@/stores/useMissionStore';
import { formatTime } from '@/utils';

interface MissionTimelinePanelProps {
  onSelectStage: (stageRef: string) => void;
}

export const MissionTimelinePanel: React.FC<MissionTimelinePanelProps> = React.memo(({ onSelectStage }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const { missionTimeSec, timelineEvents, simulationSettings, setSimulationSettings } = useMissionStore();

  const handlePlayToggle = () => {
    const nextPlay = !isPlaying;
    setIsPlaying(nextPlay);
    setSimulationSettings({ simulationSpeed: nextPlay ? 1 : 0 });
  };

  const handleSpeedCycle = () => {
    const current = simulationSettings.simulationSpeed;
    const nextSpeed = current === 1 ? 4 : current === 4 ? 10 : 1;
    setSimulationSettings({ simulationSpeed: nextSpeed });
  };

  const speedLabel = simulationSettings.simulationSpeed === 1 ? '1X' : simulationSettings.simulationSpeed === 4 ? '4X' : simulationSettings.simulationSpeed === 10 ? '10X' : 'PAUSED';

  return (
    <Panel
      title="Synchronized Flight Data Recorder & Event Timeline"
      icon={Clock}
      className="h-full"
      right={
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={handlePlayToggle}
            className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 rounded-xs font-bold transition-colors"
          >
            {isPlaying ? <Pause className="w-3 h-3 text-[#2563EB]" /> : <Play className="w-3 h-3 text-[#2563EB]" />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>
          <button
            onClick={handleSpeedCycle}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#EAF1FE] text-[#2563EB] border border-blue-200 hover:bg-blue-100 rounded-xs font-bold transition-colors"
          >
            <FastForward className="w-3 h-3 text-[#2563EB]" />
            <span>{speedLabel}</span>
          </button>
          <span className="text-amber-600 font-bold ml-2">MISSION TIME: {formatTime(Math.round(missionTimeSec))}</span>
        </div>
      }
    >
      <div className="space-y-3 font-mono text-xs select-none">
        {/* Continuous Interactive Time Scrub Slider */}
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-sm border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500">T-00:00</span>
          <input
            type="range"
            min={0}
            max={7200}
            value={Math.round(missionTimeSec)}
            onChange={(e) => {
              useMissionStore.setState({ missionTimeSec: Number(e.target.value) });
            }}
            className="flex-1 accent-[#2563EB] cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
          <span className="text-[10px] font-bold text-slate-500">T+02:00 (LIVE)</span>
        </div>

        {/* Synchronized Avionics and Sensor Tracks */}
        <div className="grid grid-cols-5 gap-2">
          {timelineEvents.slice(0, 5).map((ev) => (
            <div
              key={ev.id}
              onClick={() => onSelectStage(ev.subsystemRef)}
              className="p-2 bg-white border border-slate-200 hover:border-[#2563EB] hover:bg-[#EAF1FE]/20 rounded-xs transition-all cursor-pointer shadow-2xs group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-bold text-slate-400 group-hover:text-slate-600">{ev.timestamp}</span>
                  <StatusBadge status={ev.severity} size="sm" />
                </div>
                <div className="font-bold text-slate-900 group-hover:text-[#2563EB] text-xs leading-tight truncate">
                  {ev.title}
                </div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5 line-clamp-2">
                  {ev.description}
                </div>
              </div>
              <div className="mt-2 text-[9px] font-bold text-[#2563EB] uppercase tracking-wider flex items-center justify-between border-t border-slate-100 pt-1">
                <span>{ev.category}</span>
                <span>[{ev.subsystemRef.toUpperCase()}]</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
});
MissionTimelinePanel.displayName = 'MissionTimelinePanel';
