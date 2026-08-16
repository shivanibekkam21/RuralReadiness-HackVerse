import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  MapPin,
  Send,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Upload,
  Layers,
  Clock,
  User,
  Phone,
  RefreshCw,
  Eye
} from 'lucide-react';
import { GrievanceCategory, LanguageCode, AIAnalysis, Grievance } from '../types';
import { getTranslation } from '../utils/translations';
import { analyzeGrievanceWithAI, submitGrievance } from '../services/api';

interface CitizenGrievanceFormProps {
  language: LanguageCode;
  onGrievanceCreated: (grievance: Grievance) => void;
  onNavigate: (tab: string) => void;
}

const SAMPLE_SCENARIOS = [
  {
    label: '🛣️ School Road Potholes (Demo Step 2)',
    title: 'Main road near our village school has dangerous potholes and students are struggling to travel safely.',
    desc: 'The main connecting road between Sector 4 and Government High School in Vikaspur has developed 3-4 feet deep continuous potholes after recent monsoons. Two school bicycle accidents occurred this week. School buses and emergency ambulances are refusing to use this road.',
    village: 'Vikaspur',
    category: 'Roads & Transport',
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: '🚰 Drinking Water Failure (Critical)',
    title: 'Our village has had no drinking water for four days and elderly people are struggling to get water.',
    desc: 'The main 15 HP submersible pump at Rampur central community water overhead tank burnt out 4 days ago. Over 350 households in Ward 2 and Ward 3 have zero piped water supply. Elderly citizens and infants have no clean drinking water access.',
    village: 'Rampur',
    category: 'Water Supply',
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: '⚡ Live High-Tension Wire Hazard',
    title: 'High tension 11kV wire sparking and hanging dangerously low across agricultural corridor.',
    desc: 'During yesterday thunderstorm an electric pole tilted and high tension 11kV conductor is hanging only 5 feet above the ground near Shivpur farming corridor. Cattle and farmers walking through the path are at severe risk of electrocution.',
    village: 'Shivpur',
    category: 'Electricity',
    photoUrl: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=800&auto=format&fit=crop&q=80'
  }
];

const CATEGORIES: GrievanceCategory[] = [
  'Roads & Transport',
  'Water Supply',
  'Electricity',
  'Sanitation & Waste',
  'Healthcare',
  'Education',
  'Agriculture',
  'Internet & Connectivity',
  'Public Safety',
  'Government Services',
  'Environment',
  'Other'
];

