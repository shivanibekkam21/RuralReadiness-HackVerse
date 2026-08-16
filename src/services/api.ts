import {
  Grievance,
  VillageDevelopmentHealth,
  ProblemHotspot,
  RecurringIssueCluster,
  DepartmentPerformance,
  DevelopmentPriorityRank,
  DevelopmentSimulatorOption,
  AIAnalysis
} from '../types';
import {
  DEMO_GRIEVANCES,
  DEMO_VILLAGES,
  DEMO_HOTSPOTS,
  DEMO_RECURRING_ISSUES,
  DEMO_DEPARTMENT_PERFORMANCE,
  DEMO_PRIORITY_RANKINGS,
  DEMO_SIMULATOR_OPTIONS
} from '../data/demoData';

const LOCAL_STORAGE_GRIEVANCES_KEY = 'ruralreadiness_grievances_v2';

function getLocalGrievances(): Grievance[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_GRIEVANCES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read from localStorage', err);
  }
  // Initialize with demo grievances
  saveLocalGrievances(DEMO_GRIEVANCES);
  return DEMO_GRIEVANCES;
}

function saveLocalGrievances(grievances: Grievance[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_GRIEVANCES_KEY, JSON.stringify(grievances));
  } catch (err) {
    console.warn('Could not save to localStorage', err);
  }
}

export async function fetchGrievances(filters?: {
  status?: string;
  department?: string;
  village?: string;
  priority?: string;
  category?: string;
  search?: string;
}): Promise<Grievance[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.department) params.set('department', filters.department);
    if (filters?.village) params.set('village', filters.village);
    if (filters?.priority) params.set('priority', filters.priority);
    if (filters?.category) params.set('category', filters.category);
    if (filters?.search) params.set('search', filters.search);

    const res = await fetch(`/api/grievances?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch grievances');
    const data = await res.json();
    if (Array.isArray(data.grievances)) {
      // Sync to localStorage
      saveLocalGrievances(data.grievances);
      return data.grievances;
    }
    return getLocalGrievances();
  } catch (err) {
    console.warn('API error, using local/demo storage fallback:', err);
    let list = getLocalGrievances();

    if (filters?.status && filters.status !== 'all') {
      list = list.filter((g) => g.status.toLowerCase() === filters.status!.toLowerCase());
    }
    if (filters?.department && filters.department !== 'all') {
      list = list.filter((g) => g.assignedDepartment.toLowerCase().includes(filters.department!.toLowerCase()));
    }
    if (filters?.village && filters.village !== 'all') {
      list = list.filter((g) => g.village.toLowerCase() === filters.village!.toLowerCase() || g.villageId === filters.village);
    }
    if (filters?.priority && filters.priority !== 'all') {
      list = list.filter((g) => g.priority.toLowerCase() === filters.priority!.toLowerCase());
    }
    if (filters?.category && filters.category !== 'all') {
      list = list.filter((g) => g.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (g) =>
          g.id.toLowerCase().includes(q) ||
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.village.toLowerCase().includes(q) ||
          g.reporterName.toLowerCase().includes(q)
      );
    }
    return list;
  }
}

export async function fetchGrievanceById(id: string): Promise<Grievance | null> {
  const cleanId = id.trim().toUpperCase();
  try {
    const res = await fetch(`/api/grievances/${encodeURIComponent(cleanId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.grievance) {
        return data.grievance;
      }
    }
  } catch (err) {
    console.warn('API error fetching grievance by ID, checking local storage:', err);
  }

  const localList = getLocalGrievances();
  return localList.find((g) => g.id.toUpperCase() === cleanId) || null;
}

