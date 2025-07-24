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
      {/* Modern Laporan Table */}
<div className="mt-8 space-y-6">
  <div className="backdrop-blur-xl bg-white/80 border border-white/20 shadow-2xl shadow-green-500/10 rounded-2xl overflow-hidden">
    {/* Header */}
    <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-b border-white/20 px-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
              Laporan Penjualan & Keuntungan
            </h2>
            <p className="text-sm text-gray-500 mt-1">Data performa bisnis terkini</p>
          </div>
        </div>
        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
          {tableData.length} Periode
        </div>
      </div>
    </div>

    {/* Table Content */}
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/50">
            <th className="text-left px-6 py-4 font-semibold text-gray-700">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Periode</span>
              </div>
            </th>
            <th className="text-left px-6 py-4 font-semibold text-gray-700">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>Kue Terjual</span>
              </div>
            </th>
            <th className="text-left px-6 py-4 font-semibold text-gray-700">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span>Total Keuntungan</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200/30">
          {tableData.length > 0 ? (
            tableData.map(item => (
              <tr 
                key={item.period}
                className="group hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 transition-all duration-300"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center group-hover:from-green-200 group-hover:to-emerald-200 transition-colors">
                      <span className="text-sm font-semibold text-green-700">
                        {item.period.split('-')[1] || item.period.slice(-2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.period}</p>
                      <p className="text-xs text-gray-500">{filter === 'monthly' ? 'Bulanan' : filter === 'weekly' ? 'Mingguan' : 'Harian'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <p className="text-lg font-bold text-gray-900">
                        {item.sold.toLocaleString()}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min((item.sold / Math.max(...tableData.map(d => d.sold))) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      Rp {item.profit.toLocaleString()}
                    </p>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Tidak ada data untuk periode ini</p>
                    <p className="text-sm text-gray-400">Data akan muncul setelah ada transaksi</p>
                  </div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* Summary Footer */}
    {tableData.length > 0 && (
      <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-t border-white/20 px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Periode</p>
            <p className="text-2xl font-bold text-green-700">{tableData.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Kue Terjual</p>
            <p className="text-2xl font-bold text-green-700">
              {tableData.reduce((sum, item) => sum + item.sold, 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Keuntungan</p>
            <p className="text-2xl font-bold text-green-700">
              Rp {tableData.reduce((sum, item) => sum + item.profit, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    )}
  </div>
</div>
    </div>
    
  );
}