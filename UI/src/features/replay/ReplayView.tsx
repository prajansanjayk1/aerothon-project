import React, { useState, useEffect } from 'react';
import { Panel } from '@/components';
import { Play, Pause, SkipBack, SkipForward, Bookmark, Clock } from 'lucide-react';
import { useMissionStore } from '@/stores/useMissionStore';
import { missionPlaybackEngine, formatTimeSec } from '@/services/missionPlaybackEngine';
import { MISSION_DATASET, MISSION_TOTAL_DURATION_SEC } from '@/constants/missionDataset';
import { missionEventBus } from '@/services/missionEventBus';

type Bookmark = { timeSec: number; label: string };

export const ReplayView: React.FC = React.memo(() => {
  const missionTimeSec = useMissionStore((s) => s.missionTimeSec);
  const missionPhase = useMissionStore((s) => s.missionPhase);
  const timelineEvents = useMissionStore((s) => s.timelineEvents);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(8);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    const unsub = missionEventBus.subscribe('ReplayBookmarkAdded', (payload) => {
      setBookmarks((bm) => [payload, ...bm].slice(0, 12));
    });
    return unsub;
  }, []);

  const progress = Math.min(100, (missionTimeSec / MISSION_TOTAL_DURATION_SEC) * 100);

  const togglePlay = () => {
    if (isPlaying) {
      missionPlaybackEngine.pause();
    } else {
      missionPlaybackEngine.resume();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    missionPlaybackEngine.seek(t);
  };

  const changeSpeed = (s: number) => {
    setSpeed(s);
    missionPlaybackEngine.setSpeed(s);
  };

  // Current mission state from dataset
  const currentDataset = MISSION_DATASET.reduce((best, row) =>
    row.timeSec <= missionTimeSec ? row : best, MISSION_DATASET[0]
  );

  return (
    <div className="p-3 h-full overflow-y-auto space-y-3 bg-[#F4F6F8]">

      {/* ── Playback Controls ─────────────────────────────────────────────────── */}
      <Panel title="Mission Replay — Synchronized Playback & Time Scrub Controller" icon={Play}
        right={
          <div className="flex items-center gap-1 font-mono text-[10px]">
            {[1, 4, 8, 20, 60].map((s) => (
              <button key={s} onClick={() => changeSpeed(s)}
                className={`px-2 py-0.5 rounded-xs font-bold border transition-all ${speed === s ? 'bg-[#003366] text-white border-[#003366]' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'}`}
              >{s}x</button>
            ))}
          </div>
        }
      >
        <div className="space-y-3 font-mono text-xs">
          {/* Time display */}
          <div className="flex items-center justify-between p-2 bg-slate-900 text-white rounded-sm">
            <div className="flex items-center gap-3">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase">MISSION ELAPSED TIME</div>
                <div className="text-lg font-bold tracking-wider font-mono">{formatTimeSec(missionTimeSec)}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase">CURRENT PHASE</div>
              <div className="text-xs font-bold text-amber-400">{missionPhase}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase">ANOMALY</div>
              <div className={`text-xs font-bold ${currentDataset.anomaly ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                {currentDataset.anomaly ?? 'NONE'}
              </div>
            </div>
          </div>

          {/* Scrub slider */}
          <div className="space-y-1.5">
            <input
              type="range" min={0} max={MISSION_TOTAL_DURATION_SEC}
              value={Math.round(missionTimeSec)}
              onChange={handleSeek}
              className="w-full h-2 accent-[#2563EB] cursor-pointer rounded-full"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-bold">
              <span>T+00:00:00</span>
              <span>{progress.toFixed(1)}% complete</span>
              <span>{formatTimeSec(MISSION_TOTAL_DURATION_SEC)}</span>
            </div>
          </div>

          {/* Transport controls */}
          <div className="flex items-center justify-center gap-3 py-1">
            <button onClick={() => missionPlaybackEngine.seek(0)}
              className="p-1.5 rounded-sm bg-slate-100 border border-slate-300 hover:bg-slate-200 transition-colors"
              title="Seek to start">
              <SkipBack className="w-4 h-4 text-slate-600" />
            </button>
            <button onClick={togglePlay}
              className="px-6 py-1.5 rounded-sm bg-[#003366] text-white font-bold uppercase tracking-wider hover:bg-[#002244] transition-colors flex items-center gap-2">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>
            <button onClick={() => missionPlaybackEngine.seek(MISSION_TOTAL_DURATION_SEC)}
              className="p-1.5 rounded-sm bg-slate-100 border border-slate-300 hover:bg-slate-200 transition-colors"
              title="Seek to end">
              <SkipForward className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </Panel>

      {/* ── Mission Phase Rail ────────────────────────────────────────────────── */}
      <Panel title="Mission Phase Timeline Rail" icon={Clock}>
        <div className="flex items-center gap-0 w-full overflow-x-auto pb-1">
          {MISSION_DATASET.map((row, i) => {
            const isActive = missionTimeSec >= row.timeSec && (i === MISSION_DATASET.length - 1 || missionTimeSec < MISSION_DATASET[i + 1].timeSec);
            const isPast = !isActive && missionTimeSec >= row.timeSec;
            const width = i < MISSION_DATASET.length - 1
              ? ((MISSION_DATASET[i + 1].timeSec - row.timeSec) / MISSION_TOTAL_DURATION_SEC) * 100
              : 5;
            return (
              <button
                key={row.timeSec}
                onClick={() => missionPlaybackEngine.seek(row.timeSec)}
                title={row.phase}
                style={{ minWidth: `${Math.max(width, 4)}%`, flexShrink: 0 }}
                className={`relative h-8 border-r border-white/50 flex flex-col items-center justify-center transition-all text-[8px] font-bold uppercase tracking-wide truncate px-0.5 ${
                  isActive ? 'bg-[#003366] text-white' :
                  isPast ? (row.anomaly ? 'bg-red-200 text-red-800' : 'bg-emerald-100 text-emerald-800') :
                  'bg-slate-100 text-slate-500 hover:bg-slate-200'
                } ${row.anomaly && !isActive ? 'border-t-2 border-t-red-500' : ''}`}
              >
                <span className="truncate w-full text-center">{row.phaseCode.replace(/_/g, ' ')}</span>
              </button>
            );
          })}
        </div>
      </Panel>

      {/* ── Live Waveform Strip ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <Panel title="EGT Trend (Last 20 Mission States)" icon={Play}>
          <div className="space-y-1 font-mono text-[10px]">
            {MISSION_DATASET.filter((r) => r.timeSec <= missionTimeSec).slice(-12).map((row, i) => {
              const egtC = Math.round(row.egtKelvin - 273.15);
              const barPct = Math.max(0, Math.min(100, (egtC / 1100) * 100));
              const isCrit = egtC > 1000;
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-slate-400 w-16 shrink-0">{formatTimeSec(row.timeSec)}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 relative">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${isCrit ? 'bg-red-500' : egtC > 800 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                  <span className={`w-16 text-right font-bold ${isCrit ? 'text-red-600' : 'text-slate-700'}`}>{egtC}°C</span>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Vibration G & N1 RPM Trend" icon={Play}>
          <div className="space-y-1 font-mono text-[10px]">
            {MISSION_DATASET.filter((r) => r.timeSec <= missionTimeSec).slice(-12).map((row, i) => {
              const barPct = Math.max(0, Math.min(100, (row.vibrationG / 3.0) * 100));
              const isCrit = row.vibrationG > 2.0;
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-slate-400 w-16 shrink-0">{formatTimeSec(row.timeSec)}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 relative">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${isCrit ? 'bg-red-500' : row.vibrationG > 1.5 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                  <span className={`w-16 text-right font-bold ${isCrit ? 'text-red-600' : 'text-slate-700'}`}>{row.vibrationG.toFixed(2)}G</span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* ── Bookmark Panel ────────────────────────────────────────────────────── */}
      <Panel title="Critical Event Bookmarks" icon={Bookmark}>
        {bookmarks.length === 0 ? (
          <p className="text-[11px] text-slate-400 font-mono py-2">No bookmarks yet. Anomaly events are automatically bookmarked during mission playback.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {bookmarks.map((bm, i) => (
              <button key={i} onClick={() => missionPlaybackEngine.seek(bm.timeSec)}
                className="p-2 bg-amber-50 border border-amber-300 rounded-sm text-left hover:bg-amber-100 transition-colors font-mono text-xs">
                <div className="text-[10px] font-bold text-amber-800">{formatTimeSec(bm.timeSec)}</div>
                <div className="text-[11px] text-amber-900 font-semibold truncate">{bm.label}</div>
              </button>
            ))}
          </div>
        )}
      </Panel>

      {/* ── Recent Timeline Events ────────────────────────────────────────────── */}
      <Panel title="Recorded Mission Events" icon={Clock} noPad>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
                <th className="p-2">Time</th>
                <th className="p-2">Severity</th>
                <th className="p-2">Category</th>
                <th className="p-2">Event</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {timelineEvents.slice(0, 15).map((ev) => (
                <tr key={ev.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                  onClick={() => missionPlaybackEngine.seek(ev.timeSec)}>
                  <td className="p-2 text-slate-500">{ev.timestamp}</td>
                  <td className="p-2">
                    <span className={`px-1.5 py-0.5 rounded-xs font-bold text-[9px] ${ev.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : ev.severity === 'WARNING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {ev.severity}
                    </span>
                  </td>
                  <td className="p-2 text-slate-600 text-[10px]">{ev.category}</td>
                  <td className="p-2 text-slate-900 font-semibold">{ev.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
});
ReplayView.displayName = 'ReplayView';
