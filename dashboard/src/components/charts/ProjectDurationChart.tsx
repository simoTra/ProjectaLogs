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

interface ProjectDurationData {
  projectName: string;
  startDate: string;
  endDate: string;
  durationInDays: number;
  totalJobs: number;
}

interface Props {
  data: ProjectDurationData[] | null;
}

export const ProjectDurationChart: React.FC<Props> = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>No data available</div>;
  }
  
  const sortedData = data.sort((a, b) => a.durationInDays - b.durationInDays);

  const chartData = {
    labels: sortedData.map(item => item.projectName),
    datasets: [
      {
        label: 'Project Duration (days)',
        data: sortedData.map(item => item.durationInDays),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
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
        text: 'Project Duration Timeline',
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context: any) {
            const dataIndex = context.dataIndex;
            const item = sortedData[dataIndex];
            return [
              `Start: ${new Date(item.startDate).toLocaleDateString()}`,
              `End: ${item.endDate ? new Date(item.endDate).toLocaleDateString() : 'Ongoing'}`,
              `Jobs: ${item.totalJobs}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Duration (days)',
        },
      },
      x: {
        display: false, // Hide x-axis labels to avoid crowding
      },
    },
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};