import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  RotateCcw,
  Star,
  Camera,
  MessageSquare,
  Shield,
  ThumbsUp,
  ThumbsDown,
  UserCheck
} from 'lucide-react';
import { Grievance, LanguageCode, ActivityLogItem } from '../types';
import { getTranslation } from '../utils/translations';
import { fetchGrievanceById, submitCitizenFeedback } from '../services/api';

interface GrievanceTrackerProps {
  initialGrievanceId?: string;
  language: LanguageCode;
  onNavigate: (tab: string) => void;
}

export const GrievanceTracker: React.FC<GrievanceTrackerProps> = ({
  initialGrievanceId = 'RR-2026-000124',
  language,
  onNavigate
}) => {
  const [searchId, setSearchId] = useState(initialGrievanceId);
  const [grievance, setGrievance] = useState<Grievance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Feedback form state
  const [feedbackAnswer, setFeedbackAnswer] = useState<'yes' | 'no' | null>(null);
  const [rating, setRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState('');

  const loadGrievance = async (idToFetch: string) => {
    if (!idToFetch.trim()) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await fetchGrievanceById(idToFetch.trim());
      if (data) {
        setGrievance(data);
      } else {
        setErrorMsg(`No grievance found with ID "${idToFetch}". Try "RR-2026-000124" or "RR-2026-000125".`);
      }
    } catch (err) {
      setErrorMsg('Error fetching grievance details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialGrievanceId) {
      setSearchId(initialGrievanceId);
      loadGrievance(initialGrievanceId);
    }
  }, [initialGrievanceId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadGrievance(searchId);
  };

  const handleFeedbackSubmit = async () => {
    if (!grievance || feedbackAnswer === null) return;
    setIsSubmittingFeedback(true);
    try {
      const updated = await submitCitizenFeedback(grievance.id, {
        isResolved: feedbackAnswer === 'yes',
        rating,
        comment: feedbackComments
      });
      setGrievance(updated);
      setFeedbackSuccessMsg(
        feedbackAnswer === 'yes'
          ? 'Thank you! Your resolution verification has been recorded and the grievance is now closed.'
          : 'Grievance re-opened. Responsible department supervisor has been alerted.'
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div id="grievance-tracker-container" className="max-w-4xl mx-auto space-y-6">
      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Search className="w-5 h-5 text-emerald-400" />
          <span>{getTranslation(language, 'trackGrievance')}</span>
        </h2>

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            id="tracker-search-input"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder={getTranslation(language, 'enterGrievanceId')}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 font-mono"
          />
          <button
            type="submit"
            id="tracker-search-btn"
            disabled={isLoading}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
          >
            {isLoading ? 'Searching...' : getTranslation(language, 'trackNow')}
          </button>
        </form>

        {/* Quick Demo ID chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
          <span>Sample Track IDs:</span>
          {['RR-2026-000124', 'RR-2026-000125', 'RR-2026-000126', 'RR-2026-000127'].map((demoId) => (
            <button
              key={demoId}
              type="button"
              onClick={() => {
                setSearchId(demoId);
                loadGrievance(demoId);
              }}
              className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono text-[11px] border border-slate-700 cursor-pointer"
            >
              {demoId}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {grievance && (
        <div className="space-y-6">
          {/* Main Grievance Summary Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    {grievance.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      grievance.priority === 'Critical'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : grievance.priority === 'High'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {grievance.priority} Priority
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-2 leading-snug">
                  {grievance.title}
                </h3>
              </div>

              {/* Status Badge */}
              <div className="text-left sm:text-right">
                <span className="text-[11px] text-slate-400 block uppercase tracking-wider">
                  Current Status
                </span>
                <span
                  className={`inline-block px-3 py-1 text-xs font-bold rounded-full mt-1 ${
                    grievance.status === 'Resolved' || grievance.status === 'Closed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : grievance.status === 'In Progress'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : grievance.status === 'Reopened'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {grievance.status}
                </span>
              </div>
            </div>

            {/* Key Metadata Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">Responsible Department</span>
                <span className="font-bold text-white text-xs mt-0.5 block">
                  {grievance.assignedDepartment}
                </span>
                {grievance.assignedOfficer && (
                  <span className="text-[11px] text-blue-300 mt-1 block truncate">
                    Officer: {grievance.assignedOfficer}
                  </span>
                )}
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">Location & Village</span>
                <span className="font-bold text-white text-xs mt-0.5 block flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{grievance.village}, {grievance.district}</span>
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block truncate">
                  {grievance.locationDetails}
                </span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">Timeline Target</span>
                <span className="font-bold text-white text-xs mt-0.5 block flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>SLA Target: {grievance.expectedResolutionDate}</span>
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Submitted: {grievance.submittedAt}
                </span>
              </div>
            </div>

            {/* Description & Submitted Evidence Photo */}
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <strong className="text-white block mb-1">Citizen Complaint Description:</strong>
                {grievance.description}
              </div>

              {grievance.photoUrl && (
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1">
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Citizen Incident Evidence Photo:</span>
                  </span>
                  <div className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 relative">
                    <img
                      src={grievance.photoUrl}
                      alt="Incident Evidence"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Officer Remarks & Resolution Evidence */}
            {grievance.officerRemarks && (
              <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-blue-300">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <span>Department Field Officer Remarks</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {grievance.officerRemarks}
                </p>
                {grievance.resolutionEvidenceUrl && (
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-emerald-300 block mb-1">
                      Resolution Completion Photo Proof:
                    </span>
                    <div className="w-full h-48 rounded-xl overflow-hidden border border-emerald-500/30 bg-slate-800">
                      <img
                        src={grievance.resolutionEvidenceUrl}
                        alt="Resolution Proof"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Activity Log / Visual Timeline */}
            <div className="space-y-4 pt-2">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>{getTranslation(language, 'timeline')}</span>
              </h4>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {grievance.activityLog.map((act, index) => (
                  <div key={act.id || index} className="relative space-y-1">
                    <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 ring-2 ring-emerald-500/30"></div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{act.title}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{act.timeDisplay || act.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{act.description}</p>
                    <div className="text-[10px] text-slate-500">
                      Actor: <span className="text-slate-400">{act.actor}</span> ({act.actorRole})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Citizen Verification & Feedback Module */}
          <div
            id="citizen-verification-box"
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl"
          >
            <div className="flex items-center space-x-2 text-sm font-bold text-white">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <span>{getTranslation(language, 'citizenFeedbackTitle')}</span>
            </div>

            <p className="text-xs text-slate-300">
              {getTranslation(language, 'feedbackPrompt')}
            </p>

            {grievance.citizenFeedback ? (
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white">Submitted Citizen Response:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      grievance.citizenFeedback.isResolved
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {grievance.citizenFeedback.isResolved ? '👍 Problem Resolved' : '👎 Not Resolved (Reopened)'}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-amber-400">
                  <span>Rating:</span>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < grievance.citizenFeedback!.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>
                {grievance.citizenFeedback.comment && (
                  <p className="text-slate-300 italic">"{grievance.citizenFeedback.comment}"</p>
                )}
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {/* Yes / No Options */}
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    id="feedback-yes-btn"
                    onClick={() => setFeedbackAnswer('yes')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
                      feedbackAnswer === 'yes'
                        ? 'bg-emerald-600 text-slate-950 shadow-md ring-2 ring-emerald-400'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{getTranslation(language, 'yesResolved')}</span>
                  </button>

                  <button
                    type="button"
                    id="feedback-no-btn"
                    onClick={() => setFeedbackAnswer('no')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
                      feedbackAnswer === 'no'
                        ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>{getTranslation(language, 'noNotResolved')}</span>
                  </button>
                </div>

                {/* Rating Stars */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    {getTranslation(language, 'ratingPrompt')}
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-400 ml-2">{rating} of 5 Stars</span>
                  </div>
                </div>

                {/* Comments */}
                <div className="space-y-1.5">
                  <textarea
                    rows={2}
                    value={feedbackComments}
                    onChange={(e) => setFeedbackComments(e.target.value)}
                    placeholder="Optional remarks on work quality or what is still pending..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Submit Feedback Button */}
                <button
                  type="button"
                  id="submit-feedback-btn"
                  disabled={feedbackAnswer === null || isSubmittingFeedback}
                  onClick={handleFeedbackSubmit}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                    feedbackAnswer === 'no'
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
                  } disabled:opacity-50`}
                >
                  {isSubmittingFeedback ? (
                    <span>Submitting Verification...</span>
                  ) : feedbackAnswer === 'no' ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{getTranslation(language, 'reopenButton')}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{getTranslation(language, 'submitFeedback')}</span>
                    </>
                  )}
                </button>

                {feedbackSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                    {feedbackSuccessMsg}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
