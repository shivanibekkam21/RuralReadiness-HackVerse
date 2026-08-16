import React from 'react';
import {
  Shield,
  Activity,
  Layers,
  Sparkles,
  Globe,
  Bell,
  CheckCircle2,
  AlertTriangle,
  User,
  Compass,
  Home,
  PlusCircle,
  Search,
  FileText,
  Flame
} from 'lucide-react';
import { UserRole, LanguageCode } from '../types';
import { getTranslation } from '../utils/translations';

interface HeaderProps {
  currentTab: string;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onOpenDemoTour: () => void;
  onNavigate: (tab: string) => void;
  pendingCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  userRole,
  onRoleChange,
  language,
  onLanguageChange,
  onOpenDemoTour,
  onNavigate,
  pendingCount = 14
}) => {
  const mainNavItems = [
    { id: 'home', labelKey: 'appName', icon: Home },
    { id: 'report', labelKey: 'reportAProblem', icon: PlusCircle },
    { id: 'track', labelKey: 'trackGrievance', icon: Search },
    { id: 'my-grievances', labelKey: 'myGrievances', icon: FileText },
    { id: 'hotspots', labelKey: 'hotspots', icon: Flame }
  ];

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <button
            type="button"
            id="brand-logo-btn"
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-3 cursor-pointer group bg-transparent border-0 text-left p-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-emerald-300">
                  {getTranslation(language, 'appName')}
                </span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AI Platform
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {getTranslation(language, 'tagline')}
              </p>
            </div>
          </button>

          {/* Quick Header Nav for direct accessibility */}
          <nav className="hidden xl:flex items-center space-x-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id || (item.id === 'hotspots' && currentTab === 'community');
              return (
                <button
                  key={item.id}
                  id={`header-nav-${item.id}`}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{getTranslation(language, item.labelKey)}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Actions & Switchers */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* 1-Click Guided Demo Tour Button */}
            <button
              id="header-guided-tour-btn"
              onClick={onOpenDemoTour}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-semibold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-102 cursor-pointer"
              title="Start 3-Minute Hackathon Demo Journey"
            >
              <Compass className="w-4 h-4" />
              <span className="hidden md:inline">{getTranslation(language, 'guidedDemo')}</span>
              <span className="md:hidden">Demo Tour</span>
            </button>

            {/* Multilingual Selector */}
            <div className="flex items-center space-x-0.5 bg-slate-800/80 border border-slate-700/80 rounded-lg p-0.5 sm:p-1">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1 hidden sm:inline" />
              {(['en', 'hi', 'te'] as LanguageCode[]).map((lang) => (
                <button
                  key={lang}
                  id={`lang-btn-${lang}`}
                  onClick={() => onLanguageChange(lang)}
                  className={`px-1.5 sm:px-2 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                    language === lang
                      ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिन्दी' : 'తెలుగు'}
                </button>
              ))}
            </div>

            {/* Role Switcher */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-lg p-0.5 sm:p-1">
              <button
                id="role-btn-citizen"
                onClick={() => {
                  onRoleChange('citizen');
                  onNavigate('report');
                }}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-all flex items-center space-x-1 cursor-pointer ${
                  userRole === 'citizen'
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3 h-3" />
                <span className="hidden sm:inline">Citizen</span>
              </button>

              <button
                id="role-btn-officer"
                onClick={() => {
                  onRoleChange('officer');
                  onNavigate('officer-dashboard');
                }}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-all flex items-center space-x-1 cursor-pointer ${
                  userRole === 'officer'
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-3 h-3" />
                <span className="hidden sm:inline">Officer</span>
                <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-blue-400/20 text-blue-300 rounded-full">
                  {pendingCount}
                </span>
              </button>

              <button
                id="role-btn-admin"
                onClick={() => {
                  onRoleChange('admin');
                  onNavigate('intelligence');
                }}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-all flex items-center space-x-1 cursor-pointer ${
                  userRole === 'admin'
                    ? 'bg-purple-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3 h-3" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
