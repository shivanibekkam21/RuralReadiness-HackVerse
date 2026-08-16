import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Banknote,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Award,
  Layers,
  ArrowRight,
  Info,
  Calendar,
  Building
} from 'lucide-react';
import { DevelopmentSimulatorOption, LanguageCode, VillageDevelopmentHealth } from '../types';
import { getTranslation } from '../utils/translations';
import {
  fetchSimulatorOptions,
  fetchVillages,
  runDevelopmentSimulation
} from '../services/api';

interface DevelopmentSimulatorProps {
  language: LanguageCode;
  selectedVillageId?: string;
  onNavigate: (tab: string) => void;
}

export const DevelopmentSimulator: React.FC<DevelopmentSimulatorProps> = ({
  language,
  selectedVillageId,
  onNavigate
}) => {
  const [options, setOptions] = useState<DevelopmentSimulatorOption[]>([]);
  const [villages, setVillages] = useState<VillageDevelopmentHealth[]>([]);
  const [activeOptionId, setActiveOptionId] = useState<string>('sim-opt-1');
  const [targetVillageId, setTargetVillageId] = useState<string>(selectedVillageId || 'vil-vikaspur');
  const [budgetLakh, setBudgetLakh] = useState<number>(50);
  const [timeframe, setTimeframe] = useState<number>(4);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [opts, vils] = await Promise.all([fetchSimulatorOptions(), fetchVillages()]);
        setOptions(opts);
        setVillages(vils);
        if (selectedVillageId) {
          setTargetVillageId(selectedVillageId);
          const matchedOpt = opts.find((o) => o.villageId === selectedVillageId);
          if (matchedOpt) {
            setActiveOptionId(matchedOpt.id);
            setBudgetLakh(matchedOpt.investmentAmountNumber);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [selectedVillageId]);

  const handleSelectOption = (opt: DevelopmentSimulatorOption) => {
    setActiveOptionId(opt.id);
    setTargetVillageId(opt.villageId);
    setBudgetLakh(opt.investmentAmountNumber);
    setTimeframe(opt.timeframeMonths);
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const result = await runDevelopmentSimulation({
        optionId: activeOptionId,
        villageId: targetVillageId,
        customBudgetLakh: budgetLakh
      });
      setSimulationResult(result);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Run initial simulation on load
  useEffect(() => {
    if (options.length > 0) {
      handleRunSimulation();
    }
  }, [options, targetVillageId, budgetLakh]);

  return (
    <div id="development-simulator-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>Development Intervention Simulator</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Simulate Capital Projects & Policy Impact
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
          Test infrastructure investments before allocating public funds. See projected grievance reductions and regional health score gains.
        </p>

        {/* Demo Mode Notice */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Simulated Model (Demo Mode) • Historical econometric regression logic</span>
        </div>
      </div>

      {/* Preset Interventions Row */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          Preset High-Impact Intervention Scenarios:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {options.map((opt) => {
            const isSelected = activeOptionId === opt.id;
            return (
              <button
                key={opt.id}
                id={`sim-preset-btn-${opt.id}`}
                type="button"
                onClick={() => handleSelectOption(opt)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20 shadow-lg'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-emerald-400">{opt.investmentAmountINR}</span>
                  <span className="text-slate-400">{opt.villageName}</span>
                </div>
                <h4 className="text-sm font-bold text-white leading-snug">{opt.title}</h4>
                <div className="text-[11px] text-purple-300 mt-2 flex items-center space-x-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>-{opt.projectedComplaintsReductionPct}% Grievance Drop</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Controls & Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span>Simulation Parameters</span>
          </h3>

          {/* Target Village Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Target Village:
            </label>
            <select
              id="sim-target-village"
              value={targetVillageId}
              onChange={(e) => setTargetVillageId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {villages.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} (Score: {v.overallScore}/100)
                </option>
              ))}
            </select>
          </div>

          {/* Budget Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Investment Budget:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                ₹{budgetLakh} Lakh (₹{(budgetLakh * 100000).toLocaleString()})
              </span>
            </div>
            <input
              type="range"
              id="sim-budget-slider"
              min={10}
              max={150}
              step={5}
              value={budgetLakh}
              onChange={(e) => setBudgetLakh(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>₹10L</span>
              <span>₹75L</span>
              <span>₹1.5Cr</span>
            </div>
          </div>

          {/* Execution Timeframe */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>Project Execution Timeline:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 6, 12].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTimeframe(m)}
                  className={`py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    timeframe === m
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                  }`}
                >
                  {m} Months
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            id="btn-recalculate-sim"
            disabled={isSimulating}
            onClick={handleRunSimulation}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>Recalculate Impact</span>
          </button>
        </div>

        {/* Projected Impact Output Cards */}
        {simulationResult && (
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                  Simulated Outcomes for {simulationResult.villageName}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {simulationResult.interventionTitle}
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 self-start sm:self-auto font-bold">
                Investment: {simulationResult.investmentINR}
              </span>
            </div>

            {/* Big Impact Comparison Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Health Score Jump */}
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 space-y-2">
                <span className="text-xs font-semibold text-slate-400 block">
                  Development Health Score Impact
                </span>
                <div className="flex items-baseline space-x-3">
                  <span className="text-3xl font-bold text-slate-400">
                    {simulationResult.currentHealthScore}
                  </span>
                  <ArrowRight className="w-5 h-5 text-emerald-400" />
                  <span className="text-4xl font-extrabold text-emerald-400">
                    {simulationResult.projectedHealthScore}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                    +{simulationResult.healthScoreIncrease} Pts
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Composite infrastructure score increases from deficient to robust standard.
                </p>
              </div>

              {/* Grievance Reduction */}
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 space-y-2">
                <span className="text-xs font-semibold text-slate-400 block">
                  Projected Grievance Reduction
                </span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-extrabold text-purple-400">
                    -{simulationResult.projectedGrievancesReductionPct}%
                  </span>
                  <span className="text-xs font-bold text-slate-300">
                    (~{simulationResult.projectedGrievancesResolved} fewer complaints)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Eliminates recurring complaints in the target sector completely.
                </p>
              </div>
            </div>

            {/* Expected Multi-Sector Co-Benefits */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Simulated Socio-Economic Co-Benefits</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {simulationResult.expectedOutcomes?.map((outcome: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300 flex items-start space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
