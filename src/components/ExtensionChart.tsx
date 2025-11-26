import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ExtensionStats } from '../types/github';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExtensionChartProps {
  stats: ExtensionStats[];
}

const CHART_COLORS = [
  'rgba(59, 130, 246, 0.8)',   // blue
  'rgba(16, 185, 129, 0.8)',   // green
  'rgba(249, 115, 22, 0.8)',   // orange
  'rgba(139, 92, 246, 0.8)',   // purple
  'rgba(236, 72, 153, 0.8)',   // pink
  'rgba(245, 158, 11, 0.8)',   // amber
  'rgba(99, 102, 241, 0.8)',   // indigo
  'rgba(20, 184, 166, 0.8)',   // teal
  'rgba(239, 68, 68, 0.8)',    // red
  'rgba(107, 114, 128, 0.8)',  // gray
];

const CHART_BORDER_COLORS = [
  'rgba(59, 130, 246, 1)',   // blue
  'rgba(16, 185, 129, 1)',   // green
  'rgba(249, 115, 22, 1)',   // orange
  'rgba(139, 92, 246, 1)',   // purple
  'rgba(236, 72, 153, 1)',   // pink
  'rgba(245, 158, 11, 1)',   // amber
  'rgba(99, 102, 241, 1)',   // indigo
  'rgba(20, 184, 166, 1)',   // teal
  'rgba(239, 68, 68, 1)',    // red
  'rgba(107, 114, 128, 1)',  // gray
];

export function ExtensionChart({ stats }: ExtensionChartProps) {
  const data = {
    labels: stats.map(s => `${s.extension} (${s.totalDownloads.toLocaleString()})`),
    datasets: [
      {
        data: stats.map(s => s.totalDownloads),
        backgroundColor: stats.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
        borderColor: stats.map((_, i) => CHART_BORDER_COLORS[i % CHART_BORDER_COLORS.length]),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: { parsed: number; label: string }) => {
            const total = stats.reduce((sum, s) => sum + s.totalDownloads, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.parsed.toLocaleString()} downloads (${percentage}%)`;
          },
        },
      },
    },
  };

  if (stats.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        No data to display
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Downloads by File Type</h3>
      <div className="h-80">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
}
