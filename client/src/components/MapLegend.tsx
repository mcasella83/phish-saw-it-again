import React from "react";

export default function MapLegend() {
  return (
    <div className="bg-background border rounded-lg p-3 shadow-lg">
      <h4 className="text-sm font-semibold mb-2">Show Count Legend</h4>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
          <span className="text-xs">1-4 shows</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-orange-500 rounded-full border-2 border-white shadow-sm"></div>
          <span className="text-xs">5-9 shows</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
          <span className="text-xs">10+ shows</span>
        </div>
      </div>
    </div>
  );
}
