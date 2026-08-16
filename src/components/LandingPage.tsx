import React from 'react';
import {
  Shield,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  TrendingUp,
  Flame,
  Layers,
  Repeat,
  Compass,
  Zap,
  Droplet,
  Truck,
  HeartPulse,
  Award
} from 'lucide-react';
import { LanguageCode, UserRole } from '../types';
import { getTranslation } from '../utils/translations';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
  onRoleChange: (role: UserRole) => void;
  onOpenDemoTour: () => void;
  language: LanguageCode;
  onTrackPrefill: (id: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onRoleChange,
  onOpenDemoTour,
  language,
  onTrackPrefill
}) => {
  const [quickTrackId, setQuickTrackId] = React.useState('RR-2026-000124');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrackId.trim()) {
      onTrackPrefill(quickTrackId.trim());
      onNavigate('track');
    }
  };

  return (
    <div id="landing-page-container" className="space-y-10 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI-Powered Smart Citizen Grievance & Development Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Every Complaint. Better Decisions.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Stronger Communities.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            RuralReadiness converts individual citizen complaints into aggregated developmental intelligence — helping rural citizens get fast transparent resolution, while giving administrators the data to fix systemic infrastructure gaps.
          </p>

          {/* Quick CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              id="hero-report-btn"
              onClick={() => {
                onRoleChange('citizen');
                onNavigate('report');
              }}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-900/30 transition-all hover:scale-102 flex items-center space-x-2 cursor-pointer"
            >
              <span>{getTranslation(language, 'reportAProblem')}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <button
              id="hero-demo-tour-btn"
              onClick={onOpenDemoTour}
              className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-900/20 transition-all hover:scale-102 flex items-center space-x-2 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>3-Min Judge Demo Tour</span>
            </button>

            <button
              id="hero-intelligence-btn"
              onClick={() => {
                onRoleChange('admin');
                onNavigate('intelligence');
              }}
              className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm border border-slate-700 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Development Intelligence</span>
            </button>
          </div>

          {/* Quick Track Input Bar */}
          <form
            onSubmit={handleTrackSubmit}
            className="pt-4 max-w-lg mx-auto flex items-center bg-slate-800/90 border border-slate-700 rounded-2xl p-1.5 shadow-xl"
          >
            <div className="pl-3 pr-2 text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="quick-track-input"
              value={quickTrackId}
              onChange={(e) => setQuickTrackId(e.target.value)}
              placeholder="Track Grievance ID (e.g., RR-2026-000124)"
              className="flex-1 bg-transparent border-none text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              id="quick-track-submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Track Now
            </button>
          </form>
        </div>
      </section>

      {/* Core Intelligence Loop (5 Steps) */}
      <section className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            How RuralReadiness Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            From single citizen complaint to village-wide systemic development planning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            {
              step: '01',
              title: 'Citizen Report',
              desc: 'Citizen submits photo & details in local language (Hindi, Telugu, English).',
              icon: Shield,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10'
            },
            {
              step: '02',
              title: 'AI Understanding',
              desc: 'Gemini AI classifies category, detects priority (Critical/High) & assigns department.',
              icon: Sparkles,
              color: 'text-teal-400',
              bg: 'bg-teal-500/10'
            },
            {
              step: '03',
              title: 'Officer Action',
              desc: 'Department officer accepts, coordinates field repair & uploads photo proof.',
              icon: Truck,
              color: 'text-blue-400',
              bg: 'bg-blue-500/10'
            },
            {
              step: '04',
              title: 'Citizen Verify',
              desc: 'Citizen confirms real resolution on ground or reopens grievance with rating.',
              icon: CheckCircle2,
              color: 'text-amber-400',
              bg: 'bg-amber-500/10'
            },
            {
              step: '05',
              title: 'Development Insights',
              desc: 'Complaints convert into Hotspots, Recurring Issues & Investment Simulator.',
              icon: TrendingUp,
              color: 'text-purple-400',
              bg: 'bg-purple-500/10'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative group hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                    Step {item.step}
                  </span>
                  <div className={`p-2 rounded-xl ${item.bg} ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Key Stats Bar */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">279 / 330</div>
            <div className="text-xs text-slate-400">Grievances Resolved (84.5%)</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">2.3 Days</div>
            <div className="text-xs text-slate-400">Avg. Resolution Speed</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">4.4 / 5.0</div>
            <div className="text-xs text-slate-400">Citizen Satisfaction Score</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">72 / 100</div>
            <div className="text-xs text-slate-400">Regional Development Health</div>
          </div>
        </div>
      </section>

      {/* Role Jump Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          id="card-jump-citizen"
          onClick={() => {
            onRoleChange('citizen');
            onNavigate('report');
          }}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 space-y-3 cursor-pointer transition-all hover:scale-101"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Citizen Experience</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Report drinking water, road, electricity or health issues. Track progress with live timeline updates and rate resolution.
          </p>
          <div className="text-xs font-semibold text-emerald-400 flex items-center space-x-1 pt-1">
            <span>Submit a Complaint</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          id="card-jump-officer"
          onClick={() => {
            onRoleChange('officer');
            onNavigate('officer-dashboard');
          }}
          className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 space-y-3 cursor-pointer transition-all hover:scale-101"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Department Officer Portal</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Manage assigned department grievances, dispatch field repair crews, track strict SLA deadlines, and submit photo verification.
          </p>
          <div className="text-xs font-semibold text-blue-400 flex items-center space-x-1 pt-1">
            <span>Open Officer Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          id="card-jump-admin"
          onClick={() => {
            onRoleChange('admin');
            onNavigate('intelligence');
          }}
          className="bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-5 space-y-3 cursor-pointer transition-all hover:scale-101"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Admin Development Intelligence</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Spot problem hotspots (+42% surges), identify recurring infrastructure bottlenecks, and simulate multi-crore budget impact.
          </p>
          <div className="text-xs font-semibold text-purple-400 flex items-center space-x-1 pt-1">
            <span>View Intelligence Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </section>
    </div>
  );
};
