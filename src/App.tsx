import { useState, useMemo, useCallback } from 'react';
import { RepoInput } from './components/RepoInput';
import { ExtensionFilter } from './components/ExtensionFilter';
import { ExtensionChart } from './components/ExtensionChart';
import { TimeChart } from './components/TimeChart';
import { DownloadStats } from './components/DownloadStats';
import { TopReleases } from './components/TopReleases';
import { OSFilter } from './components/OSFilter';
import { fetchReleases, getFileExtension } from './services/github';
import { fetchFlathubStats, type FlathubStats } from './services/flathub';
import type { GitHubRelease, AssetDownloadData, ExtensionStats } from './types/github';

function App() {
  const [releases, setReleases] = useState<GitHubRelease[]>([]);
  const [repoName, setRepoName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [flathubError, setFlathubError] = useState('');
  const [skippedExtensions, setSkippedExtensions] = useState<Set<string>>(new Set(['.yml', '.yaml']));
  const [flathubStats, setFlathubStats] = useState<FlathubStats | null>(null);

  const handleFetch = useCallback(async (owner: string, repo: string, flathubAppId?: string) => {
    setIsLoading(true);
    setError('');
    setFlathubError('');
    setReleases([]);
    setFlathubStats(null);
    
    try {
      // Fetch both GitHub and Flathub data in parallel
      const promises: [Promise<GitHubRelease[]>, Promise<FlathubStats | null>] = [
        fetchReleases(owner, repo),
        flathubAppId
          ? fetchFlathubStats(flathubAppId).catch((flathubErr) => {
              // Show Flathub error but don't fail the whole request
              const message = flathubErr instanceof Error ? flathubErr.message : 'Failed to fetch Flathub data';
              setFlathubError(`Flathub: ${message}`);
              return null;
            })
          : Promise.resolve(null),
      ];

      const [githubData, flathubData] = await Promise.all(promises);
      
      setReleases(githubData);
      setRepoName(`${owner}/${repo}`);
      
      if (flathubData) {
        setFlathubStats(flathubData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Extract all assets with their metadata
  const allAssets = useMemo((): AssetDownloadData[] => {
    return releases.flatMap((release) =>
      release.assets.map((asset) => ({
        name: asset.name,
        downloadCount: asset.download_count,
        extension: getFileExtension(asset.name),
        date: release.published_at,
        releaseName: release.name || release.tag_name,
      }))
    );
  }, [releases]);

  // Get unique extensions
  const uniqueExtensions = useMemo(() => {
    const exts = new Set(allAssets.map((a) => a.extension));
    return Array.from(exts).sort();
  }, [allAssets]);

  // Filter assets by skipped extensions
  const filteredAssets = useMemo(() => {
    return allAssets.filter((asset) => !skippedExtensions.has(asset.extension));
  }, [allAssets, skippedExtensions]);

  // Calculate extension stats
  const extensionStats = useMemo((): ExtensionStats[] => {
    const statsMap = new Map<string, { count: number; totalDownloads: number }>();
    
    filteredAssets.forEach((asset) => {
      const current = statsMap.get(asset.extension) || { count: 0, totalDownloads: 0 };
      statsMap.set(asset.extension, {
        count: current.count + 1,
        totalDownloads: current.totalDownloads + asset.downloadCount,
      });
    });

    // Add Flathub downloads as .flatpak extension
    if (flathubStats && flathubStats.installs_total > 0) {
      const current = statsMap.get('.flatpak') || { count: 0, totalDownloads: 0 };
      statsMap.set('.flatpak', {
        count: current.count + 1,
        totalDownloads: current.totalDownloads + flathubStats.installs_total,
      });
    }

    return Array.from(statsMap.entries())
      .map(([extension, stats]) => ({
        extension,
        ...stats,
      }))
      .sort((a, b) => b.totalDownloads - a.totalDownloads);
  }, [filteredAssets, flathubStats]);

  // Calculate totals
  const totals = useMemo(() => {
    return {
      downloads: filteredAssets.reduce((sum, a) => sum + a.downloadCount, 0),
      assets: filteredAssets.length,
      releases: releases.length,
    };
  }, [filteredAssets, releases]);

  const handleToggleExtension = useCallback((extension: string) => {
    setSkippedExtensions((prev) => {
      const next = new Set(prev);
      if (next.has(extension)) {
        next.delete(extension);
      } else {
        next.add(extension);
      }
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          GitHub Releases Download Counter
        </h1>
        
        <RepoInput onSubmit={handleFetch} isLoading={isLoading} />
        
        {error && (
          <div className="w-full max-w-xl mx-auto mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
            <strong>GitHub Error:</strong> {error}
          </div>
        )}
        
        {flathubError && (
          <div className="w-full max-w-xl mx-auto mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-700">
            <strong>Flathub Error:</strong> {flathubError}
          </div>
        )}
        
        {releases.length > 0 && (
          <>
            <DownloadStats
              totalDownloads={totals.downloads}
              totalAssets={totals.assets}
              totalReleases={totals.releases}
              repoName={repoName}
              flathubDownloads={flathubStats?.installs_total}
            />
            
            <ExtensionFilter
              extensions={uniqueExtensions}
              skippedExtensions={skippedExtensions}
              onToggle={handleToggleExtension}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <ExtensionChart stats={extensionStats} />
              <TimeChart assets={filteredAssets} />
            </div>
            
            <OSFilter assets={filteredAssets} flathubDownloads={flathubStats?.installs_total} />
            
            <TopReleases releases={releases} skippedExtensions={skippedExtensions} />
          </>
        )}
        
        {!isLoading && releases.length === 0 && !error && (
          <div className="text-center text-gray-500 mt-12">
            <p>Enter a GitHub repository to view download statistics.</p>
            <p className="text-sm mt-2">Example: facebook/react, microsoft/vscode</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