export async function analyzeGrievanceWithAI(payload: {
  title: string;
  description: string;
  village?: string;
  category?: string;
  imageBase64?: string;
}): Promise<AIAnalysis> {
  try {
    const res = await fetch('/api/ai/analyze-grievance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('AI analysis failed');
    const data = await res.json();
    return data.analysis;
  } catch (err) {
    console.warn('AI analysis API error, falling back to smart local evaluation:', err);
    const text = `${payload.title || ''} ${payload.description || ''}`.toLowerCase();
    let detectedCat = payload.category && payload.category !== 'auto' ? payload.category : 'Roads & Transport';
    let dept = 'Roads & Infrastructure Department';
    let priority: 'Critical' | 'High' | 'Medium' | 'Low' = 'Medium';
    let reason = 'General infrastructure request requiring inspection.';
    let action = 'Field inspection by maintenance team.';

    if (text.includes('water') || text.includes('pump') || text.includes('tank') || text.includes('drinking')) {
      detectedCat = 'Water Supply';
      dept = 'Rural Water Supply Department';
      priority = text.includes('elderly') || text.includes('four days') || text.includes('no water') ? 'Critical' : 'High';
      reason = 'Interruption to vital community drinking water source.';
      action = 'Emergency pump replacement and drinking water tanker supply.';
    } else if (text.includes('wire') || text.includes('spark') || text.includes('electric') || text.includes('shock')) {
      detectedCat = 'Electricity';
      dept = 'Electricity Department';
      priority = 'Critical';
      reason = 'Live high voltage conductor poses life hazard to commuters and livestock.';
      action = 'Immediate feeder isolation and cable restringing.';
    } else if (text.includes('road') || text.includes('pothole') || text.includes('school')) {
      detectedCat = 'Roads & Transport';
      dept = 'Roads & Infrastructure Department';
      priority = text.includes('accident') || text.includes('school') ? 'High' : 'Medium';
      reason = 'Damaged road surface impacting school student and emergency transport.';
      action = 'Asphalt gravel patch work and road leveling.';
    }

    return {
      category: detectedCat as any,
      subcategory: `${detectedCat} Maintenance`,
      responsibleDepartment: dept,
      priority,
      severity: priority,
      locationDetected: payload.village || 'Rural Community',
      keyIssue: payload.title || `${detectedCat} issue reported`,
      reason,
      suggestedAction: action,
      confidenceScore: 92,
      possibleDuplicates: [],
      affectedEstimate: 'Local residents and daily commuters'
    };
  }
}

export async function submitGrievance(payload: Partial<Grievance>): Promise<Grievance> {
  try {
    const res = await fetch('/api/grievances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.grievance) {
        // Also persist locally
        const list = getLocalGrievances();
        list.unshift(data.grievance);
        saveLocalGrievances(list);
        return data.grievance;
      }
    }
  } catch (err) {
    console.warn('API submission error, saving to local state:', err);
  }

  // Local fallback submission
  const newId = `RR-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date();
  const fallback: Grievance = {
    id: newId,
    title: payload.title || 'Submitted Grievance',
    description: payload.description || '',
    category: payload.category || 'Roads & Transport',
    subcategory: payload.subcategory || 'Rural Infrastructure',
    village: payload.village || 'Vikaspur',
    villageId: payload.villageId || 'vil-vikaspur',
    district: payload.district || 'North District',
    state: payload.state || 'State Alpha',
    coordinates: payload.coordinates || [24.814, 88.232],
    locationDetails: payload.locationDetails || `${payload.village || 'Vikaspur'} Area`,
    photoUrl: payload.photoUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    priority: payload.priority || 'Medium',
    severity: payload.severity || 'Medium',
    assignedDepartment: payload.assignedDepartment || 'Roads & Infrastructure Department',
    status: 'Assigned',
    submittedAt: now.toISOString().replace('T', ' ').substring(0, 19),
    expectedResolutionDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    slaDeadline: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    isOverdue: false,
    reporterName: payload.reporterName || 'Citizen',
    contactPhone: payload.contactPhone || '+91 98765 00000',
    preferredLanguage: payload.preferredLanguage || 'en',
    duplicateCount: 1,
    activityLog: [
      {
        id: `act-${Date.now()}-1`,
        timestamp: now.toISOString(),
        timeDisplay: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: 'Complaint Submitted',
        description: 'Grievance recorded successfully.',
        actor: payload.reporterName || 'Citizen',
        actorRole: 'Citizen',
        statusChange: { to: 'Submitted' }
      },
      {
        id: `act-${Date.now()}-2`,
        timestamp: now.toISOString(),
        timeDisplay: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: 'AI Smart Classification',
        description: `AI assigned to ${payload.assignedDepartment || 'Roads & Infrastructure Department'} with ${payload.priority || 'Medium'} priority.`,
        actor: 'RuralReadiness AI Engine',
        actorRole: 'AI Assistant',
        statusChange: { to: 'Assigned' }
      }
    ],
    aiAnalysis: payload.aiAnalysis || {
      category: payload.category || 'Roads & Transport',
      subcategory: 'Public Infrastructure Issue',
      responsibleDepartment: payload.assignedDepartment || 'Roads & Infrastructure Department',
      priority: payload.priority || 'Medium',
      severity: 'Medium',
      locationDetected: payload.village || 'Village',
      keyIssue: payload.title || 'Public complaint',
      reason: 'AI classification complete.',
      suggestedAction: 'Inspection by local department authority.',
      confidenceScore: 90,
      possibleDuplicates: [],
      affectedEstimate: 'Local residents'
    }
  };

  const list = getLocalGrievances();
  list.unshift(fallback);
  saveLocalGrievances(list);
  return fallback;
}

export async function updateGrievanceStatus(
  id: string,
  payload: {
    status: string;
    officerRemarks?: string;
    resolutionEvidenceUrl?: string;
    officerName?: string;
  }
): Promise<Grievance> {
  try {
    const res = await fetch(`/api/grievances/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.grievance) {
        // Update local storage
        const list = getLocalGrievances();
        const idx = list.findIndex((g) => g.id.toUpperCase() === id.toUpperCase());
        if (idx !== -1) {
          list[idx] = data.grievance;
          saveLocalGrievances(list);
        }
        return data.grievance;
      }
    }
  } catch (err) {
    console.warn('API error updating status, updating local storage:', err);
  }

  // Update in local storage
  const list = getLocalGrievances();
  const idx = list.findIndex((g) => g.id.toUpperCase() === id.toUpperCase());
  if (idx !== -1) {
    const current = list[idx];
    current.status = payload.status as any;
    if (payload.officerRemarks) current.officerRemarks = payload.officerRemarks;
    if (payload.resolutionEvidenceUrl) current.resolutionEvidenceUrl = payload.resolutionEvidenceUrl;
    if (payload.officerName) current.assignedOfficer = payload.officerName;

    current.activityLog.push({
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeDisplay: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: `Status Updated to ${payload.status}`,
      description: payload.officerRemarks || `Officer changed status to ${payload.status}.`,
      actor: payload.officerName || 'Department Officer',
      actorRole: 'Department Officer',
      statusChange: { to: payload.status as any },
      evidenceUrl: payload.resolutionEvidenceUrl
    });

    saveLocalGrievances(list);
    return current;
  }
  throw new Error('Grievance not found to update status');
}

