import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PrinterUtilizationData {
  printerName: string;
  totalJobs: number;
  totalPrintTime: number;
  avgJobsPerDay: number;
  utilizationScore: number;
}

interface Props {
  data: PrinterUtilizationData[] | null;
}

export const PrinterUtilizationChart: React.FC<Props> = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>No data available</div>;
  }
  const chartData = {
    labels: data.map(item => item.printerName),
    datasets: [
      {
        label: 'Utilization Score (hours/day)',
        data: data.map(item => Math.round(item.utilizationScore * 100) / 100),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Avg Jobs/Day',
        data: data.map(item => Math.round(item.avgJobsPerDay * 100) / 100),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
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
        text: 'Printer Utilization Rates',
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context: any) {
            const dataIndex = context.dataIndex;
            const item = data[dataIndex];
            return [
              `Total Jobs: ${item.totalJobs}`,
              `Total Print Time: ${Math.round(item.totalPrintTime / 3600 * 100) / 100}h`,
            ];
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Utilization Score (hours/day)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Jobs per Day',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};