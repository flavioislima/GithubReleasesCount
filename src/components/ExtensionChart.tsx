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
  'rgb(59, 130, 246)',   // blue
  'rgb(16, 185, 129)',   // green
  'rgb(249, 115, 22)',   // orange
  'rgb(139, 92, 246)',   // purple
  'rgb(236, 72, 153)',   // pink
  'rgb(245, 158, 11)',   // amber
  'rgb(99, 102, 241)',   // indigo
  'rgb(20, 184, 166)',   // teal
  'rgb(239, 68, 68)',    // red
  'rgb(107, 114, 128)',  // gray
];

export function ExtensionChart({ stats }: ExtensionChartProps) {
  const data = {
    labels: stats.map(s => `${s.extension} (${s.totalDownloads.toLocaleString()})`),
    datasets: [
      {
        data: stats.map(s => s.totalDownloads),
        backgroundColor: stats.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
        borderColor: stats.map((_, i) => CHART_COLORS[i % CHART_COLORS.length].replace('rgb', 'rgba').replace(')', ', 1)')),
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
