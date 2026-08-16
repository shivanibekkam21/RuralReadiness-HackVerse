import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Shield,
  Search,
  Layers,
  Flame,
  Repeat,
  Sliders,
  TrendingUp,
  X,
  Play
} from 'lucide-react';
import { UserRole, LanguageCode } from '../types';

interface DemoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onRoleChange: (role: UserRole) => void;
  onTrackPrefill: (id: string) => void;
  onSelectVillageForSim?: (villageId: string) => void;
}

interface TourStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  role: UserRole;
  targetTab: string;
  narration: string;
  highlightText: string;
  actionButtonLabel: string;
  actionPayload?: () => void;
}

export const DemoWalkthroughModal: React.FC<DemoWalkthroughModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onRoleChange,
  onTrackPrefill,
  onSelectVillageForSim
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  if (!isOpen) return null;

  const TOUR_STEPS: TourStep[] = [
    {
      stepNumber: 1,
      title: 'Product Vision & Core Loop',
      subtitle: 'From Complaint to Rural Development Intelligence',
      role: 'citizen',
      targetTab: 'home',
      narration:
        'RuralReadiness is an AI-powered smart grievance & rural intelligence platform. Notice how it connects individual complaints directly to systemic infrastructure planning.',
      highlightText: 'Value Loop: Citizen Complaint → AI Understanding → Smart Assignment → Resolution Tracking → Rural Intelligence',
      actionButtonLabel: 'Step 2: Citizen Submits Issue →'
    },
    {
      stepNumber: 2,
      title: 'Citizen Grievance Submission with Live AI',
      subtitle: 'Multilingual reporting with automatic classification',
      role: 'citizen',
      targetTab: 'report',
      narration:
        'A citizen in Vikaspur reports dangerous potholes near the High School. As the citizen types, the Gemini AI engine auto-detects the category (Roads & Transport), sets High priority, and identifies the exact department.',
      highlightText: 'AI analyzes urgency, population impact (school students), and auto-routes without manual bureaucracy.',
      actionButtonLabel: 'Step 3: Track Resolution Timeline →'
    },
    {
      stepNumber: 3,
      title: 'Citizen Real-time Tracking & Verification',
      subtitle: 'Transparent SLA timeline & resolution feedback',
      role: 'citizen',
      targetTab: 'track',
      narration:
        'Citizens track their grievance using ID RR-2026-000124 with live step-by-step progress, officer remarks, photo evidence, and a closed-loop citizen verification module.',
      highlightText: 'Citizens confirm if the issue is actually resolved on ground, preventing false government closure.',
      actionPayload: () => onTrackPrefill('RR-2026-000124'),
      actionButtonLabel: 'Step 4: Switch to Officer Portal →'
    },
    {
      stepNumber: 4,
      title: 'Department Officer Workflow',
      subtitle: 'Roads & Infrastructure Department Triage',
      role: 'officer',
      targetTab: 'officer-dashboard',
      narration:
        'The Department Officer receives the AI-routed complaint, inspects AI diagnostic reasons, dispatches maintenance crews, and uploads photographic proof of repair.',
      highlightText: 'SLA countdown timers enforce prompt resolution within mandated government timelines.',
      actionButtonLabel: 'Step 5: Rural Intelligence Dashboard →'
    },
    {
      stepNumber: 5,
      title: 'RuralReadiness Development Dashboard',
      subtitle: 'Aggregated regional health index across 6 sectors',
      role: 'admin',
      targetTab: 'intelligence',
      narration:
        'Here is the big picture! Every complaint aggregates into the Regional Development Health Index (72/100) and scores 6 core sectors: Roads, Water, Power, Health, Education, and Broadband.',
      highlightText: 'Administrators see village leaderboards and immediate surge alert banners.',
      actionButtonLabel: 'Step 6: Problem Hotspot Detection →'
    },
    {
      stepNumber: 6,
      title: 'Problem Hotspot Detection',
      subtitle: 'Spatial surge clustering (+42% spike in Vikaspur)',
      role: 'admin',
      targetTab: 'hotspots',
      narration:
        'AI detects spatial clusters of complaints. Vikaspur has a +42% surge in road issues, and Rampur has a +65% surge in drinking water issues. Root causes are surfaced automatically.',
      highlightText: 'Converts isolated complaints into targeted zone-level development priorities.',
      actionButtonLabel: 'Step 7: Recurring Issue Clusters →'
    },
    {
      stepNumber: 7,
      title: 'Recurring Issue Pattern Recognition',
      subtitle: 'Stop wasting funds on repeated temporary fixes',
      role: 'admin',
      targetTab: 'recurring',
      narration:
        'AI flags 37 repeated complaints on the Vikaspur School Road. Regular patch repairs kept washing away due to lack of storm drainage. AI recommends a permanent ₹50 Lakh capital reconstruction.',
      highlightText: 'Transforms chronic maintenance drains into long-term infrastructure assets.',
      actionButtonLabel: 'Step 8: "Where Should We Act First?" →'
    },
    {
      stepNumber: 8,
      title: 'Development Priority Engine',
      subtitle: 'Algorithmic ranking for government budget allocation',
      role: 'admin',
      targetTab: 'priority-engine',
      narration:
        'The Priority Engine algorithmically ranks Vikaspur as Rank #1 based on grievance density, student safety risks, and recurring failures. Clear transparent reasoning is provided.',
      highlightText: 'Removes political bias and ensures public funds flow to the highest-need villages first.',
      actionButtonLabel: 'Step 9: Policy & Budget Simulator →'
    },
    {
      stepNumber: 9,
      title: 'Development Intervention Simulator',
      subtitle: 'Test ₹50 Lakh investment impact before spending',
      role: 'admin',
      targetTab: 'simulator',
      narration:
        'Administrators adjust budget sliders and simulate interventions. A ₹50 Lakh road reconstruction in Vikaspur is projected to reduce grievances by 85% and boost the village health score from 58 to 76.',
      highlightText: 'Predicts socio-economic co-benefits: +14% school attendance and +22% local commerce!',
      actionPayload: () => {
        if (onSelectVillageForSim) onSelectVillageForSim('vil-vikaspur');
      },
      actionButtonLabel: 'Finish Tour & Explore Freely 🎉'
    }
  ];

  const currentStep = TOUR_STEPS[currentStepIdx];

  const handleExecuteStep = (step: TourStep) => {
    onRoleChange(step.role);
    onNavigate(step.targetTab);
    if (step.actionPayload) {
      step.actionPayload();
    }
  };

  const handleNext = () => {
    if (currentStepIdx < TOUR_STEPS.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      handleExecuteStep(TOUR_STEPS[nextIdx]);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      handleExecuteStep(TOUR_STEPS[prevIdx]);
    }
  };

  return (
    <div
      id="demo-tour-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
    >
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Hackathon Demo Guide • Step {currentStep.stepNumber} of {TOUR_STEPS.length}
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                {currentStep.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${((currentStepIdx + 1) / TOUR_STEPS.length) * 100}%` }}
          ></div>
        </div>

        {/* Content Box */}
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">
              Demonstration Storyline:
            </span>
            <p className="text-slate-200 leading-relaxed font-medium">
              {currentStep.narration}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{currentStep.highlightText}</span>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStepIdx === 0}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-30 cursor-pointer flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                handleExecuteStep(currentStep);
                onClose();
              }}
              className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Exit Tour
            </button>

            <button
              type="button"
              id="tour-next-step-btn"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer flex items-center space-x-1.5 transition-transform hover:scale-102"
            >
              <span>{currentStep.actionButtonLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
