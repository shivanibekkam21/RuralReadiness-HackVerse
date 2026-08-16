import React, { useState, useEffect } from 'react';
import {
  Layers,
  TrendingUp,
  AlertTriangle,
  Flame,
  Repeat,
  Sliders,
  Shield,
  ArrowRight,
  Droplet,
  Zap,
  Truck,
  GraduationCap,
  HeartPulse,
  Wifi,
  BarChart3,
  MapPin,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { VillageDevelopmentHealth, LanguageCode, ProblemHotspot } from '../types';
import { getTranslation } from '../utils/translations';
import { fetchVillages, fetchHotspots } from '../services/api';

interface DevelopmentDashboardProps {
  language: LanguageCode;
  onNavigate: (tab: string) => void;
  onSelectVillageForSim?: (villageId: string) => void;
}

export const DevelopmentDashboard: React.FC<DevelopmentDashboardProps> = ({
  language,
  onNavigate,
  onSelectVillageForSim
}) => {
  const [villages, setVillages] = useState<VillageDevelopmentHealth[]>([]);
  const [hotspots, setHotspots] = useState<ProblemHotspot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [vData, hData] = await Promise.all([fetchVillages(), fetchHotspots()]);
        setVillages(vData);
        setHotspots(hData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Compute aggregated averages
  const overallAvg = villages.length
    ? Math.round(villages.reduce((sum, v) => sum + v.overallScore, 0) / villages.length)
    : 72;

  const infraAvg = villages.length
    ? Math.round(villages.reduce((sum, v) => sum + v.categoryScores.infrastructure, 0) / villages.length)
    : 66;

  const waterAvg = villages.length
    ? Math.round(villages.reduce((sum, v) => sum + v.categoryScores.water, 0) / villages.length)
    : 60;

  const powerAvg = villages.length
    ? Math.round(villages.reduce((sum, v) => sum + v.categoryScores.power, 0) / villages.length)
    : 74;

  const healthAvg = villages.length
    ? Math.round(villages.reduce((sum, v) => sum + v.categoryScores.health, 0) / villages.length)
    : 72;

  const eduAvg = villages.length
    ? Math.round(villages.reduce((sum, v) => sum + v.categoryScores.education, 0) / villages.length)
    : 78;

  const connAvg = villages.length
    ? Math.round(villages.reduce((sum, v) => sum + v.categoryScores.connectivity, 0) / villages.length)
    : 65;

  return (
    <div id="development-intelligence-dashboard" className="space-y-6">
      {/* Header Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>{getTranslation(language, 'intelligenceDashboard')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Rural Development Intelligence Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Aggregated citizen grievance telemetry converted into regional infrastructure health indexes and priority intervention roadmaps.
            </p>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex flex-wrap gap-2">
            <button
              id="dash-open-hotspots-btn"
              onClick={() => onNavigate('hotspots')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer flex items-center space-x-1.5"
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Hotspot Map</span>
            </button>

            <button
              id="dash-open-simulator-btn"
              onClick={() => onNavigate('simulator')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white text-xs font-bold shadow-md cursor-pointer flex items-center space-x-1.5"
            >
              <Sliders className="w-4 h-4" />
              <span>Launch Simulator</span>
            </button>
          </div>
        </div>

        {/* Live Hotspot Alert Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent border border-amber-500/30 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Active Automated Hotspot Alerts Detected in Cluster</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-white">Vikaspur Sector 4:</strong> +42% surge in Road damage complaints.
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                Critical Hotspot
              </span>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-white">Rampur Ward 2:</strong> +65% spike in Drinking Water interruption.
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                Water Deficit
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Health Score & 6 Sector Dimensions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Health Score Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Regional Health Index
            </span>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-5xl font-black text-white">{overallAvg}</span>
              <span className="text-xl font-bold text-slate-500">/ 100</span>
            </div>
            <div className="mt-2 text-xs text-emerald-400 font-semibold flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+4.2 points after last quarter pipeline upgrades</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Composite index calculated from grievance resolution speed, recurring issue frequency, and service uptime across all 6 monitored villages.
          </p>

          <button
            onClick={() => onNavigate('priority-engine')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center space-x-2 cursor-pointer transition-colors"
          >
            <span>View "Where to Act First" Rankings</span>
            <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
          </button>
        </div>

        {/* 6 Category Dimension Scores */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center justify-between">
            <span>6-Sector Infrastructure Readiness Health</span>
            <span className="text-xs font-normal text-slate-400">Regional Benchmark</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Roads & Infrastructure', score: infraAvg, icon: Truck, color: 'bg-amber-500', text: 'text-amber-400' },
              { label: 'Rural Water Supply', score: waterAvg, icon: Droplet, color: 'bg-blue-500', text: 'text-blue-400' },
              { label: 'Electricity & Grid', score: powerAvg, icon: Zap, color: 'bg-yellow-500', text: 'text-yellow-400' },
              { label: 'Healthcare Readiness', score: healthAvg, icon: HeartPulse, color: 'bg-rose-500', text: 'text-rose-400' },
              { label: 'Education Quality', score: eduAvg, icon: GraduationCap, color: 'bg-emerald-500', text: 'text-emerald-400' },
              { label: 'Broadband Connectivity', score: connAvg, icon: Wifi, color: 'bg-cyan-500', text: 'text-cyan-400' }
            ].map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1.5 rounded-lg bg-slate-900 ${cat.text}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-200">{cat.label}</span>
                    </div>
                    <span className="text-xs font-extrabold text-white">{cat.score} / 100</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${cat.color} transition-all duration-500`}
                      style={{ width: `${cat.score}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Village Health Score Leaderboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Village-wise Development Health Scorecard</h3>
            <p className="text-xs text-slate-400">Ranked by development urgency and active grievance load.</p>
          </div>
          <span className="text-xs text-slate-400 hidden sm:block">6 Villages Monitored</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {villages.map((v) => (
            <div
              key={v.id}
              className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-4 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>{v.name}</span>
                  </h4>
                  <span className="text-xs text-slate-400">{v.district}, Pop: {v.population.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-white">{v.overallScore}</span>
                  <span className="text-xs text-slate-400 block">Health Index</span>
                </div>
              </div>

              {/* Status Tags */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">
                  Top Gap: {v.topNeedCategory}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                  {v.pendingGrievances} Pending Issues
                </span>
              </div>

              {/* Key Needs Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-300 pt-1 border-t border-slate-700/60">
                <div className="flex justify-between">
                  <span className="text-slate-400">Roads:</span>
                  <span className="font-bold text-white">{v.categoryScores.infrastructure}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Water:</span>
                  <span className="font-bold text-white">{v.categoryScores.water}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Power:</span>
                  <span className="font-bold text-white">{v.categoryScores.power}/100</span>
                </div>
              </div>

              {/* Simulate Intervention Button */}
              <button
                onClick={() => {
                  if (onSelectVillageForSim) onSelectVillageForSim(v.id);
                  onNavigate('simulator');
                }}
                className="w-full py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-bold text-xs border border-purple-500/30 flex items-center justify-center space-x-1 cursor-pointer transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Simulate Budget Impact</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
