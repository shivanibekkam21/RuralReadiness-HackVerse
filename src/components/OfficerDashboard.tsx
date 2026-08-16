import React, { useState, useEffect } from 'react';
import {
  Shield,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Camera,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  Search,
  UserCheck,
  Building,
  RotateCcw,
  Sparkles,
  MapPin,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Grievance, LanguageCode, DepartmentName } from '../types';
import { getTranslation } from '../utils/translations';
import { fetchGrievances, updateGrievanceStatus } from '../services/api';

interface OfficerDashboardProps {
  language: LanguageCode;
  onNavigate: (tab: string) => void;
  onTrackPrefill: (id: string) => void;
}

const DEPARTMENTS: DepartmentName[] = [
  'Roads & Infrastructure Department',
  'Rural Water Supply Department',
  'Electricity Department',
  'Sanitation & Municipal Department',
  'Health Department',
  'Education Department',
  'Agriculture & Irrigation Department',
  'Digital Connectivity & Telecom'
];

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({
  language,
  onNavigate,
  onTrackPrefill
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('Roads & Infrastructure Department');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Active selected grievance modal
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [actionRemarks, setActionRemarks] = useState('');
  const [evidencePhotoUrl, setEvidencePhotoUrl] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [reassignDept, setReassignDept] = useState(DEPARTMENTS[1]);
  const [isReassigning, setIsReassigning] = useState(false);

  const loadGrievances = async () => {
    setIsLoading(true);
    try {
      const data = await fetchGrievances({
        department: selectedDept === 'all' ? undefined : selectedDept,
        status: statusFilter === 'all' ? undefined : statusFilter,
        priority: priorityFilter === 'all' ? undefined : priorityFilter,
        search: searchQuery
      });
      setGrievances(data);
    } catch (err) {
      console.error('Failed to load officer grievances:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGrievances();
  }, [selectedDept, statusFilter, priorityFilter]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedGrievance) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await updateGrievanceStatus(selectedGrievance.id, {
        status: newStatus,
        officerRemarks: actionRemarks || `Officer progressed status to ${newStatus}.`,
        resolutionEvidenceUrl: evidencePhotoUrl || selectedGrievance.resolutionEvidenceUrl,
        officerName: 'Executive Engineer R. Verma'
      });
      setSelectedGrievance(updated);
      await loadGrievances();
      setActionRemarks('');
      setEvidencePhotoUrl('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Sample quick resolution photos
  const SAMPLE_RESOLUTION_PHOTOS = [
    'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'
  ];

  // Quick stats
  const totalCount = grievances.length;
  const criticalCount = grievances.filter((g) => g.priority === 'Critical' || g.priority === 'High').length;
  const pendingCount = grievances.filter((g) => g.status === 'Assigned' || g.status === 'Accepted').length;
  const inProgressCount = grievances.filter((g) => g.status === 'In Progress').length;
  const resolvedCount = grievances.filter((g) => g.status === 'Resolved' || g.status === 'Closed').length;

  return (
    <div id="officer-dashboard-container" className="space-y-6">
      {/* Officer Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>{getTranslation(language, 'roleOfficer')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Department Grievance Triage & Resolution Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Field inspection dispatch, SLA tracking, and citizen photo verification workflow.
            </p>
          </div>

          {/* Department Switcher Dropdown */}
          <div className="space-y-1 sm:text-right">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Viewing Department:
            </span>
            <select
              id="officer-dept-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer shadow-md"
            >
              <option value="all">🏢 All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-800">
          <div className="bg-slate-800/70 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-slate-400 text-xs block">Total Assigned</span>
            <span className="text-xl font-bold text-white mt-0.5 block">{totalCount}</span>
          </div>

          <div className="bg-rose-950/30 p-3 rounded-2xl border border-rose-500/30">
            <span className="text-rose-300 text-xs block">Critical / High</span>
            <span className="text-xl font-bold text-rose-400 mt-0.5 block">{criticalCount}</span>
          </div>

          <div className="bg-amber-950/30 p-3 rounded-2xl border border-amber-500/30">
            <span className="text-amber-300 text-xs block">Pending Review</span>
            <span className="text-xl font-bold text-amber-400 mt-0.5 block">{pendingCount}</span>
          </div>

          <div className="bg-blue-950/30 p-3 rounded-2xl border border-blue-500/30">
            <span className="text-blue-300 text-xs block">In Field Progress</span>
            <span className="text-xl font-bold text-blue-400 mt-0.5 block">{inProgressCount}</span>
          </div>

          <div className="bg-emerald-950/30 p-3 rounded-2xl border border-emerald-500/30">
            <span className="text-emerald-300 text-xs block">Resolved / Closed</span>
            <span className="text-xl font-bold text-emerald-400 mt-0.5 block">{resolvedCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Status Filter Tabs */}
          {['all', 'Assigned', 'Accepted', 'In Progress', 'Resolved'].map((st) => (
            <button
              key={st}
              id={`filter-status-${st}`}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'all' ? 'All Status' : st}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            id="filter-priority-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">🔴 Critical Only</option>
            <option value="High">🟠 High Only</option>
            <option value="Medium">🟡 Medium Only</option>
          </select>

          <button
            onClick={loadGrievances}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Refresh Grievances"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grievance Table & Action Cards */}
      <div className="space-y-3">
        {grievances.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">No Grievances Found in Current Filter</h3>
            <p className="text-xs text-slate-400">All assigned department issues are currently triaged or resolved.</p>
          </div>
        ) : (
          grievances.map((g) => (
            <div
              key={g.id}
              id={`officer-grievance-row-${g.id}`}
              className={`bg-slate-900 border rounded-2xl p-5 transition-all hover:border-slate-700 space-y-4 ${
                g.priority === 'Critical'
                  ? 'border-rose-500/40 bg-gradient-to-r from-rose-950/10 via-slate-900 to-slate-900'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
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
                  <span className="text-xs font-semibold text-slate-400">{g.category}</span>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-400">
                    SLA Deadline: <strong className="text-white">{g.expectedResolutionDate}</strong>
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      g.status === 'Resolved' || g.status === 'Closed'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : g.status === 'In Progress'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {g.status}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h4 className="text-base font-bold text-white">{g.title}</h4>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {g.description}
                </p>
              </div>

              {/* Location & AI Suggestion Snapshot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center space-x-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong className="text-white">{g.village}</strong> — {g.locationDetails}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center space-x-2 text-slate-300">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">
                    <strong className="text-white">AI Suggestion:</strong> {g.aiAnalysis.suggestedAction}
                  </span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <div className="flex items-center space-x-2">
                  <button
                    id={`btn-open-detail-${g.id}`}
                    onClick={() => setSelectedGrievance(g)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center space-x-1.5"
                  >
                    <span>Manage & Resolve</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      onTrackPrefill(g.id);
                      onNavigate('track');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 cursor-pointer flex items-center space-x-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View Public Timeline</span>
                  </button>
                </div>

                {g.citizenFeedback && (
                  <div className="text-xs text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Citizen Verified ({g.citizenFeedback.rating} ★)</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Grievance Resolution / Triage Modal Drawer */}
      {selectedGrievance && (
        <div
          id="officer-triage-modal"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {selectedGrievance.id}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {selectedGrievance.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedGrievance(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 cursor-pointer text-xs"
              >
                ✕ Close
              </button>
            </div>

            {/* AI Diagnostics Card */}
            <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-2 text-xs">
              <div className="flex items-center justify-between text-blue-300 font-bold">
                <span className="flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>AI Diagnostics & Priority Rationale</span>
                </span>
                <span className="font-mono">{selectedGrievance.aiAnalysis.confidenceScore}% Confidence</span>
              </div>
              <p className="text-slate-300">
                <strong>Reason:</strong> {selectedGrievance.aiAnalysis.reason}
              </p>
              <p className="text-slate-300">
                <strong>Field Recommendation:</strong> {selectedGrievance.aiAnalysis.suggestedAction}
              </p>
            </div>

            {/* Photos: Citizen Incident & Resolution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {selectedGrievance.photoUrl && (
                <div className="space-y-1">
                  <span className="text-slate-400 font-semibold block">Citizen Incident Photo:</span>
                  <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
                    <img
                      src={selectedGrievance.photoUrl}
                      alt="Incident"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-emerald-300 font-semibold block">Resolution Photo Proof:</span>
                {selectedGrievance.resolutionEvidenceUrl ? (
                  <div className="w-full h-36 rounded-xl overflow-hidden border border-emerald-500/30 bg-slate-800">
                    <img
                      src={selectedGrievance.resolutionEvidenceUrl}
                      alt="Resolution Proof"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="w-full h-36 rounded-xl border border-dashed border-slate-700 flex flex-col items-center justify-center p-3 text-center space-y-1 bg-slate-800/40">
                    <Camera className="w-6 h-6 text-slate-500" />
                    <span className="text-[11px] text-slate-400">No resolution proof uploaded yet</span>
                    <button
                      type="button"
                      onClick={() => setEvidencePhotoUrl(SAMPLE_RESOLUTION_PHOTOS[0])}
                      className="text-[10px] text-emerald-400 underline cursor-pointer"
                    >
                      Pre-fill Sample Repair Photo
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Officer Action Form */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Officer Action & Remarks
              </h4>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Remarks / Work Update:</label>
                <textarea
                  rows={2}
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  placeholder="E.g. Asphalt patch work completed by sector team. Road leveled and clear."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Resolution Evidence Photo URL:</label>
                <input
                  type="text"
                  value={evidencePhotoUrl}
                  onChange={(e) => setEvidencePhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Status Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  id="officer-btn-accept"
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusUpdate('Accepted')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
                >
                  1. Accept Assignment
                </button>

                <button
                  type="button"
                  id="officer-btn-progress"
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusUpdate('In Progress')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                >
                  2. Mark In Progress (Dispatch Team)
                </button>

                <button
                  type="button"
                  id="officer-btn-resolve"
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusUpdate('Resolved')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>3. Submit Resolution & Photo Proof</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
