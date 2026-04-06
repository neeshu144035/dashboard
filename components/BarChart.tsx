'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface BarChartProps {
  data: {
    labels: string[]
    values: number[]
  }
}

export default function BarChartComponent({ data }: BarChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Response Rate',
        data: data.values,
        backgroundColor: '#7c3aed',
        borderRadius: 6,
        barThickness: 24,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#1e1b4b',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.04)',
        },
        ticks: {
          color: '#9ca3af',
        },
      },
    },
  }

  return (
    <div className="bg-white rounded-2xl border border-oyik-border shadow-[0_2px_8px_rgba(124,58,237,0.05)] p-5 h-[300px] flex flex-col">
      <h3 className="text-sm font-semibold text-oyik-navy mb-4">Daily Response Rate</h3>
      <div className="flex-1">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}
