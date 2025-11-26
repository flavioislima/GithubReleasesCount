export interface FlathubStats {
  id: string;
  installs_total: number;
  installs_last_month: number;
  installs_last_7_days: number;
  installs_per_day: Record<string, number>;
}

export async function fetchFlathubStats(appId: string): Promise<FlathubStats> {
  // URL encode the full Flathub API URL for the CORS proxy
  const flathubUrl = `https://flathub.org/api/v2/stats/${appId}`;
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(flathubUrl)}`;
  
  const response = await fetch(proxyUrl);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Flathub app "${appId}" not found`);
    }
    throw new Error(`Flathub API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}
