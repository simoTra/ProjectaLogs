import React from 'react';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface ProjectComplexityData {
  projectName: string;
  totalJobs: number;
  avgPrintTime: number;
  totalPrintTime: number;
  uniquePrinters: number;
}

interface Props {
  data: ProjectComplexityData[] | null;
}

export const ProjectComplexityChart: React.FC<Props> = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>No data available</div>;
  }
  const chartData = {
    datasets: [
      {
        label: 'Project Complexity',
        data: data.map(item => ({
          x: item.totalJobs,
          y: Math.round(item.avgPrintTime / 3600 * 100) / 100, // Convert to hours
          projectName: item.projectName,
          totalPrintTime: Math.round(item.totalPrintTime / 3600 * 100) / 100,
          uniquePrinters: item.uniquePrinters,
        })),
        backgroundColor: data.map((_, index) => {
          const colors = [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 205, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
          ];
          return colors[index % colors.length];
        }),
        pointRadius: 8,
        pointHoverRadius: 10,
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
        text: 'Project Complexity Analysis',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const point = context.raw;
            return [
              `Project: ${point.projectName}`,
              `Jobs: ${point.x}`,
              `Avg Print Time: ${point.y}h`,
              `Total Print Time: ${point.totalPrintTime}h`,
              `Printers Used: ${point.uniquePrinters}`,
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Total Jobs',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Average Print Time (hours)',
        },
      },
    },
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <Scatter data={chartData} options={options} />
    </div>
  );
};