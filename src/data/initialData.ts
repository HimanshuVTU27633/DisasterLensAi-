import { Incident, EmergencyAlert, ShelterOrHospital, NotificationItem, AuditLogItem } from '../types/disaster';

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'IND-DIS-01',
    title: 'Severe Hillside Debris Flow & Landslide Inundation',
    category: 'landslide',
    severity: 'critical',
    status: 'in_progress',
    location: {
      name: 'Chooralmala & Meppadi Hill Tracts, Wayanad, Kerala',
      lat: 11.5583,
      lng: 76.1558,
    },
    reportedAt: '2026-10-09T05:30:00Z',
    reportedBy: 'Kerala SDMA & NDRF 4th Battalion Command',
    description: 'Catastrophic debris avalanche triggered by 380mm cloudburst. Iruvanipuzha river washed away bridge connection; 400+ residents cut off in tea estate sectors.',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    verified: true,
    verificationSource: 'drone_surveillance',
    priorityScore: 96,
    priorityBreakdown: {
      severityScore: 30,
      exposureScore: 24,
      vulnerabilityScore: 14,
      infrastructureScore: 14,
      accessConstraintsScore: 9,
      freshnessScore: 5,
    },
    aiAnalysis: {
      summary: 'Extreme mass wasting event with active mudflow torrent. Sole access Bailey bridge washed away; immediate aerial evacuation and temporary ropeway bridge deployment required.',
      hazardClassification: 'Complex Catastrophic Earthflow & Rock Avalanche',
      keyThreats: [
        'Secondary landslide triggered by saturated upper bluff slopes',
        'Impassable river preventing ambulance transit to Kozhikode medical centers',
        'Severed electricity grid and mobile communication towers across Meppadi'
      ],
      uncertainties: [
        'Exact headcount of migrant estate workers sheltered in upper quarters',
        'Structural stability of surviving tea factory ground foundation'
      ],
      recommendedNextActions: [
        'Deploy Indian Army Madras Sappers for Bailey Bridge reconstruction',
        'Execute IAF Mi-17 aerial rescue winch operations for stranded families',
        'Establish mobile medical triage camp on Chooralmala south clearing'
      ],
      resourceNeeds: [
        '2x NDRF Canine Search & Rescue Teams',
        'IAF Medium Lift Helicopter Unit',
        'Modular Bailey Bridge Kit (120 ft)'
      ],
      confidenceScore: 97,
      evaluatedAt: '2026-10-09T05:34:00Z',
    },
    assignedTeams: ['NDRF 4th Battalion', 'Indian Army Sappers', 'Kerala Fire Force Task Force'],
    infrastructureImpact: ['Chooralmala-Meppadi Main Bridge Collapsed', 'HT Power Line Down'],
    evacuationRadiusKm: 2.5,
    isSample: true,
  },
  {
    id: 'IND-DIS-02',
    title: 'Mithi River Severe Inundation & Rail Arterial Flooding',
    category: 'flood',
    severity: 'critical',
    status: 'in_progress',
    location: {
      name: 'Kurla-Sion Junction & Mithi Basin, Mumbai, Maharashtra',
      lat: 19.0657,
      lng: 72.8794,
    },
    reportedAt: '2026-10-09T05:15:00Z',
    reportedBy: 'BMC Central Disaster Operations Control',
    description: 'High tide of 4.6m combined with 160mm/3hr monsoon downpour caused Mithi River overflow. Central and Harbour rail lines submerged under 1.2m water.',
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    verified: true,
    verificationSource: 'iot_sensor',
    priorityScore: 93,
    priorityBreakdown: {
      severityScore: 28,
      exposureScore: 25,
      vulnerabilityScore: 13,
      infrastructureScore: 14,
      accessConstraintsScore: 8,
      freshnessScore: 5,
    },
    aiAnalysis: {
      summary: 'Critical urban hydrological choke point inundation. Suburban rail arterial immobilized with thousands of commuters stalled at station platforms.',
      hazardClassification: 'Urban River Spate & Tidal Surge Backflow (Grade 5)',
      keyThreats: [
        'Drowning and electrocution hazards along submerged railway tracks',
        'Gridlock halting emergency ambulance access to Sion Hospital',
        'Open storm-drain suction hazards near transit intersections'
      ],
      uncertainties: [
        'Time required to open floodgates at Mahim causeway',
        'Estimated runoff discharge rate during impending low-tide window'
      ],
      recommendedNextActions: [
        'Deploy 8x high-capacity dewatering pump units at Kurla car shed',
        'Halt suburban rail traffic and activate BEST emergency bus feeder lines',
        'Erect safety cordons around submerged electrical junction boxes'
      ],
      resourceNeeds: [
        '8x Heavy Mobile Dewatering Pumps (5000 GPM)',
        '4x Inflatable Rescue Boats for low-lying shanties',
        'Mumbai Traffic Police diversion units'
      ],
      confidenceScore: 94,
      evaluatedAt: '2026-10-09T05:20:00Z',
    },
    assignedTeams: ['BMC Disaster Management Unit', 'NDRF Mumbai Task Force', 'Western Naval Command Diver Unit'],
    infrastructureImpact: ['Central & Harbour Rail Lines Suspended', 'LBS Marg Arterial Flooded'],
    evacuationRadiusKm: 1.8,
    isSample: true,
  },
  {
    id: 'IND-DIS-03',
    title: 'Very Severe Cyclonic Storm Surge & Coastal Inundation',
    category: 'cyclone',
    severity: 'high',
    status: 'responder_assigned',
    location: {
      name: 'Paradip Port & Coastal Belt, Jagatsinghpur, Odisha',
      lat: 20.2644,
      lng: 86.6713,
    },
    reportedAt: '2026-10-09T04:45:00Z',
    reportedBy: 'India Meteorological Department (IMD) Cyclone Warning Centre',
    description: 'Cyclone landfall tracking with sustained winds of 145 km/h and 3.5m tidal surge. Coastal sea dykes breached in 3 village sectors.',
    imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80',
    verified: true,
    verificationSource: 'satellite_verified',
    priorityScore: 88,
    priorityBreakdown: {
      severityScore: 26,
      exposureScore: 22,
      vulnerabilityScore: 13,
      infrastructureScore: 14,
      accessConstraintsScore: 8,
      freshnessScore: 5,
    },
    aiAnalysis: {
      summary: 'Dangerous cyclonic storm surge affecting coastal fishing hamlets and port infrastructure. Saltwater ingress threatens drinking water reservoirs.',
      hazardClassification: 'Tropical Cyclone Storm Surge & Gale Boundary (Cat 3)',
      keyThreats: [
        'Direct tidal wave ingress into low-elevation thatched settlements',
        'Port cargo crane instability and drifting coastal trawlers',
        'Widespread power transmission tower collapses'
      ],
      uncertainties: [
        'Precise landfall eye coordinates over next 90 minutes',
        'Integrity of earthen saline embankments at Nuagarh'
      ],
      recommendedNextActions: [
        'Complete mandatory evacuation of residents within 5km of coastline to Cyclone Shelters',
        'De-energize coastal power feeders to prevent electrical fires',
        'Pre-position ODRAF boats and chainsaw clearance units'
      ],
      resourceNeeds: [
        '10x ODRAF Coastal Rescue Teams',
        '50x Multipurpose Cyclone Shelters Operating',
        '20x Satellite Wireless Transceivers'
      ],
      confidenceScore: 95,
      evaluatedAt: '2026-10-09T04:50:00Z',
    },
    assignedTeams: ['ODRAF Team 3', 'NDRF 3rd Bn', 'Indian Coast Guard Ship C-425'],
    infrastructureImpact: ['Paradip Coastal Highway Damaged', 'Port Operations Suspended'],
    evacuationRadiusKm: 5.0,
    isSample: true,
  },
  {
    id: 'IND-DIS-04',
    title: 'Brahmaputra Flood Embankment Breach & Kaziranga Spate',
    category: 'flood',
    severity: 'high',
    status: 'in_progress',
    location: {
      name: 'Kaziranga National Park & Kaliabor, Nagaon, Assam',
      lat: 26.5775,
      lng: 93.1711,
    },
    reportedAt: '2026-10-09T04:10:00Z',
    reportedBy: 'Assam State Disaster Management Authority (ASDMA)',
    description: 'Brahmaputra flowing 1.8m above danger mark. River embankment breached at Hatimura, flooding 42 villages and National Highway 715 animal corridors.',
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    verified: true,
    verificationSource: 'satellite_verified',
    priorityScore: 82,
    priorityBreakdown: {
      severityScore: 24,
      exposureScore: 20,
      vulnerabilityScore: 12,
      infrastructureScore: 13,
      accessConstraintsScore: 8,
      freshnessScore: 5,
    },
    aiAnalysis: {
      summary: 'Extensive riverine flood breach cutting off highway connectivity and forcing wildlife and villagers toward elevated southern Karbi Anglong ridges.',
      hazardClassification: 'Major Riverine Embankment Breach & Trans-Boundary Spate',
      keyThreats: [
        'Submerged villages with 15,000 marooned inhabitants',
        'Speeding vehicular collision risk for wildlife crossing flooded NH-715',
        'Water contamination causing gastrointestinal disease outbreaks'
      ],
      uncertainties: [
        'Upstream rainfall status in Arunachal Pradesh catchment',
        'Emergency food stockpile duration in marooned char areas'
      ],
      recommendedNextActions: [
        'Impose speed limit barriers and convoy escorts on NH-715',
        'Dispatch water purification mobile units to relief relief camps',
        'Deploy country-boat rescue fleets to remote island settlements'
      ],
      resourceNeeds: [
        '15x Inflatable Motorized Rescue Boats',
        '5x Mobile Water Purification Plants',
        'Veterinary rescue rapid response unit'
      ],
      confidenceScore: 91,
      evaluatedAt: '2026-10-09T04:15:00Z',
    },
    assignedTeams: ['ASDMA Quick Response', 'NDRF 1st Bn Guwahati', 'Assam Forest Protection Force'],
    infrastructureImpact: ['NH-715 Traffic Speed Restriced', 'Hatimura Dyke Broken'],
    evacuationRadiusKm: 4.0,
    isSample: true,
  },
  {
    id: 'IND-DIS-05',
    title: 'Yamuna River Overflow & Historic Ring Road Inundation',
    category: 'flood',
    severity: 'moderate',
    status: 'investigating',
    location: {
      name: 'Kashmere Gate ISBT & Yamuna Bazar, New Delhi',
      lat: 28.6675,
      lng: 77.2289,
    },
    reportedAt: '2026-10-09T03:50:00Z',
    reportedBy: 'Delhi Disaster Management Authority (DDMA)',
    description: 'Yamuna water level reached 208.62 meters following 3.5 lakh cusecs discharge from Hathnikund Barrage. Floodwaters entered Ring Road and Monastery Market.',
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    verified: true,
    verificationSource: 'first_responder',
    priorityScore: 68,
    priorityBreakdown: {
      severityScore: 18,
      exposureScore: 18,
      vulnerabilityScore: 10,
      infrastructureScore: 13,
      accessConstraintsScore: 5,
      freshnessScore: 4,
    },
    aiAnalysis: {
      summary: 'High water volume in Yamuna overflowing floodplains into Ring Road corridor. Water treatment plants at Wazirabad and Chandrawal at risk of shutdown.',
      hazardClassification: 'Urban Floodplain Inundation & Regulatory Barrage Surcharge',
      keyThreats: [
        'Closure of Interstate Bus Terminal (ISBT) disrupting intercity transport',
        'Silt contamination affecting drinking water supply in North/Central Delhi',
        'Submerged arterial road causing gridlock on central corridors'
      ],
      uncertainties: [
        'Peak discharge duration from Hathnikund upstream barrage',
        'Operation of regulator drainage gates near Supreme Court'
      ],
      recommendedNextActions: [
        'Erect sandbag dykes around Wazirabad water treatment plant pump house',
        'Evacuate makeshift dairy settlements on Yamuna floodplains',
        'Divert commercial trucks away from Ring Road to Eastern Peripheral Expressway'
      ],
      resourceNeeds: [
        'Sandbag barrier units (50,000 bags)',
        'Delhi Jal Board auxiliary generator pumps',
        'Delhi Police traffic diversion units'
      ],
      confidenceScore: 89,
      evaluatedAt: '2026-10-09T03:55:00Z',
    },
    assignedTeams: ['DDMA Rapid Response Unit', 'NDRF 8th Bn Ghaziabad'],
    infrastructureImpact: ['Ring Road Partially Closed', 'Wazirabad Water Intake Restricted'],
    evacuationRadiusKm: 1.0,
    isSample: true,
  },
  {
    id: 'IND-DIS-06',
    title: 'Himalayan Slope Subsidence & Fissure Cracks Event',
    category: 'infrastructure',
    severity: 'high',
    status: 'investigating',
    location: {
      name: 'Sunil & Manohar Bagh Wards, Joshimath, Uttarakhand',
      lat: 30.5564,
      lng: 79.5663,
    },
    reportedAt: '2026-10-09T02:30:00Z',
    reportedBy: 'Uttarakhand State Emergency Operation Centre (SEOC)',
    description: 'Ground cracks widened to 8cm across residential structures and ropeway tower foundation following underground water seepage discharge.',
    verified: true,
    verificationSource: 'first_responder',
    priorityScore: 78,
    priorityBreakdown: {
      severityScore: 23,
      exposureScore: 18,
      vulnerabilityScore: 13,
      infrastructureScore: 14,
      accessConstraintsScore: 6,
      freshnessScore: 4,
    },
    aiAnalysis: {
      summary: 'Geological slope settlement on glacial moraine deposits. Multi-story buildings tilting; Badrinath highway link fragile.',
      hazardClassification: 'Moraine Slope Creep & Sub-Surface Hydro-Geological Subsidence',
      keyThreats: [
        'Sudden structural collapse of multi-story hotel buildings',
        'Rupture of underground municipal water pipelines accelerating soil erosion',
        'Obstruction of vital Badrinath and strategic border supply route'
      ],
      uncertainties: [
        'Source of high-turbidity subterranean water discharge',
        'Deformation rate measured by satellite InSAR radar sensors'
      ],
      recommendedNextActions: [
        'Declare Red Zone for Sunil Ward and evacuate 68 families to relief shelters',
        'Suspend ropeway operations and heavy construction activities',
        'Install real-time extensometers to track crack expansion'
      ],
      resourceNeeds: [
        'Wadia Institute Geological Survey Team',
        'Emergency prefabricated shelter units',
        'Ground penetrating radar survey crew'
      ],
      confidenceScore: 92,
      evaluatedAt: '2026-10-09T02:35:00Z',
    },
    infrastructureImpact: ['Joshimath-Auli Ropeway Suspended', 'Sector 4 Road Fractured'],
    evacuationRadiusKm: 1.2,
    isSample: true,
  }
];

