'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface LineChartComponentProps {
  data: {
    labels: string[]
    messagesData: number[]
    callsData: number[]
  }
}

export default function LineChartComponent({ data }: LineChartComponentProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Messages',
        data: data.messagesData,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#7c3aed',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      {
        label: 'Calls',
        data: data.callsData,
        borderColor: '#a78bfa',
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#a78bfa',
        pointBorderWidth: 2,
        pointRadius: 4,
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
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.04)',
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
    <div className="bg-white rounded-2xl border border-oyik-border shadow-[0_2px_8px_rgba(124,58,237,0.05)] p-5 h-[300px]">
      <h3 className="text-sm font-semibold text-oyik-navy mb-4">Messages & Calls Over Time</h3>
      <div className="h-[230px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}
