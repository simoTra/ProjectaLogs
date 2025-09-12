import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PrinterWorkloadData {
  printerName: string;
  jobCount: number;
  percentage: number;
  totalPrintTime: number;
  timePercentage: number;
}

interface Props {
  data: PrinterWorkloadData[] | null;
}

export const PrinterWorkloadChart: React.FC<Props> = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>No data available</div>;
  }
  const colors = [
    'rgba(255, 99, 132, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 205, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)',
  ];

  const chartData = {
    labels: data.map(item => item.printerName),
    datasets: [
      {
        label: 'Job Distribution',
        data: data.map(item => item.jobCount),
        backgroundColor: colors.slice(0, data.length),
        borderColor: colors.slice(0, data.length).map(color => color.replace('0.8', '1')),
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
      },
      title: {
        display: true,
        text: 'Printer Workload Distribution',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const dataIndex = context.dataIndex;
            const item = data[dataIndex];
            return [
              `${item.printerName}`,
              `Jobs: ${item.jobCount} (${item.percentage}%)`,
              `Print Time: ${Math.round(item.totalPrintTime / 3600 * 100) / 100}h (${item.timePercentage}%)`,
            ];
          }
        }
      }
    },
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};