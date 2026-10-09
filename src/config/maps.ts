// Source: Google Maps Platform Code Assist
// Google Maps Platform configuration for DisasterLens AI - India Operations Command

export const GOOGLE_MAPS_API_KEY: string =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
  'AIzaSyBzz3K566CXRN_4d1sl_sFS8RYIytTnUMc';

export const MAP_ID: string = 'DEMO_MAP_ID';

export const GMP_ATTRIBUTION_ID = 'gmp_mcp_codeassist_v1_aistudio';

// Centered on India (Strategic Center / New Delhi National Disaster Command)
export const DEFAULT_CENTER = {
  lat: 22.5937,
  lng: 78.9629,
};

export const DEFAULT_ZOOM = 5;

export const GLOBAL_PRESET_CITIES = [
  { name: 'India All-Sector View', lat: 22.5937, lng: 78.9629, zoom: 5 },
  { name: 'New Delhi (NDMA National EOC)', lat: 28.6139, lng: 77.2090, zoom: 12 },
  { name: 'Mumbai (BMC Disaster Operations)', lat: 19.0760, lng: 72.8777, zoom: 12 },
  { name: 'Wayanad (Kerala Landslide Zone)', lat: 11.6854, lng: 76.1320, zoom: 13 },
  { name: 'Uttarakhand (Chamoli / Joshimath)', lat: 30.5564, lng: 79.5663, zoom: 12 },
  { name: 'Assam (Brahmaputra Flood Sector)', lat: 26.1445, lng: 91.7362, zoom: 12 },
  { name: 'Odisha (Bay of Bengal Cyclone Post)', lat: 19.8135, lng: 85.8312, zoom: 12 },
  { name: 'Chennai (Tamil Nadu SDMA Command)', lat: 13.0827, lng: 80.2707, zoom: 12 },
  { name: 'Bengaluru (Karnataka KSNDMC Hub)', lat: 12.9716, lng: 77.5946, zoom: 12 },
  { name: 'Bihar (Kosi-Ganga Flood Plains)', lat: 25.6207, lng: 85.1724, zoom: 10 },
  { name: 'Gujarat (Kachchh & Saurashtra Coast)', lat: 22.8333, lng: 69.3556, zoom: 10 },
];
