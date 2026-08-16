/**
 * RuralReadiness — Smart Citizen Grievance & Rural Development Intelligence Platform Types
 */

export type UserRole = 'citizen' | 'officer' | 'admin';

export type LanguageCode = 'en' | 'hi' | 'te';

export type GrievanceCategory =
  | 'Roads & Transport'
  | 'Water Supply'
  | 'Electricity'
  | 'Sanitation & Waste'
  | 'Healthcare'
  | 'Education'
  | 'Agriculture'
  | 'Internet & Connectivity'
  | 'Public Safety'
  | 'Government Services'
  | 'Environment'
  | 'Other';

export type GrievancePriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type DepartmentName =
  | 'Roads & Infrastructure Department'
  | 'Rural Water Supply Department'
  | 'Electricity Department'
  | 'Sanitation & Municipal Department'
  | 'Health Department'
  | 'Education Department'
  | 'Agriculture & Irrigation Department'
  | 'Digital Connectivity & Telecom'
  | 'Public Safety & Law Enforcement'
  | 'Panchayat & Rural Development';

export type GrievanceStatus =
  | 'Submitted'
  | 'AI Analyzed'
  | 'Assigned'
  | 'Accepted'
  | 'In Progress'
  | 'Resolved'
  | 'Citizen Verification'
  | 'Closed'
  | 'Reopened';

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  timeDisplay: string;
  title: string;
  description: string;
  actor: string;
  actorRole: 'System' | 'AI Assistant' | 'Department Officer' | 'Citizen' | 'Administrator';
  statusChange?: {
    from?: GrievanceStatus;
    to: GrievanceStatus;
  };
  evidenceUrl?: string;
}

export interface AIAnalysis {
  category: GrievanceCategory;
  subcategory: string;
  responsibleDepartment: string;
  priority: GrievancePriority;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  locationDetected: string;
  keyIssue: string;
  reason: string;
  suggestedAction: string;
  confidenceScore: number; // 0-100
  possibleDuplicates: string[];
  affectedEstimate: string;
}

export interface CitizenFeedback {
  isResolved: boolean;
  rating: number; // 1 to 5
  comment?: string;
  submittedAt: string;
}

export interface Grievance {
  id: string; // e.g. "RR-2026-000124"
  title: string;
  description: string;
  category: GrievanceCategory;
  subcategory?: string;
  village: string;
  villageId: string;
  district: string;
  state: string;
  coordinates: [number, number]; // [lat, lng]
  locationDetails?: string;
  photoUrl?: string;
  reporterName: string;
  contactPhone: string;
  preferredLanguage: LanguageCode;
  priority: GrievancePriority;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  assignedDepartment: string;
  assignedOfficer?: string;
  status: GrievanceStatus;
  submittedAt: string;
  expectedResolutionDate: string;
  slaDeadline: string;
  isOverdue: boolean;
  activityLog: ActivityLogItem[];
  aiAnalysis: AIAnalysis;
  officerRemarks?: string;
  resolutionEvidenceUrl?: string;
  citizenFeedback?: CitizenFeedback;
  duplicateCount: number;
  isRecurringCluster?: boolean;
  clusterId?: string;
}

export interface VillageDevelopmentHealth {
  id: string;
  name: string;
  district: string;
  state: string;
  coordinates: [number, number];
  population: number;
  overallScore: number; // 0-100
  breakdown: {
    infrastructure: number;
    waterSanitation: number;
    connectivity: number;
    education: number;
    healthcare: number;
    publicServices: number;
  };
  totalGrievances: number;
  pendingGrievances: number;
  resolvedGrievances: number;
  criticalGrievances: number;
  recurringIssuesCount: number;
  recentSurgeCategory?: GrievanceCategory;
  recentSurgePct?: number;
}

export interface ProblemHotspot {
  id: string;
  villageId: string;
  villageName: string;
  district: string;
  coordinates: [number, number];
  primaryCategory: GrievanceCategory;
  complaintCount: number;
  severityLevel: 'High' | 'Medium' | 'Low';
  surgePercentage: number; // e.g. 42
  timeframe: string; // e.g. "Last 30 Days"
  summaryInsight: string;
  activeIssues: string[];
}

export interface RecurringIssueCluster {
  id: string;
  title: string;
  category: GrievanceCategory;
  complaintCount: number;
  affectedVillage: string;
  affectedArea: string;
  priority: GrievancePriority;
  firstReportedDate: string;
  lastReportedDate: string;
  sampleGrievanceIds: string[];
  rootCauseAnalysis: string;
  recommendedAction: string;
  estimatedCost: string;
  status: 'Identified' | 'Under Planning' | 'Work In Progress' | 'Resolved';
}

export interface DepartmentPerformance {
  department: string;
  shortCode: string;
  iconName: string;
  headOfficer: string;
  received: number;
  resolved: number;
  pending: number;
  inProgress: number;
  overdue: number;
  avgResolutionDays: number;
  citizenSatisfaction: number; // 1-5
  resolutionPercentage: number; // 0-100
}

export interface DevelopmentPriorityRank {
  rank: number;
  villageId: string;
  villageName: string;
  district: string;
  priorityLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  totalGrievances: number;
  recurringIssues: number;
  populationAffected: number;
  essentialServiceDisruptions: string;
  resolutionDelayDays: number;
  reason: string;
  recommendedIntervention: string;
  estimatedBudget: string;
}

export interface DevelopmentSimulatorOption {
  id: string;
  title: string;
  category: GrievanceCategory;
  villageId: string;
  villageName: string;
  problemDescription: string;
  investmentAmountINR: string; // e.g. "₹50 Lakh"
  investmentAmountNumber: number; // in Lakhs
  timeframeMonths: number;
  affectedVillagesCount: number;
  expectedOutcomes: string[];
  projectedComplaintsReductionPct: number;
  projectedHealthScoreBoost: number;
  projectedCategoryBoosts: {
    infrastructure?: number;
    waterSanitation?: number;
    connectivity?: number;
    education?: number;
    healthcare?: number;
    publicServices?: number;
  };
}

export interface AppState {
  currentTab: string;
  userRole: UserRole;
  language: LanguageCode;
  selectedGrievanceId?: string;
  selectedVillageId?: string;
  activeFilterCategory?: string;
  activeFilterPriority?: string;
}
