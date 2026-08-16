import React from 'react';
import {
  Home,
  PlusCircle,
  Search,
  FileText,
  Users,
  Shield,
  Layers,
  Flame,
  Repeat,
  TrendingUp,
  Sliders,
  BarChart3,
  CheckCircle,
  Info,
  ChevronRight
} from 'lucide-react';
import { UserRole, LanguageCode } from '../types';
import { getTranslation } from '../utils/translations';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  userRole: UserRole;
  language: LanguageCode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  userRole,
  language
}) => {
  const citizenNav = [
    { id: 'home', labelKey: 'appName', icon: Home, badge: '' },
    { id: 'report', labelKey: 'reportAProblem', icon: PlusCircle, badge: 'AI Live' },
    { id: 'track', labelKey: 'trackGrievance', icon: Search, badge: '' },
    { id: 'my-grievances', labelKey: 'myGrievances', icon: FileText, badge: '3' },
    { id: 'hotspots', labelKey: 'hotspots', icon: Flame, badge: '' }
  ];

  const officerNav = [
    { id: 'officer-dashboard', labelKey: 'officerDashboard', icon: Shield, badge: 'Live' },
    { id: 'track', labelKey: 'trackGrievance', icon: Search, badge: '' },
    { id: 'dept-performance', labelKey: 'deptPerformance', icon: BarChart3, badge: '' },
    { id: 'hotspots', labelKey: 'hotspots', icon: Flame, badge: 'Alerts' }
  ];

  const adminNav = [
    { id: 'intelligence', labelKey: 'intelligenceDashboard', icon: Layers, badge: 'Score 72' },
    { id: 'hotspots', labelKey: 'hotspots', icon: Flame, badge: 'Surge' },
    { id: 'recurring', labelKey: 'recurringIssues', icon: Repeat, badge: '3 Clusters' },
    { id: 'priority-engine', labelKey: 'priorityEngine', icon: TrendingUp, badge: 'Rank #1' },
    { id: 'simulator', labelKey: 'simulator', icon: Sliders, badge: 'AI Model' },
    { id: 'dept-performance', labelKey: 'deptPerformance', icon: BarChart3, badge: '' },
    { id: 'all-grievances', labelKey: 'myGrievances', icon: FileText, badge: '52' }
  ];

  const navItems = userRole === 'citizen' ? citizenNav : userRole === 'officer' ? officerNav : adminNav;

  return (
    <aside
      id="app-sidebar"
      className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 overflow-y-auto"
    >
      <div className="p-4 space-y-6">
        {/* Role Header Badge */}
        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Experience
            </span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                userRole === 'citizen'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : userRole === 'officer'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              }`}
            >
              {userRole === 'citizen'
                ? getTranslation(language, 'roleCitizen')
                : userRole === 'officer'
                ? getTranslation(language, 'roleOfficer')
                : getTranslation(language, 'roleAdmin')}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            {userRole === 'citizen'
              ? 'Report local issues, track SLA timeline & verify on-ground resolution.'
              : userRole === 'officer'
              ? 'Triage assigned department complaints, dispatch repairs & record evidence.'
              : 'Holistic rural development analytics, recurring problem detection & simulator.'}
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <div className="px-2 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Navigation Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id || (item.id === 'hotspots' && currentTab === 'community');
            return (
              <button
                type="button"
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{getTranslation(language, item.labelKey)}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status & Demo Label */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium text-slate-300">AI Engine Online</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">v2.6-hackathon</span>
        </div>

        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300/90 text-[11px] leading-snug">
          <span className="font-semibold block text-amber-300 mb-0.5">Demo Simulation Mode</span>
          Realistic village cluster data loaded for Vikaspur, Rampur, Shivpur & Devgarh.
        </div>
      </div>
    </aside>
  );
};
