import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  PlusCircle,
  MapPin
} from 'lucide-react';
import { Grievance, LanguageCode } from '../types';
import { getTranslation } from '../utils/translations';
import { fetchGrievances } from '../services/api';

interface CitizenMyGrievancesProps {
  language: LanguageCode;
  onNavigate: (tab: string) => void;
  onTrackPrefill: (id: string) => void;
}

export const CitizenMyGrievances: React.FC<CitizenMyGrievancesProps> = ({
  language,
  onNavigate,
  onTrackPrefill
}) => {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchGrievances();
        setGrievances(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = grievances.filter((g) => {
    if (filter === 'active') return g.status !== 'Resolved' && g.status !== 'Closed';
    if (filter === 'resolved') return g.status === 'Resolved' || g.status === 'Closed';
    return true;
  });

  return (
    <div id="citizen-my-grievances-container" className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Citizen Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            {getTranslation(language, 'myGrievances')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            View real-time resolution updates, officer remarks, and verify closed works.
          </p>
        </div>

        <button
          id="my-grievances-new-btn"
          onClick={() => onNavigate('report')}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{getTranslation(language, 'reportAProblem')}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
        {(['all', 'active', 'resolved'] as const).map((tabKey) => (
          <button
            key={tabKey}
            id={`my-grievances-filter-${tabKey}`}
            onClick={() => setFilter(tabKey)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
              filter === tabKey
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tabKey === 'all' ? 'All Grievances' : tabKey === 'active' ? 'Active / In Progress' : 'Resolved'}
          </button>
        ))}
      </div>

      {/* Grievance Cards List */}
      <div className="space-y-3">
        {filtered.map((g) => (
          <div
            key={g.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-colors shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {g.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    g.priority === 'Critical'
                      ? 'bg-rose-500/20 text-rose-300'
                      : g.priority === 'High'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {g.priority}
                </span>
                <span className="text-xs text-slate-400">{g.category}</span>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold self-start sm:self-auto ${
                  g.status === 'Resolved' || g.status === 'Closed'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : g.status === 'In Progress'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {g.status}
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-white">{g.title}</h4>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                {g.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{g.village}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>SLA Target: {g.expectedResolutionDate}</span>
                </span>
              </div>

              <button
                onClick={() => {
                  onTrackPrefill(g.id);
                  onNavigate('track');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold text-xs border border-emerald-500/30 flex items-center space-x-1 cursor-pointer"
              >
                <span>Track & Verify Resolution</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
