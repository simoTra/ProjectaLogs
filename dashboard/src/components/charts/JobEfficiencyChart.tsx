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

interface JobEfficiencyResponse {
  filamentEfficiency: {
    avgFilamentPerHour: number;
    topEfficientJobs: Array<{
      filename: string;
      filament_used: number;
      print_duration: number;
      efficiency: number;
    }>;
  };
  timeEfficiency: {
    avgJobDuration: number;
    medianJobDuration: number;
  };
  slicerComparison: Array<{
    slicer: string;
    avgTime: number;
    avgFilament: number;
    jobCount: number;
  }>;
}

interface Props {
  data: JobEfficiencyResponse | null;
}

export const JobEfficiencyChart: React.FC<Props> = ({ data }) => {
  if (!data || !data.filamentEfficiency) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>No data available</div>;
  }
  
  const topJobs = data.filamentEfficiency.topEfficientJobs ? data.filamentEfficiency.topEfficientJobs.slice(0, 5) : [];
  const chartData = {
    labels: topJobs.map(item => item.filename.slice(0, 15) + '...'),
    datasets: [
      {
        label: 'Efficiency (g/h)',
        data: topJobs.map(item => Math.round(item.efficiency)),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
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
        text: 'Top Efficient Jobs by Filament Usage',
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context: any) {
            const dataIndex = context.dataIndex;
            const item = topJobs[dataIndex];
            return [
              `Filament: ${Math.round(item.filament_used)}g`,
              `Duration: ${Math.round(item.print_duration / 3600 * 100) / 100}h`,
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
          text: 'Efficiency (g/h)',
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