export const INITIAL_ALERTS: EmergencyAlert[] = [
  {
    id: 'ALT-IND-901',
    incidentId: 'IND-DIS-01',
    title: 'CRITICAL EVACUATION ORDER: Wayanad Landslide Red Alert Zone',
    severity: 'critical',
    category: 'critical_emergency',
    hazardType: 'Catastrophic Hillside Landslide & Flash Mudflow',
    affectedArea: 'Chooralmala, Mundakkai & Meppadi, Wayanad, Kerala',
    coordinates: { lat: 11.5583, lng: 76.1558 },
    observationTime: '2026-10-09T05:30:00Z',
    threatDescription: 'Severe debris flow has severed bridge connections. Continued heavy rainfall increases danger of secondary bluff collapse. Mandatory evacuation of all downhill riverbanks.',
    safetyPrecautions: [
      'Immediately evacuate to designated high-ground tea factory shelter or Meppadi Higher Secondary School.',
      'Stay away from swelling streams and fresh earth crevices.',
      'Call emergency helpline 1077 (Wayanad District Emergency Centre) or 112 for rescue coordinate dispatch.'
    ],
    source: 'National Disaster Management Authority (NDMA) & Kerala SDMA',
    verificationStatus: 'confirmed_official',
    confidence: 97,
    nextSteps: 'NDRF and Indian Army disaster columns mobilizing. Evacuation relief camps operational.',
    responseStatus: 'dispatched',
    createdAt: '2026-10-09T05:35:00Z',
    acknowledgedBy: 'Chief Secretary & SDMA Controller',
    languages: {
      en: {
        title: 'CRITICAL EVACUATION ORDER: Wayanad Landslide Red Alert Zone',
        content: 'Severe landslide in Chooralmala-Meppadi. River bridges damaged. Evacuate riverbanks immediately to designated relief shelters.',
        precautions: '• Move to higher ground shelters immediately.\n• Do not approach swollen river streams.\n• Dial 1077 or 112 for emergency rescue.'
      },
      hi: {
        title: 'गंभीर आपातकालीन निकासी आदेश: वायनाड भूस्खलन रेड अलर्ट क्षेत्र',
        content: 'वायनाड के चूरलमाला-मेप्पाडी में भारी भूस्खलन और मलबे का बहाव। नदी के पुल क्षतिग्रस्त। सभी नागरिक तुरंत ऊंचे राहत शिविरों में जाएं।',
        precautions: '• तुरंत सुरक्षित ऊंचे राहत शिविरों में पहुंचें।\n• उफनती नदियों और मिट्टी के कटाव से दूर रहें।\n• आपातकालीन बचाव के लिए 1077 या 112 पर कॉल करें।'
      },
      ta: {
        title: 'அவசர வெளியேற்ற உத்தரவு: வயநாடு நிலச்சரிவு சிவப்பு எச்சரிக்கை',
        content: 'சூரல்மலை-மேப்பாடி பகுதியில் கடுமையான நிலச்சரிவு. பாலங்கள் அடித்துச் செல்லப்பட்டன. ஆற்றங்கரையோர மக்கள் உடனடியாக முகாம்களுக்கு செல்லவும்.',
        precautions: '• உடனடியாக உயரமான நிவாரண முகாம்களுக்கு செல்லவும்.\n• வெள்ள நீர் மற்றும் நிலப்பரப்பு பிளவுகளை நெருங்காதீர்கள்.\n• அவசர உதவிக்கு 1077 அல்லது 112 என்ற எண்ணை அழைக்கவும்.'
      }
    },
    active: true,
    isSample: true,
  },
  {
    id: 'ALT-IND-902',
    incidentId: 'IND-DIS-02',
    title: 'FLASH FLOOD & RAIL TRANSIT SUSPENSION ADVISORY: Mumbai Mithi Basin',
    severity: 'critical',
    category: 'high_priority',
    hazardType: 'Monsoon Extreme Rain Inundation & High Tide Surcharge',
    affectedArea: 'Kurla, Sion, Chunabhatti & Mithi River Basin, Mumbai',
    coordinates: { lat: 19.0657, lng: 72.8794 },
    observationTime: '2026-10-09T05:15:00Z',
    threatDescription: 'Mithi River water levels have crossed danger threshold. Suburban rail services suspended. Severe waterlogging across arterial transit roads.',
    safetyPrecautions: [
      'Avoid traveling outside unless strictly essential.',
      'Do not walk through standing water near power substations or utility poles.',
      'Commuters stranded at Kurla/Sion stations must remain on elevated platforms.'
    ],
    source: 'Brihanmumbai Municipal Corporation (BMC) Disaster Cell',
    verificationStatus: 'confirmed_official',
    confidence: 94,
    nextSteps: 'Dewatering pumps active. BEST emergency bus services mobilized.',
    responseStatus: 'dispatched',
    createdAt: '2026-10-09T05:22:00Z',
    acknowledgedBy: 'BMC Disaster Management Chief',
    languages: {
      en: {
        title: 'FLASH FLOOD & RAIL TRANSIT SUSPENSION ADVISORY: Mumbai Mithi Basin',
        content: 'Mithi River overflowing. Suburban rail services halted at Kurla/Sion. Avoid all low-lying transit corridors.',
        precautions: '• Stay indoors; avoid non-essential travel.\n• Keep away from submerged electrical fixtures.\n• Dial 1916 for BMC emergency control.'
      },
      hi: {
        title: 'फ्लैश फ्लड व लोकल ट्रेन सेवा निलंबन सूचना: मुंबई मीठी नदी बेसिन',
        content: 'मीठी नदी का जलस्तर खतरे के निशान से ऊपर। कुर्ला और सायन में रेलवे ट्रैक जलमग्न। गैर-जरूरी यात्रा से बचें।',
        precautions: '• घरों या सुरक्षित स्थानों पर रहें।\n• बिजली के खंभों और जलमग्न तारों से दूर रहें।\n• बीएमसी हेल्पलाइन 1916 पर संपर्क करें।'
      },
      ta: {
        title: 'திடீர் வெள்ளம் மற்றும் ரயில் சேவை நிறுத்தம்: மும்பை மித்தி நதி பகுதி',
        content: 'மித்தி நதியில் பெருவெள்ளம். குர்லா-சியோன் புறநகர் ரயில் சேவைகள் நிறுத்தம். தாழ்வான பகுதிகளுக்கு செல்வதை தவிர்க்கவும்.',
        precautions: '• தேவையற்ற பயணங்களை தவிர்க்கவும்.\n• மின் கம்பங்கள் மற்றும் நீரில் மூழ்கிய மின்சார பெட்டிகளை தொடாதீர்கள்.\n• உதவிக்கு 1916 அழைக்கவும்.'
      }
    },
    active: true,
    isSample: true,
  },
  {
    id: 'ALT-IND-903',
    incidentId: 'IND-DIS-03',
    title: 'CYCLONE RED WARNING: Storm Surge Along Odisha Coast',
    severity: 'high',
    category: 'hazard_warning',
    hazardType: 'Severe Cyclonic Storm & 3.5m Tidal Inundation',
    affectedArea: 'Paradip, Kendrapara, Jagatsinghpur & Puri Coastal Belt',
    coordinates: { lat: 20.2644, lng: 86.6713 },
    observationTime: '2026-10-09T04:45:00Z',
    threatDescription: 'Gale wind gusts of 145 km/h with 3.5-meter storm surge expected. Fishermen prohibited from sea venture.',
    safetyPrecautions: [
      'Evacuate immediately to cyclone multi-purpose shelters.',
      'Secure tin roofs, loose antennas, and livestock.',
      'Keep portable battery radios tuned to All India Radio disaster bulletins.'
    ],
    source: 'IMD Bhubaneswar & Odisha Disaster Management Authority (OSDMA)',
    verificationStatus: 'confirmed_official',
    confidence: 96,
    nextSteps: 'OSDMA cyclone shelters opened. Food and medical stocks deployed.',
    responseStatus: 'acknowledged',
    createdAt: '2026-10-09T04:55:00Z',
    acknowledgedBy: 'OSDMA District Collector',
    languages: {
      en: {
        title: 'CYCLONE RED WARNING: Storm Surge Along Odisha Coast',
        content: 'Very Severe Cyclone approaching Paradip coast. 3.5m tidal wave danger. Shift immediately to cyclone shelters.',
        precautions: '• Move to concrete cyclone shelters.\n• Stock clean drinking water and dry food.\n• Dial 1070 for State Emergency Operation Centre.'
      },
      hi: {
        title: 'चक्रवात रेड वार्निंग: ओडिशा तट पर समुद्री तूफान की चेतावनी',
        content: 'पारादीप तट पर अत्यंत गंभीर चक्रवाती तूफान का खतरा। 3.5 मीटर ऊंची समुद्री लहरें। तुरंत बहुउद्देशीय चक्रवात आश्रयों में जाएं।',
        precautions: '• पक्के चक्रवात आश्रय स्थलों में शरण लें।\n• पीने का पानी और जरूरी दवाइयां साथ रखें।\n• राज्य आपदा हेल्पलाइन 1070 पर संपर्क करें।'
      },
      ta: {
        title: 'புயல் சிவப்பு எச்சரிக்கை: ஒடிசா கடலோர பகுதிகளில் புயல் சீற்றம்',
        content: 'பாராதீப் கடலோரத்தில் கடுமையான புயல் மற்றும் 3.5 மீட்டர் கடல் அலைகள் எழும் அபாயம். உடனடியாக புயல் நிவாரண மையங்களுக்கு செல்லவும்.',
        precautions: '• உடனடியாக புயல் பாதுகாப்பு மையங்களுக்கு செல்லவும்.\n• குடிநீர் மற்றும் உலர் உணவுகளை தயார் நிலையில் வைக்கவும்.\n• அவசர உதவிக்கு 1070 அழைக்கவும்.'
      }
    },
    active: true,
    isSample: true,
  }
];

