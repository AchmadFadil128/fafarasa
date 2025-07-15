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

// Definisikan tipe data untuk state grafik dan data dari API
interface ChartDataState {
  labels: string[];
  sales: number[];
  profits: number[];
}

interface DailyEntry {
  initialStock: number | null;
  remainingStock: number | null;
  cake: {
    sellingPrice: number;
    purchasePrice: number;
  };
}

// Helper function to get the start of the week for a given date
const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

interface ReportDataItem {
  period: string;
  sold: number;
  profit: number;
}

export default function Dashboard() {
  const [chartData, setChartData] = useState<ChartDataState>({ labels: [], sales: [], profits: [] });
  const [tableData, setTableData] = useState<ReportDataItem[]>([]);
  const [filter, setFilter] = useState('daily'); // daily, weekly, monthly

  useEffect(() => {
    const fetchReportData = async () => {
      const today = new Date();
      let startDate = new Date();
      const allDays: { date: Date, entries: DailyEntry[] }[] = [];

      // 1. Tentukan rentang tanggal & fetch data harian
      if (filter === 'daily') {
        startDate.setDate(today.getDate() - 13);
      } else if (filter === 'weekly') {
        startDate = getStartOfWeek(today);
        startDate.setDate(startDate.getDate() - (7 * 7)); // 8 minggu lalu
      } else if (filter === 'monthly') {
        startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1); // 12 bulan lalu
      }

      for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().slice(0, 10);
        const res = await fetch(`/api/daily-entry?date=${dateStr}`);
        const data = await res.json();
        allDays.push({ date: new Date(d), entries: data });
      }

      // 2. Proses dan agregasi data
      const aggregatedData: { [key: string]: { sold: number, profit: number } } = {};

      allDays.forEach(({ date, entries }) => {
        let key = '';
        if (filter === 'daily') {
          key = date.toISOString().slice(5, 10); // MM-DD
        } else if (filter === 'weekly') {
          const weekStart = getStartOfWeek(date);
          key = `W${weekStart.toISOString().slice(5, 10)}`;
        } else if (filter === 'monthly') {
          key = date.toISOString().slice(0, 7); // YYYY-MM
        }

        if (!aggregatedData[key]) aggregatedData[key] = { sold: 0, profit: 0 };

        entries.forEach(entry => {
          if (entry.remainingStock !== null && entry.initialStock !== null) {
            const sold = entry.initialStock - entry.remainingStock;
            aggregatedData[key].sold += sold;
            aggregatedData[key].profit += sold * (entry.cake.sellingPrice - entry.cake.purchasePrice);
          }
        });
      });

      // 3. Siapkan data untuk chart dan tabel
      const labels = Object.keys(aggregatedData);
      const sales = labels.map(k => aggregatedData[k].sold);
      const profits = labels.map(k => aggregatedData[k].profit);
      const newTableData = labels.map(k => ({
        period: k,
        sold: aggregatedData[k].sold,
        profit: aggregatedData[k].profit,
      })).reverse();

      setChartData({ labels, sales, profits });
      setTableData(newTableData);
    };

    fetchReportData();
  }, [filter]);

  return (
    <div className="w-full max-w-5xl mx-auto py-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-green-700">Dashboard Performa & Keuntungan</h1>
      
      {/* Filter Buttons */}
      <div className="flex justify-center gap-2 mb-6">
        <button onClick={() => setFilter('daily')} className={`px-4 py-1 rounded ${filter === 'daily' ? 'bg-green-700 text-white' : 'bg-gray-200'}`}>Harian</button>
        <button onClick={() => setFilter('weekly')} className={`px-4 py-1 rounded ${filter === 'weekly' ? 'bg-green-700 text-white' : 'bg-gray-200'}`}>Mingguan</button>
        <button onClick={() => setFilter('monthly')} className={`px-4 py-1 rounded ${filter === 'monthly' ? 'bg-green-700 text-white' : 'bg-gray-200'}`}>Bulanan</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4 border border-green-100">
          <h2 className="text-base font-semibold mb-2 text-green-700">Grafik Penjualan (Kue Terjual per Hari)</h2>
          <div style={{ height: '220px' }}>
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
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  title: { display: false },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-green-100">
          <h2 className="text-base font-semibold mb-2 text-green-700">Grafik Keuntungan (Rp per Hari)</h2>
          <div style={{ height: '220px' }}>
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
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  title: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx: { parsed: { y: number } }) => `Rp${ctx.parsed.y.toLocaleString()}`,
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (v: string | number) => 'Rp' + Number(v).toLocaleString(),
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabel Laporan */}
      <div className="mt-8 bg-white rounded-lg shadow p-4 border border-green-100">
        <h2 className="text-base font-semibold mb-2 text-green-700">Laporan Penjualan & Keuntungan</h2>
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Periode</th>
                <th className="border px-2 py-1">Kue Terjual</th>
                <th className="border px-2 py-1">Total Keuntungan</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map(item => (
                <tr key={item.period}>
                  <td className="border px-2 py-1">{item.period}</td>
                  <td className="border px-2 py-1">{item.sold.toLocaleString()}</td>
                  <td className="border px-2 py-1">Rp{item.profit.toLocaleString()}</td>
                </tr>
              ))}
              {tableData.length === 0 && (
                <tr><td colSpan={3} className="text-center py-2">Tidak ada data untuk periode ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 