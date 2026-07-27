import React, { useState } from 'react';
import { Panel } from '@/components';
import { AlertTriangle, CheckCircle, Bell, Filter, Clock } from 'lucide-react';
import { useMissionStore } from '@/stores/useMissionStore';
import { useUiStore } from '@/stores';
import { Alert } from '@/types';

type CategoryFilter = 'ALL' | 'PROPULSION' | 'AVIONICS' | 'THERMAL' | 'ELECTRICAL';

export const AlertsView: React.FC = React.memo(() => {
  const alerts = useMissionStore((s) => s.alerts);
  const { acknowledgeAlert } = useMissionStore();
  const { setSelectedStageRef } = useUiStore();
  const [filter, setFilter] = useState<CategoryFilter>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = alerts.filter((a) => filter === 'ALL' || a.category === filter);
  const critical = alerts.filter((a) => a.severity === 'CRITICAL' && !a.acknowledged).length;
  const warnings = alerts.filter((a) => a.severity === 'WARNING' && !a.acknowledged).length;
  const ackCount = alerts.filter((a) => a.acknowledged).length;

  const categories: CategoryFilter[] = ['ALL', 'PROPULSION', 'AVIONICS', 'THERMAL', 'ELECTRICAL'];

  return (
    <div className="p-3 h-full overflow-y-auto space-y-3 bg-[#F4F6F8]">

      {/* ── Alert Statistics Summary ──────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Critical Active', val: critical, icon: AlertTriangle, color: 'text-red-700', bg: 'bg-red-50 border-red-300' },
          { label: 'Warnings Active', val: warnings, icon: Bell, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-300' },
          { label: 'Acknowledged', val: ackCount, icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-300' },
          { label: 'Total Alerts', val: alerts.length, icon: Filter, color: 'text-slate-700', bg: 'bg-white border-slate-300' },
        ].map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className={`p-3 rounded-sm border shadow-2xs ${m.bg}`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${m.color}`}>{m.label}</span>
                <Icon className={`w-3.5 h-3.5 ${m.color}`} />
              </div>
              <div className={`text-2xl font-bold font-mono mt-1 ${m.color}`}>{m.val}</div>
            </div>
          );
        })}
      </div>

      {/* ── Category Filter Tabs ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 font-mono text-xs">
        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">FILTER:</span>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-2.5 py-1 rounded-xs font-bold uppercase text-[10px] tracking-wider border transition-all ${
              filter === cat ? 'bg-[#003366] text-white border-[#003366]' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}>
            {cat}
          </button>
        ))}
        <span className="ml-auto text-slate-400 text-[10px]">{filtered.length} alerts shown</span>
      </div>

      {/* ── Alert Cards ───────────────────────────────────────────────────────── */}
      <Panel title="Active Diagnostic Alert Investigation Center" icon={AlertTriangle}>
        <div className="space-y-2 font-mono text-xs">
          {filtered.length === 0 && (
            <div className="text-center py-6 text-slate-400 text-[11px]">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
              No alerts for selected category. All systems nominal.
            </div>
          )}
          {filtered.map((alert: Alert) => {
            const isExpanded = expandedId === alert.id;
            const isCrit = alert.severity === 'CRITICAL';
            const isWarn = alert.severity === 'WARNING';
            return (
              <div key={alert.id}
                className={`rounded-sm border shadow-2xs overflow-hidden transition-all ${
                  alert.acknowledged ? 'opacity-50 bg-slate-50 border-slate-200' :
                  isCrit ? 'bg-red-50 border-red-400 ring-1 ring-red-300' :
                  isWarn ? 'bg-amber-50 border-amber-300' :
                  'bg-white border-slate-300'
                }`}
              >
                {/* Alert header — always visible */}
                <div
                  className="flex items-center justify-between gap-3 p-2.5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`shrink-0 px-2 py-0.5 rounded-xs font-bold text-[9px] uppercase ${isCrit ? 'bg-red-600 text-white' : isWarn ? 'bg-amber-500 text-white' : 'bg-slate-400 text-white'}`}>
                      {alert.severity}
                    </span>
                    <span className="font-bold text-slate-900 truncate">{alert.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-500">{alert.timestamp}</span>
                    <span className={`px-1.5 py-0.5 rounded-xs text-[9px] font-bold border ${alert.acknowledged ? 'text-slate-400 border-slate-200 bg-slate-50' : 'text-slate-600 border-slate-300 bg-white'}`}>
                      {alert.acknowledged ? 'ACKD' : 'ACTIVE'}
                    </span>
                  </div>
                </div>

                {/* Expanded investigation details */}
                {isExpanded && (
                  <div className="border-t border-current/10 p-3 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 bg-white/70 rounded-xs border border-slate-200">
                        <div className="text-[9px] text-slate-500 font-bold uppercase">CATEGORY</div>
                        <div className="text-[11px] font-bold text-slate-800">{alert.category}</div>
                      </div>
                      <div className="p-2 bg-white/70 rounded-xs border border-slate-200">
                        <div className="text-[9px] text-slate-500 font-bold uppercase">SUBSYSTEM</div>
                        <div className="text-[11px] font-bold text-[#003366] uppercase">{alert.subsystemRef}</div>
                      </div>
                      <div className="p-2 bg-white/70 rounded-xs border border-slate-200">
                        <div className="text-[9px] text-slate-500 font-bold uppercase">AI CONFIDENCE</div>
                        <div className="text-[11px] font-bold text-emerald-700">{alert.aiConfidencePct}%</div>
                      </div>
                    </div>

                    <div className="p-2 bg-white/70 rounded-xs border border-slate-200">
                      <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">DESCRIPTION</div>
                      <p className="text-[11px] text-slate-700 leading-relaxed">{alert.description}</p>
                    </div>

                    <div className={`p-2 rounded-xs border ${isCrit ? 'bg-red-100/50 border-red-300' : 'bg-amber-100/50 border-amber-300'}`}>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600 mb-1">RECOMMENDED ACTION</div>
                      <p className="text-[11px] font-semibold text-slate-800">{alert.recommendedAction}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedStageRef(alert.subsystemRef); }}
                        className="px-3 py-1 bg-[#003366] text-white rounded-xs font-bold text-[10px] uppercase hover:bg-[#002244] transition-colors">
                        View in Digital Twin
                      </button>
                      {!alert.acknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-xs font-bold text-[10px] uppercase hover:bg-emerald-700 transition-colors">
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Panel>

      {/* ── Alert History ─────────────────────────────────────────────────────── */}
      <Panel title="Alert History — Acknowledged & Resolved" icon={Clock} noPad>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 uppercase text-[10px] tracking-wider font-bold text-slate-700 border-b border-slate-200">
                <th className="p-2">ID</th><th className="p-2">Time</th><th className="p-2">Severity</th><th className="p-2">Subsystem</th><th className="p-2">Title</th><th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alerts.filter((a) => a.acknowledged).slice(0, 10).map((a) => (
                <tr key={a.id} className="text-slate-500 hover:bg-slate-50">
                  <td className="p-2 text-[10px]">{a.id}</td>
                  <td className="p-2">{a.timestamp}</td>
                  <td className="p-2"><span className="px-1 py-0.5 rounded-xs bg-slate-100 font-bold text-[9px]">{a.severity}</span></td>
                  <td className="p-2 uppercase">{a.subsystemRef}</td>
                  <td className="p-2 truncate max-w-[200px]">{a.title}</td>
                  <td className="p-2"><span className="text-emerald-600 font-bold text-[9px]">ACKNOWLEDGED</span></td>
                </tr>
              ))}
              {alerts.filter((a) => a.acknowledged).length === 0 && (
                <tr><td colSpan={6} className="p-3 text-center text-slate-400 text-[11px]">No acknowledged alerts yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
});
AlertsView.displayName = 'AlertsView';
