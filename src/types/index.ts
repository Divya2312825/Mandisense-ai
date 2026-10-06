export interface CropInfo {
  id: string;
  name: string;
  teluguName: string;
  category: 'Spices' | 'Cereals' | 'Cash Crops' | 'Oilseeds' | 'Pulses' | 'Vegetables';
  baseMsp: number;
  basePrice: number;
  unit: string;
  seasonality: string;
  volatilityRate: number;
}

export interface HistoryPoint {
  date: string;
  displayDate: string;
  price: number;
  volume: number;
  msp: number;
}

export interface ForecastPoint {
  date: string;
  displayDate: string;
  dayName: string;
  predictedPrice: number;
  lowerBound: number;
  upperBound: number;
  confidenceScore: number;
}

export interface MandiEvaluation {
  id: string;
  name: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  grade: 'A+' | 'A' | 'B+';
  eNamEnabled: boolean;
  coldStorageAvailable: boolean;
  distanceKm: number | null;
  distanceLabel?: string;
  currentPrice: number;
  minPrice?: number;
  maxPrice?: number;
  modalPrice?: number;
  variety?: string;
  reportingDate?: string;
  arrivalDate?: string;
  source?: string;
  latestPriceLabel?: string;
  mlForecastLabel?: string;
  predictedPrice7d: number;
  forecastPeak: ForecastPoint;
  change24h: number;
  trend: 'Bullish' | 'Bearish' | 'Neutral/Stable';
  transportCostEstimate: number | null;
  mandiCess: number;
  netReturnPerQuintal: number | null;
  specializesInCrop: boolean;
  history: HistoryPoint[];
  forecast: ForecastPoint[];
}

export interface AdvisorExplanation {
  recommendedMandiId: string;
  recommendedMandiName: string;
  recommendedMandiDistrict: string;
  whyRecommended: string;
  formula: string;
  nearestMandiName: string;
  nearestMandiDistance: number | null;
  nearestMandiNet: number | null;
  advantagePerQuintal: number;
  advantagePerTruckload: number;
}

export interface WeatherInsights {
  district: string;
  tempCurrent: number;
  tempHigh: number;
  tempLow: number;
  condition: string;
  humidity: number;
  rainProbabilityNext3Days: string;
  roadConditionStatus: string;
  cropPreservationAdvisory: string;
  recommendedSellingWindow: string;
}

export interface UserLocationState {
  lat: number | null;
  lng: number | null;
  isCustomUserLocation: boolean;
  approximateArea: string;
  placeName?: string | null;
  district?: string | null;
  state?: string | null;
  country?: string | null;
  reverseGeocodeStatus?: 'idle' | 'loading' | 'resolved' | 'unavailable';
  status?: 'idle' | 'locating' | 'granted' | 'unavailable';
  statusMessage?: string;
  accuracyMeters?: number;
}

export interface InsightsResponse {
  crop: CropInfo;
  selectedMandi: MandiEvaluation;
  recommendedMandi: MandiEvaluation;
  nearestMandi: MandiEvaluation;
  advisorExplanation: AdvisorExplanation;
  allNearbyMandis: MandiEvaluation[];
  userLocation: UserLocationState;
  weatherInsights: WeatherInsights;
  demoNotice: string;
  dataAvailable?: boolean;
  sourceLabel?: string;
  latestPriceLabel?: string;
  mlForecastLabel?: string;
  apiUpdatedDate?: string | null;
  commodityUpdatedDate?: string | null;
  endpointUrl?: string;
}
