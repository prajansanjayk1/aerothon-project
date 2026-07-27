import React from 'react';
import { StatusBadge } from '@/components';

interface MetricItem {
  label: string;
  val: string;
  sub: string;
  status: string;
}

interface FleetSummaryRibbonProps {
  metrics: MetricItem[];
}

export const FleetSummaryRibbon: React.FC<FleetSummaryRibbonProps> = React.memo(({ metrics }) => (
  <div className="grid grid-cols-6 gap-2 bg-white text-slate-900 p-2 rounded-sm border border-[#E4E9EF] shadow-2xs font-mono select-none shrink-0">
    {metrics.map((m, idx) => (
      <div
        key={idx}
        className="flex flex-col justify-between bg-[#F8FAFC] border border-[#E4E9EF] rounded-xs p-2.5 hover:border-[#2563EB]/60 hover:bg-[#EAF1FE]/30 transition-all shadow-2xs relative overflow-hidden group"
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none truncate group-hover:text-slate-600 transition-colors">
            {m.label}
          </span>
          <StatusBadge status={m.status} size="sm" />
        </div>
        <div className="mt-1.5">
          <div className="text-base font-bold text-slate-900 tracking-tight leading-none">
            {m.val}
          </div>
          <div className="text-[10px] text-[#2563EB] font-bold truncate mt-1 leading-none">
            {m.sub}
          </div>
        </div>
      </div>
    ))}
  </div>
));
FleetSummaryRibbon.displayName = 'FleetSummaryRibbon';
