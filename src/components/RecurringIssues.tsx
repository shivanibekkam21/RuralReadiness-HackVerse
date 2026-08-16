import React, { useState, useEffect } from 'react';
import {
  Repeat,
  AlertTriangle,
  Sparkles,
  MapPin,
  Sliders,
  ArrowRight,
  TrendingDown,
  Clock,
  Layers,
  Banknote
} from 'lucide-react';
import { RecurringIssueCluster, LanguageCode } from '../types';
import { getTranslation } from '../utils/translations';
import { fetchRecurringIssues } from '../services/api';

interface RecurringIssuesProps {
  language: LanguageCode;
  onNavigate: (tab: string) => void;
  onSelectVillageForSim?: (villageId: string) => void;
}

export const RecurringIssues: React.FC<RecurringIssuesProps> = ({
  language,
  onNavigate,
  onSelectVillageForSim
}) => {
  const [clusters, setClusters] = useState<RecurringIssueCluster[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchRecurringIssues();
        setClusters(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div id="recurring-issues-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-2">
        <div className="flex items-center space-x-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
          <Repeat className="w-4 h-4 text-rose-400" />
          <span>Pattern Recognition & Problem Clustering</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Recurring Issue Clusters & Systemic Bottlenecks
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
          AI detects repeated temporary fixes that fail within 60-90 days, recommending permanent capital infrastructure investments instead of recurring maintenance expenditure.
        </p>
      </div>

      {/* Cluster Cards */}
      <div className="space-y-4">
        {clusters.map((cluster) => (
          <div
            key={cluster.id}
            id={`recurring-cluster-${cluster.id}`}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl hover:border-slate-700 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {cluster.complaintCount} Repeated Grievances
                  </span>
                  <span className="text-xs font-semibold text-slate-400">{cluster.category}</span>
                  <span className="text-xs text-slate-500 font-mono">Status: {cluster.status}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-1.5">{cluster.title}</h3>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 block">Affected Village</span>
                <span className="text-sm font-bold text-white flex items-center sm:justify-end space-x-1 mt-0.5">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{cluster.affectedVillage} ({cluster.affectedArea})</span>
                </span>
              </div>
            </div>

            {/* Root Cause Analysis & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                <span className="font-bold text-slate-200 block">Why Regular Maintenance Keeps Failing:</span>
                <p className="text-slate-300 leading-relaxed">{cluster.rootCauseAnalysis}</p>
                <div className="text-slate-400 pt-1 text-[11px]">
                  First Reported: <strong className="text-slate-200">{cluster.firstReportedDate}</strong> • Sample IDs: {cluster.sampleGrievanceIds.join(', ')}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-emerald-300 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Permanent Capital Solution Recommended:</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-medium">
                  {cluster.recommendedAction}
                </p>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-slate-400">Estimated Budget:</span>
                  <span className="font-bold text-emerald-400 font-mono text-xs">
                    {cluster.estimatedCost}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs text-emerald-400 font-medium flex items-center space-x-1.5">
                <TrendingDown className="w-4 h-4" />
                <span>Fixing this permanently will eliminate {cluster.complaintCount}+ recurring complaints.</span>
              </div>

              <button
                id={`btn-cluster-simulate-${cluster.id}`}
                onClick={() => {
                  if (onSelectVillageForSim) onSelectVillageForSim('vil-vikaspur');
                  onNavigate('simulator');
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-bold text-xs shadow-md cursor-pointer flex items-center space-x-1.5 transition-all"
              >
                <Sliders className="w-4 h-4" />
                <span>Simulate Permanent Project ({cluster.estimatedCost})</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
