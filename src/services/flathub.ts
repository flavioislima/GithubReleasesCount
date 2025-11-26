const FLATHUB_API_BASE = 'https://flathub.org/api/v2';

export interface FlathubStats {
  id: string;
  installs_total: number;
  installs_last_month: number;
  installs_last_7_days: number;
  installs_per_day: Record<string, number>;
}

export async function fetchFlathubStats(appId: string): Promise<FlathubStats> {
  const response = await fetch(`${FLATHUB_API_BASE}/stats/${appId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Flathub app "${appId}" not found`);
    }
    throw new Error(`Flathub API error: ${response.status} ${response.statusText}`);
  }

  const data: FlathubStats = await response.json();
  return data;
}
