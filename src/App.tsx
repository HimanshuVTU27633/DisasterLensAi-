import React, { useState, useEffect, useCallback } from 'react';
import {
  Incident,
  EmergencyAlert,
  ShelterOrHospital,
  NotificationItem,
  AuditLogItem,
  AppSettings,
  IncidentStatus,
} from './types/disaster';
import {
  INITIAL_INCIDENTS,
  INITIAL_ALERTS,
  INITIAL_SHELTERS_AND_RESOURCES,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from './data/initialData';
import { TopNav } from './components/navigation/TopNav';
import { Sidebar, NavigationTab } from './components/navigation/Sidebar';
import { KPICards } from './components/dashboard/KPICards';
import { RankedQueue } from './components/dashboard/RankedQueue';
import { IncidentDetailDossier } from './components/dashboard/IncidentDetailDossier';
import { DisasterMap } from './components/map/DisasterMap';
import { RadarSystem } from './components/radar/RadarSystem';
import { AlertCenter } from './components/alerts/AlertCenter';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { ReportIncidentModal } from './components/incidents/ReportIncidentModal';
import { PhoneAlertSenderModal } from './components/alerts/PhoneAlertSenderModal';
import { EmergencySirenModal } from './components/siren/EmergencySirenModal';
import { MobileAppView } from './components/mobile/MobileAppView';
import { ResourceAllocationView } from './components/resources/ResourceAllocationView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';
import { PrioritizationMatrixView } from './components/prioritization/PrioritizationMatrixView';
import { audioManager, sendBrowserNotification } from './utils/soundAndNotifications';
import { AlertTriangle, CheckCircle, Bell, X, Smartphone, Monitor, ShieldAlert } from 'lucide-react';
import { OfflineIndicator } from './components/common/OfflineIndicator';

// Global counters to guarantee unique IDs across rapid sequential synchronous dispatches
let auditLogCounter = 0;
let notificationCounter = 0;
let emergencyAlertCounter = 0;

export default function App() {
  // Google Maps Quota Error State
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

  // Core Data Stores (Focused Exclusively on India)
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(INITIAL_ALERTS);
  const [facilities, setFacilities] = useState<ShelterOrHospital[]>(
    INITIAL_SHELTERS_AND_RESOURCES
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    INITIAL_NOTIFICATIONS
  );
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  // Application Settings
  const [settings, setSettings] = useState<AppSettings>({
    severityThreshold: 75,
    autoDraftAlerts: true,
    triggerCategories: ['flood', 'wildfire', 'cyclone', 'infrastructure', 'landslide'],
    soundAlerts: true,
    browserNotifications: true,
    activeLanguage: 'en',
    requireDualVerification: false,
    simulationEnabled: true,
    responderRole: 'Incident Commander',
  });

  // UI Navigation & View State
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [activeRoute, setActiveRoute] = useState<{
    origin: Incident;
    facility: ShelterOrHospital;
  } | null>(null);

  // Mobile App Mode (auto-detect or toggle)
  const [isMobileMode, setIsMobileMode] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  });

  // Modals & Panels
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);
  const [isPickingLocation, setIsPickingLocation] = useState<boolean>(false);
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Phone SMS & WhatsApp Dispatch Modal
  const [isPhoneSenderOpen, setIsPhoneSenderOpen] = useState<boolean>(false);
  const [phoneAlertTarget, setPhoneAlertTarget] = useState<EmergencyAlert | null>(null);

  // Civil Defense Emergency Siren System Modal & Sounding State
  const [isSirenModalOpen, setIsSirenModalOpen] = useState<boolean>(false);
  const [isSirenActive, setIsSirenActive] = useState<boolean>(audioManager.isSirenActive());

  // Feedback Toasts & Loading
  const [toast, setToast] = useState<{ title: string; message: string; type: 'info' | 'critical' | 'success' } | null>(null);
  const [translatingId, setTranslatingId] = useState<string>('');

  // Listen for Google Maps Quota Event
  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  const showToast = useCallback((title: string, message: string, type: 'info' | 'critical' | 'success' = 'info') => {
    setToast({ title, message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  const addAuditLog = useCallback((action: string, details: string, targetId: string) => {
    const newLog: AuditLogItem = {
      id: `AUDIT-${Date.now()}-${++auditLogCounter}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      actor: settings.responderRole,
      action,
      details,
      targetId,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  }, [settings.responderRole]);

  // Handle Location picked from Map
  const handleLocationPicked = (coords: { lat: number; lng: number }) => {
    setPickedCoords(coords);
    setIsPickingLocation(false);
    setIsReportModalOpen(true);
    showToast('Location Coordinates Locked', `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`, 'success');
  };

  // Submit Incident Flow
  const handleCreateIncident = (newIncident: Incident, proposedAlert?: any) => {
    setIncidents((prev) => [newIncident, ...prev]);
    setSelectedIncident(newIncident);

    // Audio cue
    if (newIncident.severity === 'critical') {
      audioManager.playCriticalAlert();
    } else {
      audioManager.playTelemetryChime();
    }

    // Create Notification with guaranteed unique ID
    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}-${++notificationCounter}-${Math.random().toString(36).slice(2, 6)}`,
      incidentId: newIncident.id,
      title: `NEW INCIDENT: ${newIncident.title}`,
      message: `${newIncident.location.name} - Priority Score ${newIncident.priorityScore}/100`,
      severity: newIncident.severity,
      category: newIncident.category,
      timestamp: new Date().toISOString(),
      read: false,
      acknowledged: false,
      coordinates: newIncident.location,
    };
    setNotifications((prev) => [notif, ...prev]);

    // Send Browser Notification if granted
    sendBrowserNotification(notif.title, { body: notif.message });

    showToast('Incident Ingested & Plotted', `${newIncident.title} (${newIncident.severity.toUpperCase()})`, 'success');
    addAuditLog('INCIDENT_INGESTED', `Incident ${newIncident.title} submitted with score ${newIncident.priorityScore}`, newIncident.id);

    // If proposed alert exists or meets threshold, create draft alert
    if (proposedAlert || newIncident.priorityScore >= settings.severityThreshold) {
      const alertId = `ALT-IND-${Date.now()}-${++emergencyAlertCounter}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newAlert: EmergencyAlert = {
        id: alertId,
        incidentId: newIncident.id,
        title: proposedAlert?.title || `EMERGENCY ALERT: ${newIncident.title}`,
        severity: newIncident.severity,
        category: newIncident.severity === 'critical' ? 'critical_emergency' : 'high_priority',
        hazardType: newIncident.category,
        affectedArea: newIncident.location.name,
        coordinates: newIncident.location,
        observationTime: newIncident.reportedAt,
        threatDescription: proposedAlert?.threatDescription || newIncident.description,
        safetyPrecautions: proposedAlert?.safetyPrecautions || [
          'Evacuate immediately to designated relief shelters',
          'Heed instructions from NDRF and state disaster response forces',
        ],
        source: 'NDMA DisasterLens AI Automated Pipeline',
        verificationStatus: 'unverified_ai_draft',
        confidence: newIncident.aiAnalysis.confidenceScore,
        nextSteps: proposedAlert?.nextSteps || 'Responder columns deployed to sector.',
        responseStatus: 'pending_review',
        createdAt: new Date().toISOString(),
        languages: {
          en: {
            title: proposedAlert?.title || `EMERGENCY ALERT: ${newIncident.title}`,
            content: proposedAlert?.threatDescription || newIncident.description,
            precautions: (proposedAlert?.safetyPrecautions || ['Evacuate to designated safe shelters']).join('\n• '),
          },
        },
        active: true,
        isSample: false,
      };

      setAlerts((prev) => [newAlert, ...prev]);
      addAuditLog('ALERT_DRAFT_CREATED', `Proposed alert drafted for ${newIncident.id}`, alertId);
    }
  };

  // Translate Alert with Gemini via backend
  const handleTranslateAlert = async (alertId: string, lang: 'hi' | 'ta') => {
    const targetAlert = alerts.find((a) => a.id === alertId);
    if (!targetAlert) return;

    setTranslatingId(`${alertId}-${lang}`);

    try {
      const res = await fetch('/api/translate-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: targetAlert.title,
          content: targetAlert.threatDescription,
          precautions: targetAlert.safetyPrecautions,
          targetLanguage: lang,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === alertId
              ? {
                  ...a,
                  languages: {
                    ...a.languages,
                    [lang]: json.data,
                  },
                }
              : a
          )
        );
        showToast('Translation Ready', `Gemini emergency translation for ${lang.toUpperCase()} completed`, 'success');
        addAuditLog('ALERT_TRANSLATED', `Translated ${alertId} to ${lang.toUpperCase()}`, alertId);
      }
    } catch (err) {
      console.warn('Translation failed:', err);
    } finally {
      setTranslatingId('');
    }
  };

  // Approve Broadcast
  const handleApproveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? { ...a, verificationStatus: 'confirmed_official', responseStatus: 'dispatched' }
          : a
      )
    );
    showToast('Alert Broadcast Approved', `Public warning issued for ${alertId}`, 'success');
    addAuditLog('ALERT_APPROVED', `Command approved emergency broadcast for ${alertId}`, alertId);
  };

  // Reject Alert
  const handleRejectAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId ? { ...a, verificationStatus: 'rejected', active: false } : a
      )
    );
    showToast('Alert Draft Rejected', `${alertId} has been archived`, 'info');
    addAuditLog('ALERT_REJECTED', `Alert ${alertId} rejected by command`, alertId);
  };

  // Acknowledge Alert
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId ? { ...a, responseStatus: 'acknowledged' } : a
      )
    );
    showToast('Alert Acknowledged', 'Response teams confirmed receipt', 'info');
    addAuditLog('ALERT_ACKNOWLEDGED', `Response team acknowledged ${alertId}`, alertId);
  };

  // Update Incident Status
  const handleUpdateIncidentStatus = (incidentId: string, status: IncidentStatus) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === incidentId ? { ...i, status } : i))
    );
    if (selectedIncident?.id === incidentId) {
      setSelectedIncident((prev) => (prev ? { ...prev, status } : null));
    }
    showToast('Incident Status Updated', `Status changed to ${status.replace('_', ' ').toUpperCase()}`, 'info');
    addAuditLog('INCIDENT_STATUS_CHANGE', `Changed status to ${status}`, incidentId);
  };

  // Evacuation Corridor Routing
  const handleRouteToFacility = (facility: ShelterOrHospital) => {
    if (!selectedIncident) return;
    setActiveRoute({ origin: selectedIncident, facility });
    setActiveTab('map');
    showToast('Evacuation Route Calculated', `Routing corridor established to ${facility.name}`, 'info');
    addAuditLog('CORRIDOR_CALCULATED', `Route planned from ${selectedIncident.id} to ${facility.name}`, selectedIncident.id);
  };

  // Propose Alert From Dossier
  const handleProposeAlertFromIncident = (incident: Incident) => {
    const newAlert: EmergencyAlert = {
      id: `ALT-IND-${Date.now()}-${++emergencyAlertCounter}-${Math.floor(1000 + Math.random() * 9000)}`,
      incidentId: incident.id,
      title: incident.aiAnalysis.proposedAlert?.title || `CRITICAL WARNING: ${incident.title}`,
      severity: incident.severity,
      category: incident.severity === 'critical' ? 'critical_emergency' : 'high_priority',
      hazardType: incident.category,
      affectedArea: incident.location.name,
      coordinates: incident.location,
      observationTime: incident.reportedAt,
      threatDescription: incident.aiAnalysis.proposedAlert?.threatDescription || incident.description,
      safetyPrecautions: incident.aiAnalysis.proposedAlert?.safetyPrecautions || [
        'Evacuate low-lying riverbanks immediately',
        'Avoid swollen streams and loose soil embankments',
      ],
      source: 'Incident Commander Dossier',
      verificationStatus: 'under_review',
      confidence: incident.aiAnalysis.confidenceScore,
      nextSteps: 'Responders deployed. Seek designated concrete shelter.',
      responseStatus: 'pending_review',
      createdAt: new Date().toISOString(),
      languages: {
        en: {
          title: incident.aiAnalysis.proposedAlert?.title || `CRITICAL WARNING: ${incident.title}`,
          content: incident.aiAnalysis.proposedAlert?.threatDescription || incident.description,
          precautions: (incident.aiAnalysis.proposedAlert?.safetyPrecautions || ['Follow responder directions']).join('\n• '),
        },
      },
      active: true,
      isSample: false,
    };

    setAlerts((prev) => [newAlert, ...prev]);
    setActiveTab('alerts');
    showToast('Alert Draft Generated', 'Review and broadcast in Emergency Alert Center', 'success');
    addAuditLog('ALERT_DRAFT_FROM_DOSSIER', `Commander generated alert for ${incident.id}`, newAlert.id);
  };

  // Trigger Phone SMS / WhatsApp Modal
  const handleOpenPhoneSender = (alert: EmergencyAlert) => {
    setPhoneAlertTarget(alert);
    setIsPhoneSenderOpen(true);
  };

  // Civil Defense Emergency Siren State Handler
  const handleSirenToggled = (isActive: boolean, sirenType: string, sector: string) => {
    setIsSirenActive(isActive);
    if (isActive) {
      addAuditLog('EMERGENCY_SIREN_ACTIVATED', `${sirenType.toUpperCase()} acoustic alarm sounded for ${sector}`, 'SIREN-NET');
      showToast('EMERGENCY SIREN ACTIVE', `Civil Defense evacuation alarm sounding for ${sector}`, 'critical');
    } else {
      addAuditLog('EMERGENCY_SIREN_SILENCED', `Acoustic siren silenced for ${sector}`, 'SIREN-NET');
      showToast('Siren Silenced', `Normal operations resumed for ${sector}`, 'info');
    }
  };

  // Demo Simulation Trigger (India Scenario)
  const handleTriggerDemoSimulation = () => {
    const demoIncident: Incident = {
      id: `IND-DIS-${Math.floor(100 + Math.random() * 900)}`,
      title: 'Cloudburst & Flash Surge in Alaknanda Catchment',
      category: 'flood',
      severity: 'critical',
      status: 'reported',
      location: {
        name: 'Rudraprayag Sangam & Koteshwar, Uttarakhand',
        lat: 30.2858,
        lng: 78.9811,
      },
      reportedAt: new Date().toISOString(),
      reportedBy: 'Central Water Commission (CWC) Telemetric River Gauge',
      description: 'Localized 120mm/hr cloudburst triggered sudden 3.8m surge in Alaknanda River. Riverbank market shops inundated.',
      imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
      verified: true,
      verificationSource: 'iot_sensor',
      priorityScore: 94,
      priorityBreakdown: {
        severityScore: 29,
        exposureScore: 24,
        vulnerabilityScore: 14,
        infrastructureScore: 14,
        accessConstraintsScore: 8,
        freshnessScore: 5,
      },
      aiAnalysis: {
        summary: 'Sudden flash surge down steep river channel threatening Rudraprayag ghats. Downstream hydroelectric dam floodgates opening required.',
        hazardClassification: 'High-Altitude Cloudburst Spate & River Surge',
        keyThreats: ['Downstream pilgrim ghat inundation', 'Rishikesh-Badrinath highway blockage'],
        uncertainties: ['Secondary cloudburst cells on Mandakini ridge'],
        recommendedNextActions: ['Sound downstream siren network', 'Evacuate riverbank settlements'],
        resourceNeeds: ['SDRF mountain rescue team', 'Inflatable rescue boats'],
        confidenceScore: 96,
        evaluatedAt: new Date().toISOString(),
      },
      evacuationRadiusKm: 2.0,
      isSample: true,
    };

    handleCreateIncident(demoIncident, {
      title: 'FLASH FLOOD EMERGENCY: Alaknanda River Surge at Rudraprayag',
      threatDescription: 'Sudden cloudburst surge in Alaknanda river. Immediate evacuation of riverbank ghats.',
      safetyPrecautions: ['Evacuate riverbanks immediately', 'Move uphill to Badrinath bypass road'],
    });
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;
  const criticalCount = incidents.filter((i) => i.severity === 'critical').length;
  const activeAlertCount = alerts.filter((a) => a.active).length;

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Google Maps Quota Warning Banner (Skill Requirement) */}
      {quotaExceeded && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-200 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm backdrop-blur-md">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-100 hover:text-amber-300"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Top Tactical Navigation */}
      <TopNav
        unreadCount={unreadNotificationCount}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        settings={settings}
        onUpdateSettings={(up) => setSettings((s) => ({ ...s, ...up }))}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onSearchSelectIncident={(inc) => {
          setSelectedIncident(inc);
          setActiveTab('overview');
        }}
        incidents={incidents}
        isMobileMode={isMobileMode}
        onToggleMobileMode={() => setIsMobileMode(!isMobileMode)}
        isSirenActive={isSirenActive}
        onOpenSirenModal={() => setIsSirenModalOpen(true)}
      />

      {/* Persistent Emergency Siren Strobe Warning Banner when active */}
      {isSirenActive && (
        <div className="bg-red-600/95 border-b-2 border-red-300 text-white px-4 py-2 text-xs md:text-sm font-heading font-bold text-center sticky top-16 z-40 shadow-[0_0_30px_#ef4444] backdrop-blur-md flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2 mx-auto">
            <ShieldAlert className="w-5 h-5 animate-bounce" />
            <span>CIVIL DEFENSE EMERGENCY SIREN ACTIVE — ACOUSTIC EVACUATION WARNING BROADCASTING</span>
          </div>
          <button
            onClick={() => {
              audioManager.stopSiren();
              setIsSirenActive(false);
            }}
            className="px-3 py-1 rounded bg-black/70 hover:bg-black text-white font-mono text-xs border border-white/50 ml-2"
          >
            Silence Siren
          </button>
        </div>
      )}

      {/* CONDITIONAL RENDERING: MOBILE APP VIEW vs COMMAND CENTER VIEW */}
      {isMobileMode ? (
        /* DEDICATED SMARTPHONE / PWA FIELD RESPONDER APP VIEW */
        <div className="flex-1 flex justify-center bg-[#040710] w-full min-h-0">
          <div className="w-full max-w-lg h-full flex flex-col border-x-0 md:border-x border-cyan-500/20 shadow-2xl">
            <MobileAppView
              incidents={incidents}
              alerts={alerts}
              facilities={facilities}
              selectedIncident={selectedIncident}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onOpenPhoneSender={handleOpenPhoneSender}
              activeRoute={activeRoute}
              onClearRoute={() => setActiveRoute(null)}
              onOpenSirenModal={() => setIsSirenModalOpen(true)}
              isSirenActive={isSirenActive}
            />
          </div>
        </div>
      ) : (
        /* DESKTOP COMMAND CENTER DASHBOARD VIEW */
        <div className="flex-1 flex min-h-0">
          {/* Responsive Collapsible Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              if (tab === 'report') {
                setIsReportModalOpen(true);
              } else {
                setActiveTab(tab);
              }
            }}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            alertCount={activeAlertCount}
            criticalIncidentCount={criticalCount}
          />

          {/* Primary Viewport Area */}
          <main className="flex-1 p-2 sm:p-4 lg:p-5 overflow-y-auto space-y-3 sm:space-y-4">
            {/* TAB 1: OVERVIEW DASHBOARD */}
            {activeTab === 'overview' && (
              <div className="space-y-3 sm:space-y-4">
                {/* Premium KPI Cards */}
                <KPICards
                  totalIncidents={incidents.length}
                  criticalIncidents={criticalCount}
                  activeAlerts={activeAlertCount}
                  deployedUnits={24}
                  populationAtRisk={285000}
                  onFilterCritical={() => {
                    const firstCrit = incidents.find((i) => i.severity === 'critical');
                    if (firstCrit) setSelectedIncident(firstCrit);
                  }}
                  onFilterAlerts={() => setActiveTab('alerts')}
                />

                {/* Main Command Workspace: Responsive Google Map + Ranked Queue */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                  {/* Interactive Google Map */}
                  <div className="lg:col-span-2 h-[380px] sm:h-[480px] lg:h-[580px]">
                    <DisasterMap
                      incidents={incidents}
                      selectedIncident={selectedIncident}
                      onSelectIncident={(inc) => setSelectedIncident(inc)}
                      facilities={facilities}
                      activeRoute={activeRoute}
                      onClearRoute={() => setActiveRoute(null)}
                      isPickingLocation={isPickingLocation}
                      onLocationPicked={handleLocationPicked}
                    />
                  </div>

                  {/* Ranked Emergency Queue */}
                  <div className="h-[420px] sm:h-[480px] lg:h-[580px]">
                    <RankedQueue
                      incidents={incidents}
                      selectedIncident={selectedIncident}
                      onSelectIncident={(inc) => setSelectedIncident(inc)}
                      onQuickRouteToNearest={(inc) => {
                        setSelectedIncident(inc);
                        handleRouteToFacility(facilities[0]);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LIVE DISASTER MAP (FULL-VIEW) */}
            {activeTab === 'map' && (
              <div className="h-[calc(100vh-8rem)] w-full">
                <DisasterMap
                  incidents={incidents}
                  selectedIncident={selectedIncident}
                  onSelectIncident={(inc) => setSelectedIncident(inc)}
                  facilities={facilities}
                  activeRoute={activeRoute}
                  onClearRoute={() => setActiveRoute(null)}
                  isPickingLocation={isPickingLocation}
                  onLocationPicked={handleLocationPicked}
                />
              </div>
            )}

            {/* TAB: DOPPLER RADAR SWEEP SYSTEM */}
            {activeTab === 'radar' && (
              <RadarSystem
                incidents={incidents}
                onSelectIncident={(inc) => {
                  setSelectedIncident(inc);
                }}
              />
            )}

            {/* TAB 3: AI RISK ANALYSIS */}
            {activeTab === 'ai-risk' && (
              <PrioritizationMatrixView
                incidents={incidents}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
              />
            )}

            {/* TAB 4: EMERGENCY ALERT CENTER */}
            {activeTab === 'alerts' && (
              <AlertCenter
                alerts={alerts}
                onApproveAlert={handleApproveAlert}
                onRejectAlert={handleRejectAlert}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onViewOnMap={(coords) => {
                  setActiveTab('map');
                  const matched = incidents.find(
                    (i) => Math.abs(i.location.lat - coords.lat) < 0.05
                  );
                  if (matched) setSelectedIncident(matched);
                }}
                onTranslateAlert={handleTranslateAlert}
                translatingId={translatingId}
                onOpenPhoneSender={handleOpenPhoneSender}
              />
            )}

            {/* TAB 5: RESPONSE PRIORITIZATION MATRIX */}
            {activeTab === 'prioritization' && (
              <PrioritizationMatrixView
                incidents={incidents}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
              />
            )}

            {/* TAB 6: RESOURCE ALLOCATION */}
            {activeTab === 'resources' && (
              <ResourceAllocationView
                facilities={facilities}
                incidents={incidents}
                onRouteFacilityToIncident={(fac, inc) => {
                  setSelectedIncident(inc);
                  handleRouteToFacility(fac);
                }}
              />
            )}

            {/* TAB 7: ANALYTICS AND REPORTS */}
            {activeTab === 'analytics' && (
              <AnalyticsView
                incidents={incidents}
                facilities={facilities}
              />
            )}

            {/* TAB 8: SETTINGS & AUDIT LOG */}
            {activeTab === 'settings' && (
              <SettingsView
                settings={settings}
                onUpdateSettings={(up) => setSettings((s) => ({ ...s, ...up }))}
                auditLogs={auditLogs}
                onTriggerDemoAlert={handleTriggerDemoSimulation}
              />
            )}
          </main>
        </div>
      )}

      {/* Expandable Incident Detail Dossier Panel */}
      {selectedIncident && (
        <IncidentDetailDossier
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          facilities={facilities}
          onRouteToFacility={handleRouteToFacility}
          onUpdateStatus={handleUpdateIncidentStatus}
          onProposeAlertFromIncident={handleProposeAlertFromIncident}
        />
      )}

      {/* Slide-Out Notification Center Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkRead={(id) =>
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
          )
        }
        onMarkAllRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
        onSelectIncidentById={(incId) => {
          const match = incidents.find((i) => i.id === incId);
          if (match) {
            setSelectedIncident(match);
            setActiveTab('overview');
          }
        }}
        onViewOnMap={(coords) => {
          setActiveTab('map');
          const match = incidents.find(
            (i) => Math.abs(i.location.lat - coords.lat) < 0.05
          );
          if (match) setSelectedIncident(match);
        }}
      />

      {/* Modal: Report Incident with Multimodal Gemini */}
      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitIncident={handleCreateIncident}
        onStartPickOnMap={() => {
          setIsPickingLocation(true);
          setActiveTab('map');
          showToast('Tactical Coordinate Mode', 'Click any point on the Google Map to lock location coordinates', 'info');
        }}
        pickedCoords={pickedCoords}
      />

      {/* Modal: Send Emergency Alert to Phone (SMS & WhatsApp) */}
      <PhoneAlertSenderModal
        isOpen={isPhoneSenderOpen}
        onClose={() => {
          setIsPhoneSenderOpen(false);
          setPhoneAlertTarget(null);
        }}
        alert={phoneAlertTarget}
        onDispatchRecorded={(logDetails) => {
          addAuditLog('PHONE_ALERT_DISPATCH', logDetails, phoneAlertTarget?.id || 'ALERT');
          showToast('Phone Alert Dispatched', logDetails, 'success');
        }}
      />

      {/* Modal: Civil Defense Emergency Siren Command & PA Voice Announcer */}
      <EmergencySirenModal
        isOpen={isSirenModalOpen}
        onClose={() => setIsSirenModalOpen(false)}
        onSirenToggled={handleSirenToggled}
      />

      {/* Non-Intrusive Floating Toast Notifications */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-start gap-3 p-3.5 rounded-xl hud-panel border-cyan-400/50 shadow-2xl max-w-sm animate-in slide-in-from-bottom duration-200">
          {toast.type === 'critical' ? (
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
          ) : toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <Bell className="w-5 h-5 text-cyan-400 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-100">{toast.title}</h4>
            <p className="text-[11px] text-slate-300 leading-tight mt-0.5">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {/* Offline Protocol Status Banner */}
      <OfflineIndicator />
    </div>
  );
}
