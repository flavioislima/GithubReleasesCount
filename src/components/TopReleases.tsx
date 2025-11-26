import { useState, useEffect, useCallback } from 'react';
import type { GitHubRelease, GitHubAsset } from '../types/github';
import { format, parseISO } from 'date-fns';

interface TopReleasesProps {
  releases: GitHubRelease[];
  skippedExtensions: Set<string>;
}

interface ReleaseWithDownloads {
  id: number;
  name: string;
  tagName: string;
  publishedAt: string;
  totalDownloads: number;
  assets: GitHubAsset[];
}

function getFileExtension(filename: string): string {
  const match = filename.match(/\.([^.]+)$/);
  return match ? `.${match[1].toLowerCase()}` : 'no extension';
}

interface ReleaseDetailsModalProps {
  release: ReleaseWithDownloads;
  skippedExtensions: Set<string>;
  onClose: () => void;
}

function ReleaseDetailsModal({ release, skippedExtensions, onClose }: ReleaseDetailsModalProps) {
  const filteredAssets = release.assets.filter(
    (asset) => !skippedExtensions.has(getFileExtension(asset.name))
  );

  // Handle Escape key to close modal
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="release-modal-title"
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 id="release-modal-title" className="text-xl font-semibold text-gray-800">{release.name}</h3>
              {release.name !== release.tagName && (
                <p className="text-sm text-gray-500">{release.tagName}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Released: {format(parseISO(release.publishedAt), 'MMM dd, yyyy')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <h4 className="text-sm font-semibold text-gray-600 mb-3">Downloads per File</h4>
          <div className="space-y-2">
            {filteredAssets
              .sort((a, b) => b.download_count - a.download_count)
              .map((asset) => (
                <div 
                  key={asset.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm font-medium text-gray-800 truncate" title={asset.name}>
                      {asset.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(asset.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">
                      {asset.download_count.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">downloads</p>
                  </div>
                </div>
              ))}
          </div>
          {filteredAssets.length === 0 && (
            <p className="text-gray-500 text-sm">No assets (after filtering)</p>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Total: <span className="font-semibold">{release.totalDownloads.toLocaleString()}</span> downloads
          </p>
        </div>
      </div>
    </div>
  );
}

export function TopReleases({ releases, skippedExtensions }: TopReleasesProps) {
  const [selectedRelease, setSelectedRelease] = useState<ReleaseWithDownloads | null>(null);

  // Calculate total downloads for each release, excluding skipped extensions
  const releasesWithDownloads: ReleaseWithDownloads[] = releases
    .map((release) => {
      const totalDownloads = release.assets
        .filter((asset) => !skippedExtensions.has(getFileExtension(asset.name)))
        .reduce((sum, asset) => sum + asset.download_count, 0);
      
      return {
        id: release.id,
        name: release.name || release.tag_name,
        tagName: release.tag_name,
        publishedAt: release.published_at,
        totalDownloads,
        assets: release.assets,
      };
    })
    .sort((a, b) => b.totalDownloads - a.totalDownloads)
    .slice(0, 10);

  if (releasesWithDownloads.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Top 10 Releases by Downloads</h3>
        <p className="text-sm text-gray-500 mb-4">Click on a release to view download details per file</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-sm font-semibold text-gray-600">#</th>
                <th className="pb-3 text-sm font-semibold text-gray-600">Release</th>
                <th className="pb-3 text-sm font-semibold text-gray-600">Date</th>
                <th className="pb-3 text-sm font-semibold text-gray-600 text-right">Downloads</th>
              </tr>
            </thead>
            <tbody>
              {releasesWithDownloads.map((release, index) => (
                <tr 
                  key={release.id} 
                  className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedRelease(release)}
                >
                  <td className="py-3 text-sm text-gray-500">{index + 1}</td>
                  <td className="py-3">
                    <div className="text-sm font-medium text-blue-600 hover:text-blue-800">{release.name}</div>
                    {release.name !== release.tagName && (
                      <div className="text-xs text-gray-500">{release.tagName}</div>
                    )}
                  </td>
                  <td className="py-3 text-sm text-gray-600">
                    {format(parseISO(release.publishedAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-3 text-sm font-medium text-gray-800 text-right">
                    {release.totalDownloads.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {selectedRelease && (
        <ReleaseDetailsModal
          release={selectedRelease}
          skippedExtensions={skippedExtensions}
          onClose={() => setSelectedRelease(null)}
        />
      )}
    </>
  );
}
