export type IncidentCategory =
  | 'flood'
  | 'wildfire'
  | 'cyclone'
  | 'earthquake'
  | 'landslide'
  | 'severe_storm'
  | 'industrial'
  | 'infrastructure';

export type IncidentSeverity = 'critical' | 'high' | 'moderate' | 'low';

export type IncidentStatus =
  | 'reported'
  | 'investigating'
  | 'responder_assigned'
  | 'in_progress'
  | 'contained'
  | 'resolved';

export type VerificationSource =
  | 'citizen_report'
  | 'satellite_verified'
  | 'first_responder'
  | 'iot_sensor'
  | 'drone_surveillance';

export interface PriorityBreakdown {
  severityScore: number;       // 0-30
  exposureScore: number;       // 0-25
  vulnerabilityScore: number;  // 0-15
  infrastructureScore: number; // 0-15
  accessConstraintsScore: number; // 0-10
  freshnessScore: number;      // 0-5
}

export interface AIAnalysis {
  summary: string;
  hazardClassification: string;
  keyThreats: string[];
  uncertainties: string[];
  recommendedNextActions: string[];
  resourceNeeds: string[];
  confidenceScore: number; // 0-100
  evaluatedAt: string;
  proposedAlert?: {
    title: string;
    threatDescription: string;
    safetyPrecautions: string[];
    nextSteps?: string;
  };
}

export interface Incident {
  id: string;
  title: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  reportedAt: string;
  reportedBy: string;
  description: string;
  imageUrl?: string;
  verified: boolean;
  verificationSource: VerificationSource;
  priorityScore: number; // 0-100
  priorityBreakdown: PriorityBreakdown;
  aiAnalysis: AIAnalysis;
  assignedTeams?: string[];
  infrastructureImpact?: string[];
  evacuationRadiusKm?: number;
  isSample?: boolean;
}

export type AlertCategory =
  | 'critical_emergency'
  | 'high_priority'
  | 'hazard_warning'
  | 'infrastructure_disruption'
  | 'community_safety'
  | 'system_notification';

export type AlertVerificationStatus =
  | 'unverified_ai_draft'
  | 'under_review'
  | 'confirmed_official'
  | 'broadcasted'
  | 'rejected';

export type AlertResponseStatus =
  | 'pending_review'
  | 'acknowledged'
  | 'dispatched'
  | 'resolved';

export interface AlertLocalizedContent {
  title: string;
  content: string;
  precautions: string;
}

export interface EmergencyAlert {
  id: string;
  incidentId?: string;
  title: string;
  severity: IncidentSeverity;
  category: AlertCategory;
  hazardType: string;
  affectedArea: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  observationTime: string;
  threatDescription: string;
  safetyPrecautions: string[];
  source: string;
  verificationStatus: AlertVerificationStatus;
  confidence: number;
  nextSteps: string;
  responseStatus: AlertResponseStatus;
  createdAt: string;
  acknowledgedBy?: string;
  languages: {
    en: AlertLocalizedContent;
    hi?: AlertLocalizedContent;
    ta?: AlertLocalizedContent;
  };
  active: boolean;
  isSample?: boolean;
}

export interface NotificationItem {
  id: string;
  alertId?: string;
  incidentId?: string;
  title: string;
  message: string;
  severity: IncidentSeverity | 'system';
  category: string;
  timestamp: string;
  read: boolean;
  acknowledged: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ShelterOrHospital {
  id: string;
  name: string;
  type: 'hospital' | 'shelter' | 'school' | 'relief_hub' | 'fire_station';
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  capacity: number;
  occupied: number;
  status: 'operational' | 'near_capacity' | 'full' | 'evacuating';
  contact: string;
  distanceKm?: number;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  targetId: string;
}

export interface AppSettings {
  severityThreshold: number;
  autoDraftAlerts: boolean;
  triggerCategories: IncidentCategory[];
  soundAlerts: boolean;
  browserNotifications: boolean;
  activeLanguage: 'en' | 'hi' | 'ta';
  requireDualVerification: boolean;
  simulationEnabled: boolean;
  responderRole: 'Incident Commander' | 'Tactical Responder' | 'Field Medic';
}
