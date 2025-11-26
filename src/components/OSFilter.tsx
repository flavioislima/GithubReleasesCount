import { useMemo } from 'react';
import type { AssetDownloadData } from '../types/github';

interface OSFilterProps {
  assets: AssetDownloadData[];
  flathubDownloads?: number;
}

type OperatingSystem = 'windows' | 'macos' | 'linux' | 'other';

interface OSStats {
  os: OperatingSystem;
  label: string;
  extensions: string[];
  totalDownloads: number;
  icon: string;
  color: string;
}

const OS_EXTENSIONS: Record<OperatingSystem, string[]> = {
  windows: ['.exe', '.msi'],
  macos: ['.dmg', '.pkg'],
  linux: ['.rpm', '.deb', '.pacman', '.appimage', '.xz'],
  other: [],
};

const OS_LABELS: Record<OperatingSystem, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
  other: 'Other',
};

const OS_ICONS: Record<OperatingSystem, string> = {
  windows: '🪟',
  macos: '🍎',
  linux: '🐧',
  other: '📦',
};

const OS_COLORS: Record<OperatingSystem, { bg: string; text: string; border: string }> = {
  windows: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  macos: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  linux: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  other: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

export function OSFilter({ assets, flathubDownloads }: OSFilterProps) {
  const osStats = useMemo((): OSStats[] => {
    const stats: OSStats[] = [];
    const allOsExtensions = new Set<string>();
    
    // Calculate downloads for each OS
    (['windows', 'macos', 'linux'] as OperatingSystem[]).forEach((os) => {
      const extensions = OS_EXTENSIONS[os];
      extensions.forEach(ext => allOsExtensions.add(ext));
      
      let totalDownloads = assets
        .filter((asset) => extensions.includes(asset.extension.toLowerCase()))
        .reduce((sum, asset) => sum + asset.downloadCount, 0);
      
      // Add Flathub downloads to Linux count
      if (os === 'linux' && flathubDownloads != null) {
        totalDownloads += flathubDownloads;
      }
      
      stats.push({
        os,
        label: OS_LABELS[os],
        extensions,
        totalDownloads,
        icon: OS_ICONS[os],
        color: OS_COLORS[os].bg,
      });
    });
    
    // Calculate "other" downloads
    const otherDownloads = assets
      .filter((asset) => !allOsExtensions.has(asset.extension.toLowerCase()))
      .reduce((sum, asset) => sum + asset.downloadCount, 0);
    
    stats.push({
      os: 'other',
      label: OS_LABELS.other,
      extensions: [],
      totalDownloads: otherDownloads,
      icon: OS_ICONS.other,
      color: OS_COLORS.other.bg,
    });
    
    return stats;
  }, [assets, flathubDownloads]);

  const totalDownloads = osStats.reduce((sum, s) => sum + s.totalDownloads, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Downloads by Operating System</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {osStats.map((stat) => {
          const percentage = totalDownloads > 0 
            ? ((stat.totalDownloads / totalDownloads) * 100).toFixed(1) 
            : '0';
          const colors = OS_COLORS[stat.os];
          const showFlathub = stat.os === 'linux' && flathubDownloads != null;
          
          return (
            <div 
              key={stat.os}
              className={`${colors.bg} ${colors.border} border rounded-lg p-4 text-center`}
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className={`font-semibold ${colors.text}`}>{stat.label}</div>
              <div className="text-xl font-bold text-gray-800 mt-1">
                {stat.totalDownloads.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">{percentage}%</div>
              {stat.extensions.length > 0 && (
                <div className="text-xs text-gray-400 mt-2">
                  {stat.extensions.join(', ')}
                  {showFlathub && ', Flathub'}
                </div>
              )}
              {showFlathub && (
                <div className="text-xs text-green-600 mt-1">
                  +{flathubDownloads.toLocaleString()} from Flathub
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
