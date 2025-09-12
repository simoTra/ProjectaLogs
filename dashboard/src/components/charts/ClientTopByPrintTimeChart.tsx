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

interface ClientPrintTimeData {
  name: string;
  totalPrintTime: number;
  jobCount?: number;
}

interface Props {
  data: ClientPrintTimeData[] | null;
}

export const ClientTopByPrintTimeChart: React.FC<Props> = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>No data available</div>;
  }

  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        label: 'Total Print Time (hours)',
        data: data.map(item => Math.round(item.totalPrintTime / 3600 * 100) / 100),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgba(53, 162, 235, 1)',
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
        text: 'Top Clients by Print Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Print Time (hours)',
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