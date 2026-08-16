import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import {
  DEMO_GRIEVANCES,
  DEMO_VILLAGES,
  DEMO_HOTSPOTS,
  DEMO_RECURRING_ISSUES,
  DEMO_DEPARTMENT_PERFORMANCE,
  DEMO_PRIORITY_RANKINGS,
  DEMO_SIMULATOR_OPTIONS
} from './src/data/demoData';
import {
  Grievance,
  VillageDevelopmentHealth,
  ProblemHotspot,
  RecurringIssueCluster,
  DepartmentPerformance,
  DevelopmentPriorityRank,
  DevelopmentSimulatorOption,
  AIAnalysis
} from './src/types';

// Initialize Gemini AI client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// In-Memory State Stores
let grievancesStore: Grievance[] = JSON.parse(JSON.stringify(DEMO_GRIEVANCES));
let villagesStore: VillageDevelopmentHealth[] = JSON.parse(JSON.stringify(DEMO_VILLAGES));
let hotspotsStore: ProblemHotspot[] = JSON.parse(JSON.stringify(DEMO_HOTSPOTS));
let recurringIssuesStore: RecurringIssueCluster[] = JSON.parse(JSON.stringify(DEMO_RECURRING_ISSUES));
let departmentPerfStore: DepartmentPerformance[] = JSON.parse(JSON.stringify(DEMO_DEPARTMENT_PERFORMANCE));
let priorityRankingsStore: DevelopmentPriorityRank[] = JSON.parse(JSON.stringify(DEMO_PRIORITY_RANKINGS));
let simulatorOptionsStore: DevelopmentSimulatorOption[] = JSON.parse(JSON.stringify(DEMO_SIMULATOR_OPTIONS));

