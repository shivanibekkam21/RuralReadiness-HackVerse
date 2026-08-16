import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Shield,
  Star,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  TrendingUp
} from 'lucide-react';
import { DepartmentPerformance, LanguageCode } from '../types';
import { getTranslation } from '../utils/translations';
import { fetchDepartmentPerformance } from '../services/api';

interface DepartmentAnalyticsProps {
  language: LanguageCode;
}

export const DepartmentAnalytics: React.FC<DepartmentAnalyticsProps> = ({ language }) => {
  const [departments, setDepartments] = useState<DepartmentPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDepartmentPerformance();
        setDepartments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div id="department-analytics-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-2">
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <span>Department Performance Scorecard</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Government Accountability & SLA Metrics
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
          Transparent department performance tracking measuring speed of resolution, SLA compliance, citizen satisfaction ratings, and backlog volume.
        </p>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments.map((dept) => (
          <div
            key={dept.shortCode}
            id={`dept-card-${dept.shortCode}`}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white leading-snug">
                  {dept.department}
                </h3>
                <span className="text-xs text-slate-400">Head: {dept.headOfficer}</span>
              </div>

              {/* Citizen Rating */}
              <div className="flex items-center space-x-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl text-amber-400 font-bold text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{dept.citizenSatisfaction} / 5.0</span>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 text-center">
                <span className="text-slate-400 text-[10px] block">Resolved Rate</span>
                <span className="text-base font-extrabold text-emerald-400 mt-0.5 block">
                  {dept.resolutionPercentage}%
                </span>
                <span className="text-[10px] text-slate-500">{dept.resolved}/{dept.received}</span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 text-center">
                <span className="text-slate-400 text-[10px] block">Avg Speed</span>
                <span className="text-base font-extrabold text-blue-400 mt-0.5 block">
                  {dept.avgResolutionDays} Days
                </span>
                <span className="text-[10px] text-slate-500">SLA Standard</span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 text-center">
                <span className="text-slate-400 text-[10px] block">Overdue SLA</span>
                <span
                  className={`text-base font-extrabold mt-0.5 block ${
                    dept.overdue > 3 ? 'text-rose-400' : 'text-amber-400'
                  }`}
                >
                  {dept.overdue}
                </span>
                <span className="text-[10px] text-slate-500">{dept.pending} Pending</span>
              </div>
            </div>

            {/* Resolution Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Resolution Progress</span>
                <span className="font-semibold text-white">{dept.resolutionPercentage}% Completed</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  style={{ width: `${dept.resolutionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
