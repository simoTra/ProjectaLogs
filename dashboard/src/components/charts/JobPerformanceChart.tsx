import React from 'react';
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
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface JobPerformanceItem {
  filename: string;
  actualTime: number;
  estimatedTime: number;
  variance: number;
  variancePercent: number;
}

interface Props {
  data: JobPerformanceItem[] | null;
}

export const JobPerformanceChart: React.FC<Props> = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>No data available</div>;
  }
  
  // Take the top 10 jobs by variance for display
  const sortedData = data.slice(0, 10);
  
  if (sortedData.length === 0) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>No data available</div>;
  }

  const chartData = {
    labels: sortedData.map(item => item.filename.slice(0, 20) + '...'), // Truncate filename
    datasets: [
      {
        label: 'Actual Time (hours)',
        data: sortedData.map(item => Math.round(item.actualTime / 3600 * 100) / 100),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        yAxisID: 'y',
      },
      {
        label: 'Estimated Time (hours)',
        data: sortedData.map(item => Math.round(item.estimatedTime / 3600 * 100) / 100),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1,
        yAxisID: 'y',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Job Performance Analysis - Actual vs Estimated Times',
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context: any) {
            const dataIndex = context.dataIndex;
            const item = sortedData[dataIndex];
            return [
              `Variance: ${Math.round(item.variance / 3600 * 100) / 100}h`,
              `Variance: ${item.variancePercent.toFixed(1)}%`,
            ];
          }
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Time (hours)',
        },
      },
    },
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};