export const INITIAL_SHELTERS_AND_RESOURCES: ShelterOrHospital[] = [
  {
    id: 'FAC-IND-01',
    name: 'AIIMS New Delhi Apex Trauma Centre',
    type: 'hospital',
    location: {
      name: 'Raj Nagar, Ansari Nagar East, New Delhi',
      lat: 28.5672,
      lng: 77.2100,
    },
    capacity: 450,
    occupied: 310,
    status: 'operational',
    contact: '+91 11 2658 8500 / 102',
    distanceKm: 4.8,
  },
  {
    id: 'FAC-IND-02',
    name: 'KEM Hospital & Disaster Emergency Ward',
    type: 'hospital',
    location: {
      name: 'Acharya Donde Marg, Parel, Mumbai',
      lat: 19.0033,
      lng: 72.8427,
    },
    capacity: 600,
    occupied: 480,
    status: 'operational',
    contact: '+91 22 2410 7000',
    distanceKm: 3.2,
  },
  {
    id: 'FAC-IND-03',
    name: 'SCB Medical College & Hospital Super Specialty Unit',
    type: 'hospital',
    location: {
      name: 'Mangalabag, Cuttack, Odisha',
      lat: 20.4633,
      lng: 85.8828,
    },
    capacity: 800,
    occupied: 520,
    status: 'operational',
    contact: '+91 671 241 4080',
    distanceKm: 12.0,
  },
  {
    id: 'FAC-IND-04',
    name: 'Wayanad Meppadi Disaster Relief Staging Shelter',
    type: 'shelter',
    location: {
      name: 'Government Higher Secondary School, Meppadi, Wayanad',
      lat: 11.5510,
      lng: 76.1280,
    },
    capacity: 750,
    occupied: 380,
    status: 'operational',
    contact: '+91 4936 202234 / 1077',
    distanceKm: 2.1,
  },
  {
    id: 'FAC-IND-05',
    name: 'OSDMA Paradip Multi-Purpose Cyclone Shelter #12',
    type: 'shelter',
    location: {
      name: 'Sandhakud Sector, Paradip, Odisha',
      lat: 20.2789,
      lng: 86.6620,
    },
    capacity: 1200,
    occupied: 420,
    status: 'operational',
    contact: '+91 6722 222144',
    distanceKm: 1.5,
  },
  {
    id: 'FAC-IND-06',
    name: 'NDRF 10th Battalion Tactical Base Camp & Logistics',
    type: 'relief_hub',
    location: {
      name: 'Central Disaster Response Hub, Arakkonam / Regional Depots',
      lat: 13.0827,
      lng: 79.6700,
    },
    capacity: 2500,
    occupied: 600,
    status: 'operational',
    contact: '+91 4177 246594',
    distanceKm: 15.0,
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTIF-IND-1',
    alertId: 'ALT-IND-901',
    incidentId: 'IND-DIS-01',
    title: 'CRITICAL ALERT: Wayanad Landslide Mass Debris Flow',
    message: 'Bridge link broken at Chooralmala. NDRF 4th Bn and Indian Army columns mobilized. Immediate evacuation order active.',
    severity: 'critical',
    category: 'Landslide',
    timestamp: '2026-10-09T05:32:00Z',
    read: false,
    acknowledged: false,
    coordinates: { lat: 11.5583, lng: 76.1558 },
  },
  {
    id: 'NOTIF-IND-2',
    alertId: 'ALT-IND-902',
    incidentId: 'IND-DIS-02',
    title: 'HIGH THREAT: Mumbai Mithi Basin Surcharge & Rail Stall',
    message: 'High tide 4.6m. Suburban rail lines stalled at Kurla. BMC dewatering pumps running at maximum capacity.',
    severity: 'critical',
    category: 'Flash Flood',
    timestamp: '2026-10-09T05:18:00Z',
    read: false,
    acknowledged: false,
    coordinates: { lat: 19.0657, lng: 72.8794 },
  },
  {
    id: 'NOTIF-IND-3',
    alertId: 'ALT-IND-903',
    incidentId: 'IND-DIS-03',
    title: 'CYCLONE WARNING: Paradip Coastal Belt Surcharge',
    message: 'IMD Doppler Radar tracking 145 km/h gusts. 50 multipurpose cyclone shelters active in coastal Odisha.',
    severity: 'high',
    category: 'Cyclone',
    timestamp: '2026-10-09T04:48:00Z',
    read: true,
    acknowledged: true,
    coordinates: { lat: 20.2644, lng: 86.6713 },
  },
  {
    id: 'NOTIF-IND-4',
    title: 'INSAT-3DR WEATHER SATELLITE & IMD DOPPLER RADAR SYNCED',
    message: 'Full-disk cloud scan and 14 Doppler Weather Radars (DWR) across Indian subcontinent synchronized.',
    severity: 'system',
    category: 'Radar Telemetry',
    timestamp: '2026-10-09T04:00:00Z',
    read: true,
    acknowledged: true,
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'AUDIT-IND-101',
    timestamp: '2026-10-09T05:35:00Z',
    actor: 'NDMA Incident Commander',
    action: 'ALERT_BROADCAST_APPROVED',
    details: 'Issued official Red Alert broadcast for Chooralmala, Wayanad (ALT-IND-901)',
    targetId: 'ALT-IND-901',
  },
  {
    id: 'AUDIT-IND-102',
    timestamp: '2026-10-09T05:32:00Z',
    actor: 'DisasterLens AI Engine',
    action: 'AI_PRIORITY_SCORE_CALCULATED',
    details: 'Wayanad Landslide IND-DIS-01 calculated at Priority 96/100 (Maximum Critical Level)',
    targetId: 'IND-DIS-01',
  },
  {
    id: 'AUDIT-IND-103',
    timestamp: '2026-10-09T05:25:00Z',
    actor: 'BMC Operations Controller',
    action: 'RESOURCE_ASSIGNMENT',
    details: 'Deployed 8x dewatering pumps and Naval diver teams to Kurla Mithi basin',
    targetId: 'IND-DIS-02',
  },
  {
    id: 'AUDIT-IND-104',
    timestamp: '2026-10-09T05:18:00Z',
    actor: 'IMD Doppler Radar Colaba',
    action: 'RADAR_CLOUD_BURST_FLAGGED',
    details: 'Heavy reflectivity 58 dBZ detected over Mumbai suburban belt',
    targetId: 'IND-DIS-02',
  }
];
