'use client'

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface DonutChartProps {
  data: {
    labels: string[]
    values: number[]
  }
}

export default function DonutChart({ data }: DonutChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: ['#7c3aed', '#a78bfa', '#ddd6fe'],
        borderWidth: 0,
        cutout: '70%',
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
  }

  return (
    <div className="bg-white rounded-2xl border border-oyik-border shadow-[0_2px_8px_rgba(124,58,237,0.05)] p-5 h-[300px] flex flex-col">
      <h3 className="text-sm font-semibold text-oyik-navy mb-4">Channel Distribution</h3>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-[180px] h-[180px]">
          <Doughnut data={chartData} options={options} />
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-4">
        {data.labels.map((label, index) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: ['#7c3aed', '#a78bfa', '#ddd6fe'][index] }}
            />
            <span className="text-xs text-oyik-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
