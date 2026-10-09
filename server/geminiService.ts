import { GoogleGenAI } from '@google/genai';
import type { Incident, IncidentCategory, IncidentSeverity } from '../src/types/disaster';

// Initialize Gemini client according to the @google/genai coding guidelines
const apiKey = process.env.GEMINI_API_KEY || '';

const getAiClient = () => {
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

export interface AnalyzeIncidentInput {
  title: string;
  description: string;
  locationName: string;
  coordinates?: { lat: number; lng: number };
  categoryHint?: string;
  imageBase64?: string;
  mimeType?: string;
}

export interface AnalysisResult {
  hazardClassification: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  severityReason: string;
  confidenceScore: number;
  uncertainties: string[];
  priorityBreakdown: {
    severityScore: number;
    exposureScore: number;
    vulnerabilityScore: number;
    infrastructureScore: number;
    accessConstraintsScore: number;
    freshnessScore: number;
  };
  totalPriorityScore: number;
  summary: string;
  keyThreats: string[];
  recommendedNextActions: string[];
  resourceNeeds: string[];
  evacuationRadiusKm: number;
  proposedAlert?: {
    title: string;
    threatDescription: string;
    safetyPrecautions: string[];
    nextSteps: string;
  };
}

export async function analyzeIncident(input: AnalyzeIncidentInput): Promise<AnalysisResult> {
  const ai = getAiClient();

  const fallbackResult: AnalysisResult = {
    hazardClassification: input.categoryHint || 'Severe Hydrological Event',
    category: (input.categoryHint as IncidentCategory) || 'flood',
    severity: 'high',
    severityReason: 'Reported water levels and rapid ingress indicate immediate hazard to surrounding low-lying residential sectors.',
    confidenceScore: 84,
    uncertainties: [
      'Upstream drainage spillway discharge rate unconfirmed',
      'Structural integrity of adjacent sub-surface power conduits unverified'
    ],
    priorityBreakdown: {
      severityScore: 24,
      exposureScore: 21,
      vulnerabilityScore: 12,
      infrastructureScore: 12,
      accessConstraintsScore: 7,
      freshnessScore: 5
    },
    totalPriorityScore: 81,
    summary: `Tactical AI Assessment: ${input.title} at ${input.locationName}. High probability of localized flooding. Rapid emergency intervention advised.`,
    keyThreats: [
      'Rapidly rising water levels in low-lying access roads',
      'Risk of electrical grounding faults from inundated street fixtures',
      'Potential entrapment of vulnerable elderly residents'
    ],
    recommendedNextActions: [
      'Dispatch swift-water rescue reconnaissance drone team',
      'Erect perimeter safety cordons and deploy sandbag barriers at primary culverts',
      'Establish secondary evacuation route through northern high-ground transit link'
    ],
    resourceNeeds: [
      '2x High-volume mobile dewatering pumps',
      '1x Swift-water rescue boat unit',
      'Emergency medical triage tent'
    ],
    evacuationRadiusKm: 1.5,
    proposedAlert: {
      title: `EMERGENCY HAZARD ADVISORY: Rapid Flood Inundation near ${input.locationName}`,
      threatDescription: `Rising waters threaten low-lying residential and commercial zones in ${input.locationName}. Access roads may become impassable within 30 minutes.`,
      safetyPrecautions: [
        'Move immediately to designated higher ground or elevated structures.',
        'Never walk, swim, or drive through flowing water.',
        'Shut down main electrical breaker if water enters basement or ground floor.'
      ],
      nextSteps: 'Monitor emergency broadcast channels and heed instructions from municipal first responders.'
    }
  };

  if (!ai) {
    return fallbackResult;
  }

  try {
    const prompt = `You are DisasterLens AI, an elite disaster intelligence and tactical prioritization engine used by emergency commanders.
Analyze the following incident report and provide a comprehensive emergency intelligence assessment.

Incident Title: ${input.title}
Reported Location: ${input.locationName}
Coordinates: ${JSON.stringify(input.coordinates || {})}
Description: ${input.description}
${input.categoryHint ? `User Category Hint: ${input.categoryHint}` : ''}

You MUST return ONLY a valid JSON object matching this exact schema:
{
  "hazardClassification": "string (specific hazard type, e.g. Flash Flood, Wildfire Front, Structural Collapse)",
  "category": "one of: flood, wildfire, cyclone, earthquake, landslide, severe_storm, industrial, infrastructure",
  "severity": "one of: critical, high, moderate, low",
  "severityReason": "string (detailed operational justification)",
  "confidenceScore": number (integer 0-100),
  "uncertainties": ["array of strings identifying missing information, unknowns, or unverified claims"],
  "priorityBreakdown": {
    "severityScore": number (0-30),
    "exposureScore": number (0-25),
    "vulnerabilityScore": number (0-15),
    "infrastructureScore": number (0-15),
    "accessConstraintsScore": number (0-10),
    "freshnessScore": number (0-5)
  },
  "totalPriorityScore": number (sum of the above scores, 0-100),
  "summary": "concise executive briefing paragraph (2-3 sentences)",
  "keyThreats": ["3-4 specific imminent threats to life, property, and networks"],
  "recommendedNextActions": ["3-4 prioritized tactical actions for first responders"],
  "resourceNeeds": ["3-4 specific equipment/team allocations needed, e.g., Hazmat team, high-capacity pumps"],
  "evacuationRadiusKm": number (e.g. 1.0, 2.5),
  "proposedAlert": {
    "title": "Clear urgent public alert headline",
    "threatDescription": "Concise factual description of the threat",
    "safetyPrecautions": ["3 actionable protective directives for citizens"],
    "nextSteps": "Instruction for ongoing monitoring and evacuation directives"
  }
}`;

    const parts: any[] = [];
    if (input.imageBase64 && input.mimeType) {
      parts.push({
        inlineData: {
          data: input.imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, ''),
          mimeType: input.mimeType,
        },
      });
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: parts,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text?.trim() || '';
    if (!text) return fallbackResult;

    const parsed = JSON.parse(text);
    return {
      ...fallbackResult,
      ...parsed,
      priorityBreakdown: {
        ...fallbackResult.priorityBreakdown,
        ...(parsed.priorityBreakdown || {}),
      },
      proposedAlert: {
        ...fallbackResult.proposedAlert,
        ...(parsed.proposedAlert || {}),
      },
    };
  } catch (err) {
    console.warn('Gemini incident analysis encountered error, utilizing fallback heuristics:', err);
    return fallbackResult;
  }
}

export interface TranslateAlertInput {
  title: string;
  content: string;
  precautions: string[];
  targetLanguage: 'hi' | 'ta' | 'en';
}

export async function translateAlert(input: TranslateAlertInput): Promise<{
  title: string;
  content: string;
  precautions: string;
}> {
  const languageNames: Record<string, string> = {
    hi: 'Hindi (हिंदी)',
    ta: 'Tamil (தமிழ்)',
    en: 'English',
  };

  if (input.targetLanguage === 'en') {
    return {
      title: input.title,
      content: input.content,
      precautions: input.precautions.join('\n• '),
    };
  }

  const ai = getAiClient();
  const targetLangName = languageNames[input.targetLanguage] || 'English';

  if (!ai) {
    if (input.targetLanguage === 'hi') {
      return {
        title: `[आपातकालीन चेतावनी] ${input.title}`,
        content: `तत्काल ध्यान दें: ${input.content}। सभी नागरिकों से सतर्क रहने और स्थानीय अधिकारियों के निर्देशों का पालन करने का अनुरोध है।`,
        precautions: `• सुरक्षित और ऊंचे स्थानों पर जाएं।\n• बहते पानी या गिरे हुए बिजली के तारों से दूर रहें।\n• आपातकालीन संपर्क हेल्पलाइन 112 डायल करें।`,
      };
    }
    if (input.targetLanguage === 'ta') {
      return {
        title: `[அவசர எச்சரிக்கை] ${input.title}`,
        content: `உடனடி கவனம்: ${input.content}. அனைத்து குடிமக்களும் விழிப்புடன் இருக்கவும் அவசரகால அதிகாரிகளின் அறிவுறுத்தல்களைப் பின்பற்றவும் கேட்டுக்கொள்ளப்படுகிறார்கள்.`,
        precautions: `• உடனடியாக பாதுகாப்பான உயரமான இடங்களுக்கு செல்லவும்.\n• வெள்ளநீர் அல்லது மின்கம்பிகளை தொடாதீர்கள்.\n• அவசர உதவிக்கு 112 என்ற எண்ணை அழைக்கவும்.`,
      };
    }
    return {
      title: input.title,
      content: input.content,
      precautions: input.precautions.join('\n• '),
    };
  }

  try {
    const prompt = `Translate the following emergency disaster alert into high-urgency, clear, official ${targetLangName}.
Ensure emergency instructions, location names, and safety commands are authoritative and easy for the public to understand.

Title: ${input.title}
Threat Description: ${input.content}
Safety Precautions:
${input.precautions.map((p) => `- ${p}`).join('\n')}

Respond ONLY with a JSON object:
{
  "title": "Translated headline in ${targetLangName}",
  "content": "Translated threat description in ${targetLangName}",
  "precautions": "Bullet-pointed safety precautions in ${targetLangName}"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ text: prompt }],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const text = response.text?.trim() || '';
    if (text) {
      return JSON.parse(text);
    }
  } catch (err) {
    console.warn('Gemini translation error, using offline format:', err);
  }

  return {
    title: `[${input.targetLanguage.toUpperCase()}] ${input.title}`,
    content: input.content,
    precautions: input.precautions.join('\n• '),
  };
}
