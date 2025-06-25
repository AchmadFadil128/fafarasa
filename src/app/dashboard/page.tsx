"use client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

export default function Dashboard() {
  const [chartData, setChartData] = useState({ labels: [], sales: [], profits: [] });

  useEffect(() => {
    const fetchChartData = async () => {
      const today = new Date();
      const days = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push(d.toISOString().slice(0, 10));
      }
      const allEntries = await Promise.all(
        days.map(async (date) => {
          const res = await fetch(`/api/daily-entry?date=${date}`);
          const data = await res.json();
          return { date, entries: data };
        })
      );
      const labels = [];
      const sales = [];
      const profits = [];
      allEntries.forEach(({ date, entries }) => {
        let totalSold = 0;
        let totalProfit = 0;
        entries.forEach(entry => {
          if (entry.remainingStock !== null && entry.initialStock !== null) {
            const sold = entry.initialStock - entry.remainingStock;
            totalSold += sold;
            totalProfit += sold * (entry.cake.sellingPrice - entry.cake.purchasePrice);
          }
        });
        labels.push(date.slice(5));
        sales.push(totalSold);
        profits.push(totalProfit);
      });
      setChartData({ labels, sales, profits });
    };
    fetchChartData();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto py-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-green-700">Dashboard Performa & Keuntungan</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4 border border-green-100">
          <h2 className="text-base font-semibold mb-2 text-green-700">Grafik Penjualan (Kue Terjual per Hari)</h2>
          <Bar
            data={{
              labels: chartData.labels,
              datasets: [
                {
                  label: 'Kue Terjual',
                  data: chartData.sales,
                  backgroundColor: 'rgba(34,197,94,0.7)',
                  borderRadius: 6,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: false },
              },
              scales: {
                y: { beginAtZero: true },
              },
            }}
            height={220}
          />
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-green-100">
          <h2 className="text-base font-semibold mb-2 text-green-700">Grafik Keuntungan (Rp per Hari)</h2>
          <Line
            data={{
              labels: chartData.labels,
              datasets: [
                {
                  label: 'Keuntungan',
                  data: chartData.profits,
                  borderColor: 'rgba(34,197,94,1)',
                  backgroundColor: 'rgba(34,197,94,0.2)',
                  tension: 0.3,
                  fill: true,
                  pointRadius: 3,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: false },
                tooltip: {
                  callbacks: {
                    label: (ctx) => `Rp${ctx.parsed.y.toLocaleString()}`,
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (v) => 'Rp' + v.toLocaleString(),
                  },
                },
              },
            }}
            height={220}
          />
        </div>
      </div>
    </div>
  );
} 