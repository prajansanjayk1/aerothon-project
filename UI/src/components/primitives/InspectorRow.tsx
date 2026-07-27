import React from 'react';

export interface InspectorRowProps {
  label: string;
  val: string | number;
  unit?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  statusColor?: string;
}

export const InspectorRow: React.FC<InspectorRowProps> = React.memo(({ label, val, unit = '', active = false, onClick, className = '', statusColor }) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between py-1.5 px-2.5 rounded-sm font-mono text-xs transition-all ${onClick ? 'cursor-pointer' : ''} ${
      active
        ? 'bg-sky-50 border-l-2 border-sky-600 font-bold text-slate-900 shadow-2xs'
        : 'hover:bg-slate-100 text-slate-700'
    } ${className}`}
  >
    <span className={active ? 'text-slate-900 font-bold' : 'text-slate-600 font-medium'}>{label}</span>
    <div className="flex items-center gap-1.5">
      <span className={active ? 'text-[#003366] font-bold text-sm' : 'text-slate-900 font-bold'}>
        {val} <span className="text-[10px] font-normal text-slate-500">{unit}</span>
      </span>
      {statusColor && <span className={`w-2 h-2 rounded-full ${statusColor}`} />}
    </div>
  </div>
));
InspectorRow.displayName = 'InspectorRow';