export const CitizenGrievanceForm: React.FC<CitizenGrievanceFormProps> = ({
  language,
  onGrievanceCreated,
  onNavigate
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('auto');
  const [village, setVillage] = useState('Vikaspur');
  const [district, setDistrict] = useState('North District');
  const [locationDetails, setLocationDetails] = useState('');
  const [reporterName, setReporterName] = useState('Ankit Sharma');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');
  const [prefLang, setPrefLang] = useState<LanguageCode>(language);
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiPreview, setAiPreview] = useState<AIAnalysis | null>(null);
  const [submittedGrievance, setSubmittedGrievance] = useState<Grievance | null>(null);

  // Load sample scenario
  const handleLoadSample = (sample: typeof SAMPLE_SCENARIOS[0]) => {
    setTitle(sample.title);
    setDescription(sample.desc);
    setVillage(sample.village);
    setPhotoUrl(sample.photoUrl);
    setCategory('auto');
    triggerAIAnalysis(sample.title, sample.desc, sample.village);
  };

  // Trigger Live AI Analysis
  const triggerAIAnalysis = async (t: string, d: string, v: string) => {
    if (!t && !d) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeGrievanceWithAI({
        title: t,
        description: d,
        village: v
      });
      setAiPreview(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Debounced AI Preview when user stops typing
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDescription(val);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please describe your grievance problem.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Run AI analysis if not already done
      let analysis = aiPreview;
      if (!analysis) {
        analysis = await analyzeGrievanceWithAI({
          title,
          description,
          village
        });
      }

      // 2. Submit to backend API
      const newGrievance = await submitGrievance({
        title: title || `${analysis.category} issue in ${village}`,
        description,
        category: category === 'auto' ? analysis.category : (category as GrievanceCategory),
        village,
        district,
        locationDetails: locationDetails || `${village} Area`,
        photoUrl,
        reporterName,
        contactPhone,
        preferredLanguage: prefLang,
        priority: analysis.priority,
        severity: analysis.severity,
        assignedDepartment: analysis.responsibleDepartment,
        aiAnalysis: analysis
      });

      setSubmittedGrievance(newGrievance);
      onGrievanceCreated(newGrievance);
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedGrievance) {
    return (
      <div id="grievance-confirmation-card" className="max-w-3xl mx-auto space-y-6">
        <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-5">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Grievance Successfully Registered & Dispatched
                </span>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  Grievance ID: <span className="text-emerald-400 font-mono">{submittedGrievance.id}</span>
                </h2>
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <span className="text-xs text-slate-400 block">Current Status</span>
              <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Assigned to Department
              </span>
            </div>
          </div>

          {/* AI Intelligence Breakdown Card */}
          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm font-bold text-white">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>AI Automated Triage & Smart Assignment</span>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {submittedGrievance.aiAnalysis.confidenceScore}% Confidence
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Classified Category</span>
                <span className="font-bold text-white text-sm mt-0.5 block">
                  {submittedGrievance.category}
                </span>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Calculated Priority</span>
                <span
                  className={`inline-block px-2 py-0.5 rounded-md font-bold text-xs mt-1 ${
                    submittedGrievance.priority === 'Critical'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : submittedGrievance.priority === 'High'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {submittedGrievance.priority === 'Critical' ? '🔴 Critical' : submittedGrievance.priority === 'High' ? '🟠 High' : '🟡 Medium'}
                </span>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Assigned Department</span>
                <span className="font-bold text-blue-300 text-xs mt-0.5 block">
                  {submittedGrievance.assignedDepartment}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs">
              <div className="text-slate-400">
                <strong className="text-slate-200">AI Priority Reason:</strong> {submittedGrievance.aiAnalysis.reason}
              </div>
              <div className="text-slate-400">
                <strong className="text-slate-200">Suggested Field Action:</strong> {submittedGrievance.aiAnalysis.suggestedAction}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Target SLA Resolution Date: <strong className="text-white">{submittedGrievance.expectedResolutionDate}</strong></span>
              </div>
              <div>Village: <strong className="text-white">{submittedGrievance.village}</strong></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              id="confirm-track-btn"
              onClick={() => onNavigate('track')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center space-x-2 cursor-pointer shadow-md"
            >
              <span>Track Resolution Timeline</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="confirm-officer-view-btn"
              onClick={() => onNavigate('officer-dashboard')}
              className="px-5 py-2.5 rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white font-semibold text-xs flex items-center space-x-2 cursor-pointer"
            >
              <span>Switch to Officer Dashboard (Review Newly Assigned)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="confirm-submit-another"
              onClick={() => {
                setSubmittedGrievance(null);
                setTitle('');
                setDescription('');
                setAiPreview(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 cursor-pointer"
            >
              Submit Another Grievance
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="citizen-grievance-form-container" className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>{getTranslation(language, 'submitTitle')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {getTranslation(language, 'submitTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
          {getTranslation(language, 'submitSubtitle')}
        </p>

        {/* Quick Demo Pre-fills */}
        <div className="pt-3 border-t border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            🚀 1-Click Demo Scenarios (Pre-fill Form):
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_SCENARIOS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                id={`sample-scenario-btn-${idx}`}
                onClick={() => handleLoadSample(sample)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all hover:scale-102 cursor-pointer flex items-center space-x-1.5"
              >
                <span>{sample.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Grievance Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>{getTranslation(language, 'formGrievanceTitle')}</span>
              <span className="text-slate-500 font-normal lowercase text-[11px]">one-line summary</span>
            </label>
            <input
              type="text"
              id="input-grievance-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={getTranslation(language, 'formGrievanceTitlePlaceholder')}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Detailed Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {getTranslation(language, 'formDescription')} <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                id="btn-trigger-ai-preview"
                onClick={() => triggerAIAnalysis(title, description, village)}
                disabled={isAnalyzing || !description.trim()}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAnalyzing ? 'Analyzing with AI...' : 'Analyze with AI'}</span>
              </button>
            </div>
            <textarea
              id="input-grievance-description"
              rows={4}
              required
              value={description}
              onChange={handleDescriptionChange}
              onBlur={() => triggerAIAnalysis(title, description, village)}
              placeholder={getTranslation(language, 'formDescriptionPlaceholder')}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 leading-relaxed"
            />
          </div>

          {/* Live AI Analysis Pill if available */}
          {aiPreview && (
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-300 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>AI Real-time Classification & Priority Assessment</span>
                </span>
                <span className="font-mono text-emerald-400 text-[11px]">
                  {aiPreview.confidenceScore}% Confidence
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Category:</span>
                  <span className="font-bold text-white">{aiPreview.category}</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Priority:</span>
                  <span className="font-bold text-amber-300">{aiPreview.priority}</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Suggested Dept:</span>
                  <span className="font-bold text-blue-300 truncate block">{aiPreview.responsibleDepartment}</span>
                </div>
              </div>
            </div>
          )}

          {/* Category & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {getTranslation(language, 'formCategory')}
              </label>
              <select
                id="select-grievance-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="auto">✨ Let AI Auto-Classify (Recommended)</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Village / Town Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {getTranslation(language, 'formVillage')}
              </label>
              <select
                id="select-grievance-village"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="Vikaspur">Vikaspur (North District)</option>
                <option value="Rampur">Rampur (East District)</option>
                <option value="Shivpur">Shivpur (North District)</option>
                <option value="Devgarh">Devgarh (Central District)</option>
                <option value="Sundarpur">Sundarpur (East District)</option>
                <option value="Krishnapur">Krishnapur (Central District)</option>
              </select>
            </div>
          </div>

          {/* Specific Location Landmark */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{getTranslation(language, 'formLocationDetails')}</span>
            </label>
            <input
              type="text"
              id="input-location-details"
              value={locationDetails}
              onChange={(e) => setLocationDetails(e.target.value)}
              placeholder={getTranslation(language, 'formLocationDetailsPlaceholder')}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Photo Evidence Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>{getTranslation(language, 'formUploadPhoto')}</span>
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                id="input-photo-url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="Paste Image URL or use sample gallery photo"
                className="w-full sm:flex-1 px-4 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
              />
              {photoUrl && (
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-700 shrink-0 bg-slate-800">
                  <img
                    src={photoUrl}
                    alt="Evidence Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Reporter Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{getTranslation(language, 'formReporterName')}</span>
              </label>
              <input
                type="text"
                id="input-reporter-name"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 flex items-center space-x-1">
                <Phone className="w-3 h-3" />
                <span>{getTranslation(language, 'formContactPhone')}</span>
              </label>
              <input
                type="text"
                id="input-contact-phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">
                {getTranslation(language, 'formPrefLanguage')}
              </label>
              <select
                id="select-pref-lang"
                value={prefLang}
                onChange={(e) => setPrefLang(e.target.value as LanguageCode)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="te">తెలుగు (Telugu)</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="btn-submit-grievance"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-950/40 transition-all hover:scale-101 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>{getTranslation(language, 'formAnalyzing')}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-slate-950" />
                <span>{getTranslation(language, 'formSubmitButton')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
