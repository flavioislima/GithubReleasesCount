import axios from 'axios';

const FLATHUB_API_BASE = 'https://flathub.org/api/v2';

export interface FlathubStats {
  id: string;
  installs_total: number;
  installs_last_month: number;
  installs_last_7_days: number;
  installs_per_day: Record<string, number>;
}

export async function fetchFlathubStats(appId: string): Promise<FlathubStats> {
  try {
    const response = await axios.get<FlathubStats>(`${FLATHUB_API_BASE}/stats/${appId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`Flathub app "${appId}" not found`);
      }
      throw new Error(`Flathub API error: ${error.response?.status} ${error.response?.statusText || error.message}`);
    }
    throw error;
  }
}