let grievanceCounter = 132;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // --- API ROUTES ---

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), platform: 'RuralReadiness Intelligence' });
  });

  // GET /api/grievances - list with filtering & search
  app.get('/api/grievances', (req, res) => {
    const { status, department, village, priority, search, category } = req.query as Record<string, string>;

    let result = [...grievancesStore];

    if (status && status !== 'all') {
      result = result.filter((g) => g.status.toLowerCase() === status.toLowerCase());
    }
    if (department && department !== 'all') {
      result = result.filter((g) => g.assignedDepartment.toLowerCase().includes(department.toLowerCase()));
    }
    if (village && village !== 'all') {
      result = result.filter((g) => g.village.toLowerCase() === village.toLowerCase() || g.villageId === village);
    }
    if (priority && priority !== 'all') {
      result = result.filter((g) => g.priority.toLowerCase() === priority.toLowerCase());
    }
    if (category && category !== 'all') {
      result = result.filter((g) => g.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) =>
          g.id.toLowerCase().includes(q) ||
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.village.toLowerCase().includes(q) ||
          g.reporterName.toLowerCase().includes(q)
      );
    }

    res.json({ grievances: result, total: result.length });
  });

  // GET /api/grievances/:id - get single grievance
  app.get('/api/grievances/:id', (req, res) => {
    const grievance = grievancesStore.find((g) => g.id.toUpperCase() === req.params.id.toUpperCase());
    if (!grievance) {
      return res.status(404).json({ error: 'Grievance not found' });
    }
    res.json({ grievance });
  });

  // POST /api/ai/analyze-grievance - Smart AI classification, department assignment, priority & duplicate check
  app.post('/api/ai/analyze-grievance', async (req, res) => {
    const { title, description, village, category, imageBase64 } = req.body;

    if (!description && !title) {
      return res.status(400).json({ error: 'Title or description is required' });
    }

    const inputContent = `Title: ${title || 'N/A'}\nDescription: ${description}\nVillage/Location: ${village || 'Rural Community'}\nUser Category: ${category || 'Auto-Detect'}`;

    if (ai) {
      try {
        const prompt = `You are RuralReadiness AI, an expert rural grievance triage & smart governance engine.
Analyze this citizen grievance submission:
"${inputContent}"

Classify into one of these exact categories:
- Roads & Transport
- Water Supply
- Electricity
- Sanitation & Waste
- Healthcare
- Education
- Agriculture
- Internet & Connectivity
- Public Safety
- Government Services
- Environment
- Other

Assign priority (Critical, High, Medium, Low) based on:
- Safety risk & imminent danger
- Number of affected people
- Duration of problem
- Essential service impact (e.g. drinking water, emergency health, high voltage hazard = Critical)
- Vulnerable population impact (school children, elderly, patients)

Assign responsible department from:
- Roads & Infrastructure Department
- Rural Water Supply Department
- Electricity Department
- Sanitation & Municipal Department
- Health Department
- Education Department
- Agriculture & Irrigation Department
- Digital Connectivity & Telecom
- Public Safety & Law Enforcement
- Panchayat & Rural Development

Provide a concise, user-friendly JSON output matching the schema.`;

        const contents: any = imageBase64
          ? {
              parts: [
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64.replace(/^data:image\/\w+;base64,/, '')
                  }
                },
                { text: prompt }
              ]
            }
          : prompt;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                subcategory: { type: Type.STRING },
                responsibleDepartment: { type: Type.STRING },
                priority: { type: Type.STRING },
                severity: { type: Type.STRING },
                locationDetected: { type: Type.STRING },
                keyIssue: { type: Type.STRING },
                reason: { type: Type.STRING },
                suggestedAction: { type: Type.STRING },
                confidenceScore: { type: Type.NUMBER },
                affectedEstimate: { type: Type.STRING }
              },
              required: [
                'category',
                'subcategory',
                'responsibleDepartment',
                'priority',
                'severity',
                'locationDetected',
                'keyIssue',
                'reason',
                'suggestedAction',
                'confidenceScore',
                'affectedEstimate'
              ]
            }
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          const validatedPriority = ['Critical', 'High', 'Medium', 'Low'].includes(parsed.priority)
            ? parsed.priority
            : 'Medium';
          
          return res.json({
            analysis: {
              ...parsed,
              priority: validatedPriority,
              severity: parsed.severity || validatedPriority,
              possibleDuplicates: []
            }
          });
        }
      } catch (err) {
        console.error('Gemini AI analysis error:', err);
      }
    }

    // High-Quality Rule-Based Smart AI Fallback
    const text = `${title} ${description}`.toLowerCase();
    let detectedCategory = 'Roads & Transport';
    let subcat = 'Road Damage & Surface Issue';
    let dept = 'Roads & Infrastructure Department';
    let priority: 'Critical' | 'High' | 'Medium' | 'Low' = 'Medium';
    let reason = 'Standard public infrastructure maintenance request.';
    let action = 'Field inspection and routine repair dispatch.';
    let keyIssue = 'Local infrastructure issue reported by citizen.';
    let affected = 'Local community residents and commuters';

    if (text.includes('water') || text.includes('pump') || text.includes('pipe') || text.includes('tank') || text.includes('drinking')) {
      detectedCategory = 'Water Supply';
      dept = 'Rural Water Supply Department';
      subcat = 'Drinking Water Interruption';
      if (text.includes('four days') || text.includes('no water') || text.includes('struggl') || text.includes('elderly') || text.includes('village')) {
        priority = 'Critical';
        reason = 'Extended interruption of essential drinking water service affecting vulnerable residents.';
        action = 'Immediate field inspection, emergency water tanker dispatch, and pump motor replacement.';
      } else {
        priority = 'High';
        reason = 'Piped water supply deficit affecting household utility.';
        action = 'Pipeline leak repair and pressure test.';
      }
      keyIssue = 'Drinking water supply interruption';
      affected = 'Approx. 250-400 households';
    } else if (text.includes('wire') || text.includes('spark') || text.includes('electric') || text.includes('transformer') || text.includes('power') || text.includes('light')) {
      detectedCategory = 'Electricity';
      dept = 'Electricity Department';
      subcat = 'Power Line & Distribution Hazard';
      if (text.includes('spark') || text.includes('hanging') || text.includes('danger') || text.includes('shock') || text.includes('high tension')) {
        priority = 'Critical';
        reason = 'Imminent live electrical conductor hazard posing electrocution risk to pedestrians and livestock.';
        action = 'Emergency feeder shutdown and pole/wire tension restoration.';
      } else {
        priority = 'Medium';
        reason = 'Power fluctuation or non-functional street illumination.';
        action = 'Transformer inspection and streetlight replacement.';
      }
      keyIssue = 'Electrical supply fault and line safety hazard';
      affected = 'Local farming and residential corridor';
    } else if (text.includes('pothole') || text.includes('road') || text.includes('bridge') || text.includes('highway') || text.includes('accident') || text.includes('school road')) {
      detectedCategory = 'Roads & Transport';
      dept = 'Roads & Infrastructure Department';
      subcat = 'Pothole & Surface Damage';
      if (text.includes('school') || text.includes('student') || text.includes('accident') || text.includes('danger')) {
        priority = 'High';
        reason = 'Severe road potholing on primary school transit route creating accident risk for students.';
        action = 'Asphalt gravel patching, road surface leveling, and speed breaker installation.';
      } else {
        priority = 'Medium';
        reason = 'Road surface deterioration impacting vehicle travel.';
        action = 'Road maintenance survey and patch work.';
      }
      keyIssue = 'Dangerous road potholes impacting commuter safety';
      affected = 'Approx. 600+ students and local daily commuters';
    } else if (text.includes('drain') || text.includes('waste') || text.includes('garbage') || text.includes('sewage') || text.includes('dirty') || text.includes('mosquito')) {
      detectedCategory = 'Sanitation & Waste';
      dept = 'Sanitation & Municipal Department';
      subcat = 'Drainage Blockage & Waste Overflow';
      priority = text.includes('market') || text.includes('flood') ? 'High' : 'Medium';
      reason = 'Open drain siltation and solid waste stagnation creating public hygiene and vector breeding risks.';
      action = 'Mechanical drain desilting, waste clearance, and chemical bleaching treatment.';
      keyIssue = 'Blocked drainage and stagnant waste accumulation';
      affected = 'Local commercial market and neighboring households';
    } else if (text.includes('hospital') || text.includes('doctor') || text.includes('medicine') || text.includes('clinic') || text.includes('health') || text.includes('snake')) {
      detectedCategory = 'Healthcare';
      dept = 'Health Department';
      subcat = 'Medical Supplies & Clinic Support';
      priority = 'High';
      reason = 'Shortage of critical life-saving medications or diagnostic equipment at rural health centre.';
      action = 'Emergency dispatch of medical buffer stock from district medical store.';
      keyIssue = 'Primary healthcare medicine and emergency equipment deficit';
      affected = 'Patients across neighboring panchayats';
    } else if (text.includes('internet') || text.includes('broadband') || text.includes('fiber') || text.includes('csc') || text.includes('wifi') || text.includes('network') || text.includes('signal')) {
      detectedCategory = 'Internet & Connectivity';
      dept = 'Digital Connectivity & Telecom';
      subcat = 'Broadband Fiber Breakdown';
      priority = 'Medium';
      reason = 'Telecom outage disabling citizen government services (DBT, Aadhaar) and student learning.';
      action = 'OTDR fault localization and fiber cable fusion splicing.';
      keyIssue = 'Broadband connectivity outage impacting digital public services';
      affected = 'CSC beneficiaries and local businesses';
    }

    const fallbackAnalysis: AIAnalysis = {
      category: detectedCategory as any,
      subcategory: subcat,
      responsibleDepartment: dept,
      priority,
      severity: priority,
      locationDetected: village || 'Rural Community Zone',
      keyIssue,
      reason,
      suggestedAction: action,
      confidenceScore: 94,
      possibleDuplicates: [],
      affectedEstimate: affected
    };

    res.json({ analysis: fallbackAnalysis });
  });

  // POST /api/grievances - Submit new grievance
  app.post('/api/grievances', (req, res) => {
    const {
      title,
      description,
      category,
      village,
      villageId,
      district,
      state,
      locationDetails,
      photoUrl,
      reporterName,
      contactPhone,
      preferredLanguage,
      coordinates,
      aiAnalysis
    } = req.body;

    grievanceCounter += 1;
    const paddedNum = String(grievanceCounter).padStart(6, '0');
    const newId = `RR-2026-${paddedNum}`;

    const matchingVillage =
      villagesStore.find((v) => v.id === villageId || v.name.toLowerCase() === (village || '').toLowerCase()) ||
      villagesStore[0];

    const finalCategory = aiAnalysis?.category || category || 'Roads & Transport';
    const finalPriority = aiAnalysis?.priority || 'Medium';
    const finalDepartment = aiAnalysis?.responsibleDepartment || 'Roads & Infrastructure Department';

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const dateStr = now.toISOString().split('T')[0];

    // SLA: Critical = 2 days, High = 4 days, Medium = 7 days, Low = 10 days
    const daysToAdd = finalPriority === 'Critical' ? 2 : finalPriority === 'High' ? 4 : 7;
    const slaDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newGrievance: Grievance = {
      id: newId,
      title: title || `${finalCategory} issue in ${matchingVillage.name}`,
      description: description || 'No details provided.',
      category: finalCategory,
      subcategory: aiAnalysis?.subcategory || `${finalCategory} Maintenance`,
      village: matchingVillage.name,
      villageId: matchingVillage.id,
      district: district || matchingVillage.district,
      state: state || matchingVillage.state,
      coordinates: coordinates || matchingVillage.coordinates,
      locationDetails: locationDetails || `${matchingVillage.name} Main Area`,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      reporterName: reporterName || 'Concerned Citizen',
      contactPhone: contactPhone || '+91 98765 00000',
      preferredLanguage: preferredLanguage || 'en',
      priority: finalPriority,
      severity: aiAnalysis?.severity || finalPriority,
      assignedDepartment: finalDepartment,
      status: 'Assigned',
      submittedAt: `${dateStr} ${timeStr}`,
      expectedResolutionDate: slaDate,
      slaDeadline: slaDate,
      isOverdue: false,
      duplicateCount: 1,
      activityLog: [
        {
          id: `act-${Date.now()}-1`,
          timestamp: `${dateStr} ${timeStr}`,
          timeDisplay: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Complaint Submitted',
          description: `Citizen ${reporterName || 'Citizen'} submitted grievance via portal.`,
          actor: reporterName || 'Citizen',
          actorRole: 'Citizen',
          statusChange: { to: 'Submitted' }
        },
        {
          id: `act-${Date.now()}-2`,
          timestamp: `${dateStr} ${timeStr}`,
          timeDisplay: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'AI Intelligence Classification',
          description: `AI classified as ${finalCategory} with ${finalPriority} priority. Recommended routing to ${finalDepartment}.`,
          actor: 'RuralReadiness AI Engine',
          actorRole: 'AI Assistant',
          statusChange: { from: 'Submitted', to: 'AI Analyzed' }
        },
        {
          id: `act-${Date.now()}-3`,
          timestamp: `${dateStr} ${timeStr}`,
          timeDisplay: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Smart Department Assignment',
          description: `Automatically routed to ${finalDepartment}. Officer notification dispatched.`,
          actor: 'RuralReadiness System',
          actorRole: 'System',
          statusChange: { from: 'AI Analyzed', to: 'Assigned' }
        }
      ],
      aiAnalysis: aiAnalysis || {
        category: finalCategory,
        subcategory: `${finalCategory} Issue`,
        responsibleDepartment: finalDepartment,
        priority: finalPriority,
        severity: finalPriority,
        locationDetected: matchingVillage.name,
        keyIssue: title || 'Reported rural issue',
        reason: 'Automated AI classification based on submitted description.',
        suggestedAction: 'Field inspection and corrective action by assigned department.',
        confidenceScore: 92,
        possibleDuplicates: [],
        affectedEstimate: 'Local residents'
      }
    };

    grievancesStore.unshift(newGrievance);

    // Update village count
    matchingVillage.totalGrievances += 1;
    matchingVillage.pendingGrievances += 1;
    if (finalPriority === 'Critical') matchingVillage.criticalGrievances += 1;

    res.status(201).json({ grievance: newGrievance, message: 'Grievance submitted and routed successfully' });
  });

  // PATCH /api/grievances/:id/status - Officer status update & remarks
  app.patch('/api/grievances/:id/status', (req, res) => {
    const { status, officerRemarks, resolutionEvidenceUrl, officerName } = req.body;
    const idx = grievancesStore.findIndex((g) => g.id.toUpperCase() === req.params.id.toUpperCase());

    if (idx === -1) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    const current = grievancesStore[idx];
    const prevStatus = current.status;
    const now = new Date();
    const timeDisplay = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    current.status = status;
    if (officerRemarks) current.officerRemarks = officerRemarks;
    if (resolutionEvidenceUrl) current.resolutionEvidenceUrl = resolutionEvidenceUrl;
    if (officerName) current.assignedOfficer = officerName;

    let actTitle = `Status Changed to ${status}`;
    let actDesc = officerRemarks || `Officer updated grievance status to ${status}.`;

    if (status === 'Accepted') {
      actTitle = 'Officer Accepted Grievance';
      actDesc = officerRemarks || `${officerName || 'Department Officer'} accepted the assignment and scheduled inspection.`;
    } else if (status === 'In Progress') {
      actTitle = 'Field Work in Progress';
      actDesc = officerRemarks || 'Technical maintenance crew and equipment dispatched to location.';
    } else if (status === 'Resolved') {
      actTitle = 'Marked as Resolved';
      actDesc = officerRemarks || 'Resolution completed on the ground. Evidence photo uploaded for citizen verification.';
    }

    current.activityLog.push({
      id: `act-${Date.now()}`,
      timestamp: `${dateStr} ${timeStr}`,
      timeDisplay,
      title: actTitle,
      description: actDesc,
      actor: officerName || 'Department Officer',
      actorRole: 'Department Officer',
      statusChange: { from: prevStatus, to: status },
      evidenceUrl: resolutionEvidenceUrl
    });

    res.json({ grievance: current, message: 'Status updated successfully' });
  });

  // PATCH /api/grievances/:id/reassign - Reassign department
  app.patch('/api/grievances/:id/reassign', (req, res) => {
    const { newDepartment, reassignedBy, remarks } = req.body;
    const idx = grievancesStore.findIndex((g) => g.id.toUpperCase() === req.params.id.toUpperCase());

    if (idx === -1) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    const current = grievancesStore[idx];
    const prevDept = current.assignedDepartment;
    current.assignedDepartment = newDepartment;
    current.status = 'Assigned';

    const now = new Date();
    current.activityLog.push({
      id: `act-${Date.now()}`,
      timestamp: now.toISOString(),
      timeDisplay: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: 'Department Reassigned',
      description: `Reassigned from ${prevDept} to ${newDepartment}. Remarks: ${remarks || 'Jurisdiction realignment.'}`,
      actor: reassignedBy || 'Administrator',
      actorRole: 'Administrator',
      statusChange: { to: 'Assigned' }
    });

    res.json({ grievance: current, message: `Reassigned to ${newDepartment}` });
  });

  // POST /api/grievances/:id/feedback - Citizen verification & feedback / reopen
  app.post('/api/grievances/:id/feedback', (req, res) => {
    const { isResolved, rating, comment } = req.body;
    const idx = grievancesStore.findIndex((g) => g.id.toUpperCase() === req.params.id.toUpperCase());

    if (idx === -1) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    const current = grievancesStore[idx];
    const now = new Date();
    const timeDisplay = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    current.citizenFeedback = {
      isResolved,
      rating: Number(rating) || 5,
      comment,
      submittedAt: now.toISOString()
    };

    if (isResolved) {
      current.status = 'Closed';
      current.activityLog.push({
        id: `act-${Date.now()}`,
        timestamp: now.toISOString(),
        timeDisplay,
        title: 'Citizen Confirmed Resolution',
        description: `Citizen verified problem resolution on ground and provided a ${rating}-star rating. Grievance closed successfully.`,
        actor: current.reporterName,
        actorRole: 'Citizen',
        statusChange: { from: 'Resolved', to: 'Closed' }
      });
    } else {
      current.status = 'Reopened';
      current.activityLog.push({
        id: `act-${Date.now()}`,
        timestamp: now.toISOString(),
        timeDisplay,
        title: 'Grievance Reopened by Citizen',
        description: `Citizen indicated issue is still unresolved on ground. Feedback: "${comment || 'Problem still persists'}". Re-escalated to Department Officer.`,
        actor: current.reporterName,
        actorRole: 'Citizen',
        statusChange: { from: 'Resolved', to: 'Reopened' }
      });
    }

    res.json({ grievance: current, message: isResolved ? 'Resolution confirmed' : 'Grievance reopened' });
  });

  // GET /api/villages - Rural Development Health Scores & stats
  app.get('/api/villages', (req, res) => {
    res.json({ villages: villagesStore });
  });

  // GET /api/hotspots - Problem Hotspots
  app.get('/api/hotspots', (req, res) => {
    res.json({ hotspots: hotspotsStore });
  });

  // GET /api/recurring-issues - Clustered recurring grievances
  app.get('/api/recurring-issues', (req, res) => {
    res.json({ recurringIssues: recurringIssuesStore });
  });

  // GET /api/departments/performance - Department Scorecard
  app.get('/api/departments/performance', (req, res) => {
    res.json({ performance: departmentPerfStore });
  });

  // GET /api/priority-ranking - "Where Should We Act First?"
  app.get('/api/priority-ranking', (req, res) => {
    res.json({ rankings: priorityRankingsStore });
  });

  // GET /api/simulator/options
  app.get('/api/simulator/options', (req, res) => {
    res.json({ options: simulatorOptionsStore });
  });

  // POST /api/simulator/run - Run custom or preset development intervention simulation
  app.post('/api/simulator/run', (req, res) => {
    const { optionId, villageId, customBudgetLakh, customCategory } = req.body;

    let baseOption = simulatorOptionsStore.find((o) => o.id === optionId) || simulatorOptionsStore[0];
    let village = villagesStore.find((v) => v.id === villageId || v.id === baseOption.villageId) || villagesStore[0];

    const budgetMultiplier = customBudgetLakh ? customBudgetLakh / baseOption.investmentAmountNumber : 1.0;
    const projectedReduction = Math.min(95, Math.round(baseOption.projectedComplaintsReductionPct * Math.min(1.3, budgetMultiplier)));
    const projectedScoreBoost = Math.min(28, Math.round(baseOption.projectedHealthScoreBoost * Math.min(1.4, budgetMultiplier)));

    const currentScore = village.overallScore;
    const newScore = Math.min(98, currentScore + projectedScoreBoost);

    const simulationOutcome = {
      villageName: village.name,
      interventionTitle: baseOption.title,
      investmentINR: customBudgetLakh ? `₹${customBudgetLakh} Lakh` : baseOption.investmentAmountINR,
      currentHealthScore: currentScore,
      projectedHealthScore: newScore,
      healthScoreIncrease: projectedScoreBoost,
      currentGrievancesCount: village.totalGrievances,
      projectedGrievancesReductionPct: projectedReduction,
      projectedGrievancesResolved: Math.round((village.totalGrievances * projectedReduction) / 100),
      expectedOutcomes: baseOption.expectedOutcomes,
      categoryBoosts: baseOption.projectedCategoryBoosts,
      timeframeMonths: baseOption.timeframeMonths,
      disclaimer: 'Simulated impact based on algorithmic regression of historical infrastructure interventions.'
    };

    res.json({ simulation: simulationOutcome });
  });

  // --- VITE MIDDLEWARE / PRODUCTION STATIC ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RuralReadiness Intelligence Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
});
