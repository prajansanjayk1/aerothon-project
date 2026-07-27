import React from 'react';
import { Search, Filter, LayoutGrid, List } from 'lucide-react';
import { Input, Select } from '@/components';

interface FleetFilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  squadronFilter: string;
  setSquadronFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  activeTab: 'matrix' | 'list';
  setActiveTab: (tab: 'matrix' | 'list') => void;
  totalCount: number;
}

export const FleetFilterBar: React.FC<FleetFilterBarProps> = React.memo(({
  searchQuery,
  setSearchQuery,
  squadronFilter,
  setSquadronFilter,
  statusFilter,
  setStatusFilter,
  activeTab,
  setActiveTab,
  totalCount,
}) => (
  <div className="bg-white border border-slate-300 rounded-sm p-2 shadow-2xs flex items-center justify-between gap-3 font-mono text-xs select-none shrink-0">
    <div className="flex items-center gap-2 flex-1 max-w-md">
      <div className="relative flex-1">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        <Input
          type="text"
          placeholder="Search by Tail (e.g. TJ-203), Pilot, or Bay..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
    </div>

    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-slate-500">
        <Filter className="w-3.5 h-3.5 text-[#2563EB]" />
        <span className="text-[10px] font-bold uppercase tracking-wider">FILTER:</span>
      </div>

      <Select
        value={squadronFilter}
        onChange={(e) => setSquadronFilter(e.target.value)}
        className="w-48"
      >
        <option value="ALL">ALL SQUADRONS (3)</option>
        <option value="No. 45 Sqn">No. 45 Sqn (Flying Daggers)</option>
        <option value="No. 18 Sqn">No. 18 Sqn (Flying Bullets)</option>
        <option value="HAL Flight Test">HAL Flight Test Center</option>
      </Select>

      <Select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="w-40"
      >
        <option value="ALL">ALL STATUSES ({totalCount})</option>
        <option value="AIRBORNE">AIRBORNE / COMBAT</option>
        <option value="QRA">ARMED STANDBY (QRA)</option>
        <option value="GROUNDED">GROUNDED / MAINT</option>
      </Select>
    </div>

    <div className="flex items-center bg-slate-100 p-0.5 rounded-sm border border-slate-300">
      <button
        onClick={() => setActiveTab('matrix')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-xs font-rajdhani font-bold text-xs uppercase tracking-wider transition-all ${
          activeTab === 'matrix' ? 'bg-[#2563EB] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span>Squadron Matrix</span>
      </button>
      <button
        onClick={() => setActiveTab('list')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-xs font-rajdhani font-bold text-xs uppercase tracking-wider transition-all ${
          activeTab === 'list' ? 'bg-[#2563EB] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <List className="w-3.5 h-3.5" />
        <span>List View</span>
      </button>
    </div>
  </div>
));
FleetFilterBar.displayName = 'FleetFilterBar';
