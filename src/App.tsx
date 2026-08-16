import React, { useState, useEffect } from 'react';
import { UserRole, LanguageCode, Grievance } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { CitizenGrievanceForm } from './components/CitizenGrievanceForm';
import { GrievanceTracker } from './components/GrievanceTracker';
import { CitizenMyGrievances } from './components/CitizenMyGrievances';
import { OfficerDashboard } from './components/OfficerDashboard';
import { DevelopmentDashboard } from './components/DevelopmentDashboard';
import { HotspotMap } from './components/HotspotMap';
import { RecurringIssues } from './components/RecurringIssues';
import { DevelopmentPriorityEngine } from './components/DevelopmentPriorityEngine';
import { DevelopmentSimulator } from './components/DevelopmentSimulator';
import { DepartmentAnalytics } from './components/DepartmentAnalytics';
import { DemoWalkthroughModal } from './components/DemoWalkthroughModal';
import { fetchGrievances } from './services/api';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [userRole, setUserRole] = useState<UserRole>('citizen');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isDemoTourOpen, setIsDemoTourOpen] = useState(false);
  const [trackPrefillId, setTrackPrefillId] = useState<string>('RR-2026-000124');
  const [simVillageId, setSimVillageId] = useState<string>('vil-vikaspur');
  const [pendingCount, setPendingCount] = useState<number>(14);

  // Load count of pending grievances for badge
  useEffect(() => {
    const checkCount = async () => {
      try {
        const data = await fetchGrievances();
        const pending = data.filter((g) => g.status !== 'Resolved' && g.status !== 'Closed').length;
        setPendingCount(pending);
      } catch (err) {
        // ignore
      }
    };
    checkCount();
  }, [currentTab]);

  const handleGrievanceCreated = (newGrievance: Grievance) => {
    setTrackPrefillId(newGrievance.id);
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 font-sans overflow-hidden antialiased selection:bg-emerald-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onNavigate={(tab) => setCurrentTab(tab)}
        userRole={userRole}
        language={language}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          userRole={userRole}
          onRoleChange={(role) => setUserRole(role)}
          language={language}
          onLanguageChange={(lang) => setLanguage(lang)}
          onOpenDemoTour={() => setIsDemoTourOpen(true)}
          onNavigate={(tab) => setCurrentTab(tab)}
          pendingCount={pendingCount}
        />

        {/* Scrollable Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* 1. Landing / Overview */}
            {currentTab === 'home' && (
              <LandingPage
                onNavigate={(tab) => setCurrentTab(tab)}
                onRoleChange={(role) => setUserRole(role)}
                onOpenDemoTour={() => setIsDemoTourOpen(true)}
                language={language}
                onTrackPrefill={(id) => setTrackPrefillId(id)}
              />
            )}

            {/* 2. Citizen: Submit Complaint */}
            {currentTab === 'report' && (
              <CitizenGrievanceForm
                language={language}
                onGrievanceCreated={handleGrievanceCreated}
                onNavigate={(tab) => setCurrentTab(tab)}
              />
            )}

            {/* 3. Citizen / Officer / Public: Track Grievance */}
            {currentTab === 'track' && (
              <GrievanceTracker
                initialGrievanceId={trackPrefillId}
                language={language}
                onNavigate={(tab) => setCurrentTab(tab)}
              />
            )}

            {/* 4. Citizen: My Grievances */}
            {currentTab === 'my-grievances' && (
              <CitizenMyGrievances
                language={language}
                onNavigate={(tab) => setCurrentTab(tab)}
                onTrackPrefill={(id) => setTrackPrefillId(id)}
              />
            )}

            {/* 5. Officer Dashboard */}
            {currentTab === 'officer-dashboard' && (
              <OfficerDashboard
                language={language}
                onNavigate={(tab) => setCurrentTab(tab)}
                onTrackPrefill={(id) => setTrackPrefillId(id)}
              />
            )}

            {/* 6. Admin: RuralReadiness Intelligence Dashboard */}
            {currentTab === 'intelligence' && (
              <DevelopmentDashboard
                language={language}
                onNavigate={(tab) => setCurrentTab(tab)}
                onSelectVillageForSim={(vilId) => setSimVillageId(vilId)}
              />
            )}

            {/* 7. Problem Hotspots */}
            {(currentTab === 'hotspots' || currentTab === 'community') && (
              <HotspotMap
                language={language}
                onNavigate={(tab) => setCurrentTab(tab)}
                onSelectVillageForSim={(vilId) => setSimVillageId(vilId)}
              />
            )}

            {/* 8. Recurring Issues Clusters */}
            {currentTab === 'recurring' && (
              <RecurringIssues
                language={language}
                onNavigate={(tab) => setCurrentTab(tab)}
                onSelectVillageForSim={(vilId) => setSimVillageId(vilId)}
              />
            )}

            {/* 9. Development Priority Engine ("Where to Act First") */}
            {currentTab === 'priority-engine' && (
              <DevelopmentPriorityEngine
                language={language}
                onNavigate={(tab) => setCurrentTab(tab)}
                onSelectVillageForSim={(vilId) => setSimVillageId(vilId)}
              />
            )}

            {/* 10. Development Simulator */}
            {currentTab === 'simulator' && (
              <DevelopmentSimulator
                language={language}
                selectedVillageId={simVillageId}
                onNavigate={(tab) => setCurrentTab(tab)}
              />
            )}

            {/* 11. Department Performance Scorecard */}
            {currentTab === 'dept-performance' && (
              <DepartmentAnalytics language={language} />
            )}

            {/* 12. All Grievances (Officer / Admin table view) */}
            {currentTab === 'all-grievances' && (
              <OfficerDashboard
                language={language}
                onNavigate={(tab) => setCurrentTab(tab)}
                onTrackPrefill={(id) => setTrackPrefillId(id)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Guided 3-Minute Hackathon Demo Tour Modal */}
      <DemoWalkthroughModal
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        onNavigate={(tab) => setCurrentTab(tab)}
        onRoleChange={(role) => setUserRole(role)}
        onTrackPrefill={(id) => setTrackPrefillId(id)}
        onSelectVillageForSim={(vilId) => setSimVillageId(vilId)}
      />
    </div>
  );
}

export default App;
