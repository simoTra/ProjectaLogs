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

interface PrinterReliabilityData {
  printerName: string;
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  successRate: number;
  avgJobDuration: number;
}

interface Props {
  data: PrinterReliabilityData[] | null;
}

export const PrinterReliabilityChart: React.FC<Props> = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>No data available</div>;
  }
  const chartData = {
    labels: data.map(item => item.printerName),
    datasets: [
      {
        label: 'Success Rate (%)',
        data: data.map(item => item.successRate),
        backgroundColor: data.map(item => 
          item.successRate >= 80 ? 'rgba(75, 192, 192, 0.6)' :
          item.successRate >= 60 ? 'rgba(255, 205, 86, 0.6)' :
          'rgba(255, 99, 132, 0.6)'
        ),
        borderColor: data.map(item => 
          item.successRate >= 80 ? 'rgba(75, 192, 192, 1)' :
          item.successRate >= 60 ? 'rgba(255, 205, 86, 1)' :
          'rgba(255, 99, 132, 1)'
        ),
        borderWidth: 1,
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
        text: 'Printer Reliability Comparison',
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context: any) {
            const dataIndex = context.dataIndex;
            const item = data[dataIndex];
            return [
              `Total Jobs: ${item.totalJobs}`,
              `Completed: ${item.completedJobs}`,
              `Failed: ${item.failedJobs}`,
              `Avg Duration: ${Math.round(item.avgJobDuration / 3600 * 100) / 100}h`,
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Success Rate (%)',
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