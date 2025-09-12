import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface JobSuccessData {
  status: string;
  count: number;
  percentage: number;
}

interface JobSuccessResponse {
  byStatus: JobSuccessData[];
}

interface Props {
  data: JobSuccessResponse | null;
}

export const JobSuccessRateChart: React.FC<Props> = ({ data }) => {
  if (!data || !data.byStatus || !Array.isArray(data.byStatus) || data.byStatus.length === 0) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>No data available</div>;
  }
  
  const statusData = data.byStatus;
  const statusColors = {
    completed: 'rgba(75, 192, 192, 0.8)',
    error: 'rgba(255, 99, 132, 0.8)',
    cancelled: 'rgba(255, 159, 64, 0.8)',
    in_progress: 'rgba(54, 162, 235, 0.8)',
    klippy_shutdown: 'rgba(153, 102, 255, 0.8)',
    default: 'rgba(201, 203, 207, 0.8)',
  };

  const chartData = {
    labels: statusData.map(item => `${item.status} (${item.count})`),
    datasets: [
      {
        label: 'Job Status',
        data: statusData.map(item => item.count),
        backgroundColor: statusData.map(item => 
          statusColors[item.status as keyof typeof statusColors] || statusColors.default
        ),
        borderColor: statusData.map(item => 
          statusColors[item.status as keyof typeof statusColors]?.replace('0.8', '1') || 
          statusColors.default.replace('0.8', '1')
        ),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Job Status Distribution',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const item = statusData[context.dataIndex];
            return `${item.status}: ${item.count} jobs (${item.percentage.toFixed(1)}%)`;
          }
        }
      }
    },
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};