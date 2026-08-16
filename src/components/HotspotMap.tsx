import React, { useState, useEffect } from 'react';
import {
  Flame,
  MapPin,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Sliders,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { ProblemHotspot, LanguageCode } from '../types';
import { getTranslation } from '../utils/translations';
import { fetchHotspots } from '../services/api';

interface HotspotMapProps {
  language: LanguageCode;
  onNavigate: (tab: string) => void;
  onSelectVillageForSim?: (villageId: string) => void;
}

export const HotspotMap: React.FC<HotspotMapProps> = ({
  language,
  onNavigate,
  onSelectVillageForSim
}) => {
  const [hotspots, setHotspots] = useState<ProblemHotspot[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<ProblemHotspot | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchHotspots();
        setHotspots(data);
        if (data.length > 0) setSelectedHotspot(data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = hotspots.filter((h) => {
    if (filterSeverity !== 'all' && h.severityLevel !== filterSeverity) return false;
    return true;
  });

  return (
    <div id="hotspot-map-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Problem Hotspot Detection</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Regional Problem Hotspots & Grievance Surges
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            AI spatial clustering identifies localized infrastructure failure spikes (&gt;25% 30-day surge).
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center space-x-2 bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
          {(['all', 'High', 'Medium'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize cursor-pointer transition-colors ${
                filterSeverity === sev
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev === 'all' ? 'All Severities' : `${sev} Surge`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Map / Location Grid & Hotspot Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hotspot Cards List */}
        <div className="space-y-3 lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((hotspot) => {
              const isSelected = selectedHotspot?.id === hotspot.id;
              return (
                <div
                  key={hotspot.id}
                  id={`hotspot-card-${hotspot.id}`}
                  onClick={() => setSelectedHotspot(hotspot)}
                  className={`bg-slate-900 border rounded-2xl p-5 space-y-4 cursor-pointer transition-all hover:scale-101 ${
                    isSelected
                      ? 'border-amber-500/80 ring-2 ring-amber-500/20 shadow-xl'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        hotspot.severityLevel === 'High'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {hotspot.severityLevel} Surge
                    </span>

                    <div className="flex items-center space-x-1 text-xs font-mono font-bold text-amber-400">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+{hotspot.surgePercentage}% Spike</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white flex items-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{hotspot.villageName}</span>
                    </h3>
                    <span className="text-xs font-semibold text-slate-400 block mt-0.5">
                      {hotspot.primaryCategory} ({hotspot.district})
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {hotspot.summaryInsight}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span>
                      Complaints: <strong className="text-white">{hotspot.complaintCount}</strong>
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      {hotspot.timeframe}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Hotspot Intelligence Breakdown */}
        {selectedHotspot && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Hotspot Deep Dive</span>
              </span>
              <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                +{selectedHotspot.surgePercentage}% Spike
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">{selectedHotspot.villageName}</h3>
              <p className="text-xs text-slate-400">{selectedHotspot.district} • {selectedHotspot.primaryCategory}</p>
            </div>

            {/* Impact Metric Chips */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">Total Grievances</span>
                <span className="text-lg font-bold text-white mt-0.5 block">
                  {selectedHotspot.complaintCount}
                </span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">Primary Category</span>
                <span className="text-xs font-bold text-amber-300 mt-1 block">
                  {selectedHotspot.primaryCategory}
                </span>
              </div>
            </div>

            {/* Summary Insight */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2 text-xs">
              <div className="flex items-center space-x-1 text-amber-300 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Hotspot Cluster Diagnosis</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {selectedHotspot.summaryInsight}
              </p>
            </div>

            {/* Active Issues List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block uppercase">
                Active Issues in Cluster:
              </span>
              <div className="space-y-1.5">
                {selectedHotspot.activeIssues.map((issue, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-800/80 text-xs text-slate-300 border border-slate-700/60">
                    • {issue}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                id="btn-hotspot-simulate"
                onClick={() => {
                  if (onSelectVillageForSim) onSelectVillageForSim(selectedHotspot.villageId);
                  onNavigate('simulator');
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-bold text-xs shadow-md cursor-pointer flex items-center justify-center space-x-1.5 transition-all"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Simulate Resolution Budget for {selectedHotspot.villageName}</span>
              </button>

              <button
                onClick={() => onNavigate('recurring')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>View Clustered Recurring Grievances</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
