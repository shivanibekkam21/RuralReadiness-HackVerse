import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  AlertTriangle,
  ArrowRight,
  Sliders,
  MapPin,
  CheckCircle2,
  Sparkles,
  Users,
  Clock,
  Flame
} from 'lucide-react';
import { DevelopmentPriorityRank, LanguageCode } from '../types';
import { getTranslation } from '../utils/translations';
import { fetchPriorityRankings } from '../services/api';

interface DevelopmentPriorityEngineProps {
  language: LanguageCode;
  onNavigate: (tab: string) => void;
  onSelectVillageForSim?: (villageId: string) => void;
}

export const DevelopmentPriorityEngine: React.FC<DevelopmentPriorityEngineProps> = ({
  language,
  onNavigate,
  onSelectVillageForSim
}) => {
  const [rankings, setRankings] = useState<DevelopmentPriorityRank[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchPriorityRankings();
        setRankings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div id="priority-engine-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Priority Decision Engine</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Where Should We Act First?
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
          Objective algorithmic ranking that balances active grievance density, severity weighting, vulnerable populations affected, and chronic infrastructure failures.
        </p>

        {/* Methodology Formula Pill */}
        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 flex flex-wrap items-center gap-2">
          <span className="font-bold text-white">Ranking Formula:</span>
          <span className="bg-slate-900 px-2 py-0.5 rounded text-amber-300 font-mono text-[11px]">
            Score = (Grievance Density × 0.3) + (Severity Weight × 0.25) + (Vulnerable Pop × 0.25) + (Recurring Factor × 0.2)
          </span>
        </div>
      </div>

      {/* Ranked Villages List */}
      <div className="space-y-4">
        {rankings.map((rank) => (
          <div
            key={rank.villageId}
            id={`rank-card-${rank.rank}`}
            className={`bg-slate-900 border rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl transition-all ${
              rank.rank === 1
                ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-950/20 via-slate-900 to-slate-900'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shrink-0 ${
                    rank.rank === 1
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-amber-500/20'
                      : rank.rank === 2
                      ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950 shadow-slate-400/20'
                      : rank.rank === 3
                      ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100 shadow-amber-900/20'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  #{rank.rank}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                    <span>{rank.villageName}</span>
                    <span className="text-xs font-normal text-slate-400">({rank.district})</span>
                  </h3>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-xs font-semibold text-rose-400">
                      Disruptions: {rank.essentialServiceDisruptions}
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-400">
                      Population Affected: {rank.populationAffected.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Priority Level Badge */}
              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 uppercase tracking-wider block">
                  Priority Urgency
                </span>
                <span className={`text-xl font-black font-mono ${
                  rank.priorityLevel === 'Critical' ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {rank.priorityLevel}
                </span>
              </div>
            </div>

            {/* AI Transparent Rationale & Impact */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-emerald-300 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Why Ranked #{rank.rank} (AI Rationale):</span>
              </div>
              <p className="text-slate-200 leading-relaxed font-medium">
                {rank.reason}
              </p>
              <div className="text-slate-400 pt-1">
                <strong className="text-white">Recommended Fast-Track Project:</strong>{' '}
                {rank.recommendedIntervention} ({rank.estimatedBudget})
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-400">
                Total Grievances: <strong className="text-white">{rank.totalGrievances}</strong> • Recurring: <strong className="text-rose-400">{rank.recurringIssues}</strong> • Avg Delay: {rank.resolutionDelayDays}d
              </div>

              <button
                id={`btn-simulate-rank-${rank.rank}`}
                onClick={() => {
                  if (onSelectVillageForSim) onSelectVillageForSim(rank.villageId);
                  onNavigate('simulator');
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer flex items-center space-x-2 transition-all hover:scale-102"
              >
                <Sliders className="w-4 h-4 text-slate-950" />
                <span>Simulate Impact for {rank.villageName}</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
