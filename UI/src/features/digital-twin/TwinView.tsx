import React from 'react';
import { DigitalTwinViewport, DigitalTwinInspector } from '../overview';
import { useUiStore } from '@/stores';
import { getStageFromRef } from '@/utils';

export const TwinView: React.FC = React.memo(() => {
  const { selectedStageRef, setSelectedStageRef } = useUiStore();

  const handleStageSelect = (refOrId: string | null) => {
    if (!refOrId) {
      setSelectedStageRef(null);
      return;
    }
    const target = getStageFromRef(refOrId);
    setSelectedStageRef(target === selectedStageRef ? null : target);
  };

  return (
    <div className="p-3 h-full overflow-y-auto space-y-3 bg-[#F4F6F8]">
      <div className="grid grid-cols-12 gap-3 h-[680px]">
        <div className="col-span-8 h-full">
          <DigitalTwinViewport selectedStageRef={selectedStageRef} onSelectStage={handleStageSelect} />
        </div>
        <div className="col-span-4 h-full">
          <DigitalTwinInspector selectedStageRef={selectedStageRef} onSelectStage={handleStageSelect} />
        </div>
      </div>
    </div>
  );
});
TwinView.displayName = 'TwinView';
