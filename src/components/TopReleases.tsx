import type { GitHubRelease } from '../types/github';
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
}

function getFileExtension(filename: string): string {
  const match = filename.match(/\.([^.]+)$/);
  return match ? `.${match[1].toLowerCase()}` : 'no extension';
}

export function TopReleases({ releases, skippedExtensions }: TopReleasesProps) {
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
      };
    })
    .sort((a, b) => b.totalDownloads - a.totalDownloads)
    .slice(0, 10);

  if (releasesWithDownloads.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Top 10 Releases by Downloads</h3>
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
              <tr key={release.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 text-sm text-gray-500">{index + 1}</td>
                <td className="py-3">
                  <div className="text-sm font-medium text-gray-800">{release.name}</div>
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
  );
}