export async function submitCitizenFeedback(
  id: string,
  payload: {
    isResolved: boolean;
    rating: number;
    comment?: string;
  }
): Promise<Grievance> {
  try {
    const res = await fetch(`/api/grievances/${encodeURIComponent(id)}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.grievance) {
        const list = getLocalGrievances();
        const idx = list.findIndex((g) => g.id.toUpperCase() === id.toUpperCase());
        if (idx !== -1) {
          list[idx] = data.grievance;
          saveLocalGrievances(list);
        }
        return data.grievance;
      }
    }
  } catch (err) {
    console.warn('API error submitting feedback, updating local storage:', err);
  }

  const list = getLocalGrievances();
  const idx = list.findIndex((g) => g.id.toUpperCase() === id.toUpperCase());
  if (idx !== -1) {
    const current = list[idx];
    const newStatus = payload.isResolved ? 'Closed' : 'Reopened';
    current.status = newStatus as any;
    current.citizenFeedback = {
      isResolved: payload.isResolved,
      rating: payload.rating,
      comment: payload.comment,
      submittedAt: new Date().toISOString()
    };
    current.activityLog.push({
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeDisplay: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: payload.isResolved ? 'Citizen Verified Resolution' : 'Citizen Reopened Grievance',
      description: payload.comment || (payload.isResolved ? 'Problem confirmed resolved.' : 'Issue still persists.'),
      actor: current.reporterName,
      actorRole: 'Citizen',
      statusChange: { to: newStatus as any }
    });
    saveLocalGrievances(list);
    return current;
  }
  throw new Error('Grievance not found to submit feedback');
}

export async function fetchVillages(): Promise<VillageDevelopmentHealth[]> {
  try {
    const res = await fetch('/api/villages');
    if (!res.ok) throw new Error('Failed to fetch villages');
    const data = await res.json();
    return data.villages;
  } catch (err) {
    return DEMO_VILLAGES;
  }
}

export async function fetchHotspots(): Promise<ProblemHotspot[]> {
  try {
    const res = await fetch('/api/hotspots');
    if (!res.ok) throw new Error('Failed to fetch hotspots');
    const data = await res.json();
    return data.hotspots;
  } catch (err) {
    return DEMO_HOTSPOTS;
  }
}

export async function fetchRecurringIssues(): Promise<RecurringIssueCluster[]> {
  try {
    const res = await fetch('/api/recurring-issues');
    if (!res.ok) throw new Error('Failed to fetch recurring issues');
    const data = await res.json();
    return data.recurringIssues;
  } catch (err) {
    return DEMO_RECURRING_ISSUES;
  }
}

export async function fetchDepartmentPerformance(): Promise<DepartmentPerformance[]> {
  try {
    const res = await fetch('/api/departments/performance');
    if (!res.ok) throw new Error('Failed to fetch department performance');
    const data = await res.json();
    return data.performance;
  } catch (err) {
    return DEMO_DEPARTMENT_PERFORMANCE;
  }
}

export async function fetchPriorityRankings(): Promise<DevelopmentPriorityRank[]> {
  try {
    const res = await fetch('/api/priority-ranking');
    if (!res.ok) throw new Error('Failed to fetch priority rankings');
    const data = await res.json();
    return data.rankings;
  } catch (err) {
    return DEMO_PRIORITY_RANKINGS;
  }
}

export async function fetchSimulatorOptions(): Promise<DevelopmentSimulatorOption[]> {
  try {
    const res = await fetch('/api/simulator/options');
    if (!res.ok) throw new Error('Failed to fetch simulator options');
    const data = await res.json();
    return data.options;
  } catch (err) {
    return DEMO_SIMULATOR_OPTIONS;
  }
}

export async function runDevelopmentSimulation(payload: {
  optionId?: string;
  villageId?: string;
  customBudgetLakh?: number;
  customCategory?: string;
}): Promise<any> {
  const res = await fetch('/api/simulator/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to run simulation');
  const data = await res.json();
  return data.simulation;
}
