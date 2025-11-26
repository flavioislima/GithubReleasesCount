interface DownloadStatsProps {
  totalDownloads: number;
  totalAssets: number;
  totalReleases: number;
  repoName: string;
}

export function DownloadStats({ totalDownloads, totalAssets, totalReleases, repoName }: DownloadStatsProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">{repoName}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-3xl font-bold text-blue-600">{totalDownloads.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1">Total Downloads</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-3xl font-bold text-green-600">{totalReleases}</p>
          <p className="text-sm text-gray-600 mt-1">Releases</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-3xl font-bold text-purple-600">{totalAssets}</p>
          <p className="text-sm text-gray-600 mt-1">Assets</p>
        </div>
      </div>
    </div>
  );
}
