
export interface ChartDataPoint {
  period: string;      // e.g., "2024 Jan" or "2023"
  passengers: number;  // Current volume
  comparison?: number; // Previous year's volume for the same period
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AirportData {
  airportName: string;
  summary: string;     // Renamed from analysis to summary for factual brevity
  chartData: ChartDataPoint[];
  sources: GroundingSource[];
}

export interface SearchState {
  isLoading: boolean;
  error: string | null;
  data: AirportData | null;
}

export interface AirportDefinition {
  code: string;
  name: string;
  isCustom?: boolean;
}
