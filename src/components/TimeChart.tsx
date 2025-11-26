import { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { subDays, subWeeks, subMonths, isAfter, parseISO, format, eachDayOfInterval, eachMonthOfInterval, startOfDay, startOfMonth } from 'date-fns';
import type { AssetDownloadData } from '../types/github';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type TimeRange = 'day' | 'week' | 'month' | '365days' | 'alltime';

interface TimeChartProps {
  assets: AssetDownloadData[];
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: 'day', label: 'Last 24 Hours' },
  { value: 'week', label: 'Last Week' },
  { value: 'month', label: 'Last Month' },
  { value: '365days', label: 'Last 365 Days' },
  { value: 'alltime', label: 'All Time' },
];

export function TimeChart({ assets }: TimeChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('month');

  const chartData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let groupingFn: (date: Date) => string;
    let intervalFn: (interval: { start: Date; end: Date }) => Date[];
    let formatFn: (date: Date) => string;
    let useAllTime = false;

    switch (selectedRange) {
      case 'day':
        startDate = subDays(now, 1);
        groupingFn = (date: Date) => format(startOfDay(date), 'yyyy-MM-dd');
        intervalFn = eachDayOfInterval;
        formatFn = (date: Date) => format(date, 'MMM dd');
        break;
      case 'week':
        startDate = subWeeks(now, 1);
        groupingFn = (date: Date) => format(startOfDay(date), 'yyyy-MM-dd');
        intervalFn = eachDayOfInterval;
        formatFn = (date: Date) => format(date, 'MMM dd');
        break;
      case 'month':
        startDate = subMonths(now, 1);
        groupingFn = (date: Date) => format(startOfDay(date), 'yyyy-MM-dd');
        intervalFn = eachDayOfInterval;
        formatFn = (date: Date) => format(date, 'MMM dd');
        break;
      case '365days':
        startDate = subDays(now, 365);
        groupingFn = (date: Date) => format(startOfMonth(date), 'yyyy-MM');
        intervalFn = eachMonthOfInterval;
        formatFn = (date: Date) => format(date, 'MMM yyyy');
        break;
      case 'alltime': {
        useAllTime = true;
        // Find the earliest date from assets
        const dates = assets.map(a => parseISO(a.date)).filter(d => !isNaN(d.getTime()));
        startDate = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : subDays(now, 365);
        groupingFn = (date: Date) => format(startOfMonth(date), 'yyyy-MM');
        intervalFn = eachMonthOfInterval;
        formatFn = (date: Date) => format(date, 'MMM yyyy');
        break;
      }
      default:
        startDate = subMonths(now, 1);
        groupingFn = (date: Date) => format(startOfDay(date), 'yyyy-MM-dd');
        intervalFn = eachDayOfInterval;
        formatFn = (date: Date) => format(date, 'MMM dd');
    }

    // Filter assets by date range (for all time, include all assets)
    const filteredAssets = useAllTime 
      ? assets 
      : assets.filter((asset) => {
          const assetDate = parseISO(asset.date);
          return isAfter(assetDate, startDate);
        });

    // Group downloads by date
    const downloadsByDate = new Map<string, number>();
    filteredAssets.forEach((asset) => {
      const assetDate = parseISO(asset.date);
      const key = groupingFn(assetDate);
      downloadsByDate.set(key, (downloadsByDate.get(key) || 0) + asset.downloadCount);
    });

    // Generate all dates in range for proper x-axis
    const allDates = intervalFn({ start: startDate, end: now });
    
    // Special handling for monthly grouping in 365 days view and all time
    let labels: string[];
    let data: number[];
    
    if (selectedRange === '365days' || selectedRange === 'alltime') {
      // Group by month for yearly view
      const monthlyData = new Map<string, number>();
      allDates.forEach((date) => {
        const key = format(startOfMonth(date), 'yyyy-MM');
        if (!monthlyData.has(key)) {
          monthlyData.set(key, downloadsByDate.get(key) || 0);
        }
      });
      
      labels = Array.from(monthlyData.keys()).map(key => {
        const [year, month] = key.split('-');
        return format(new Date(parseInt(year), parseInt(month) - 1), 'MMM yyyy');
      });
      data = Array.from(monthlyData.values());
    } else {
      labels = allDates.map(formatFn);
      data = allDates.map((date) => downloadsByDate.get(groupingFn(date)) || 0);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Downloads',
          data,
          fill: true,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
          pointRadius: (selectedRange === '365days' || selectedRange === 'alltime') ? 4 : 3,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [assets, selectedRange]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: { parsed: { y: number | null } }) => {
            const value = context.parsed.y ?? 0;
            return `${value.toLocaleString()} downloads`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number | string) => {
            if (typeof value === 'number') {
              return value.toLocaleString();
            }
            return value;
          },
        },
      },
    },
  };

  const totalDownloads = chartData.datasets[0].data.reduce((sum, val) => sum + val, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <h3 className="text-lg font-semibold text-gray-800">Downloads Over Time</h3>
        <div className="flex flex-wrap gap-2">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => setSelectedRange(range.value)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                selectedRange === range.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Total in period: <span className="font-semibold">{totalDownloads.toLocaleString()}</span> downloads
      </p>
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
