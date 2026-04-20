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
import { useSession } from 'next-auth/react';

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

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const getEndOfWeek = (date: Date) => {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
};

const formatDateIso = (date: Date) => date.toISOString().slice(0, 10);

interface ReportDataItem {
  period: string;
  sold: number;
  profit: number;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [chartData, setChartData] = useState<ChartDataState>({ labels: [], sales: [], profits: [] });
  const [tableData, setTableData] = useState<ReportDataItem[]>([]);
  const [filter, setFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [loading, setLoading] = useState(false);
  const [visibleRows, setVisibleRows] = useState(12);

  const today = new Date();
  const todayIso = formatDateIso(today);
  const fourteenDaysAgoIso = formatDateIso(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 13));
  const eightWeeksAgoIso = formatDateIso(new Date(today.getFullYear(), today.getMonth(), today.getDate() - (7 * 7)));
  const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1).toISOString().slice(0, 7);
  const thisMonth = today.toISOString().slice(0, 7);

  const [dailyStartDate, setDailyStartDate] = useState(fourteenDaysAgoIso);
  const [dailyEndDate, setDailyEndDate] = useState(todayIso);
  const [weeklyStartDate, setWeeklyStartDate] = useState(eightWeeksAgoIso);
  const [weeklyEndDate, setWeeklyEndDate] = useState(todayIso);
  const [monthlyStart, setMonthlyStart] = useState(twelveMonthsAgo);
  const [monthlyEnd, setMonthlyEnd] = useState(thisMonth);

  useEffect(() => {
    setVisibleRows(12);
  }, [filter, dailyStartDate, dailyEndDate, weeklyStartDate, weeklyEndDate, monthlyStart, monthlyEnd]);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      let startDate: Date;
      let endDate: Date;
      const allDays: { date: Date, entries: DailyEntry[] }[] = [];

      if (filter === 'daily') {
        startDate = new Date(dailyStartDate);
        endDate = new Date(dailyEndDate);
      } else if (filter === 'weekly') {
        startDate = getStartOfWeek(new Date(weeklyStartDate));
        endDate = getEndOfWeek(new Date(weeklyEndDate));
      } else if (filter === 'monthly') {
        startDate = new Date(`${monthlyStart}-01T00:00:00`);
        const endMonthDate = new Date(`${monthlyEnd}-01T00:00:00`);
        endDate = new Date(endMonthDate.getFullYear(), endMonthDate.getMonth() + 1, 0);
      } else {
        startDate = new Date(dailyStartDate);
        endDate = new Date(dailyEndDate);
      }

      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate > endDate) {
        setChartData({ labels: [], sales: [], profits: [] });
        setTableData([]);
        setLoading(false);
        return;
      }

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().slice(0, 10);
        const res = await fetch(`/api/daily-entry?date=${dateStr}`);
        const data = await res.json();
        allDays.push({ date: new Date(d), entries: data });
      }

      const aggregatedData: { [key: string]: { sold: number, profit: number } } = {};

      allDays.forEach(({ date, entries }) => {
        let key = '';
        if (filter === 'daily') {
          key = formatDateIso(date);
        } else if (filter === 'weekly') {
          const weekStart = getStartOfWeek(date);
          const weekEnd = getEndOfWeek(date);
          key = `${formatDateIso(weekStart)} s/d ${formatDateIso(weekEnd)}`;
        } else if (filter === 'monthly') {
          key = date.toISOString().slice(0, 7);
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
      setLoading(false);
    };

    fetchReportData();
  }, [filter, dailyStartDate, dailyEndDate, weeklyStartDate, weeklyEndDate, monthlyStart, monthlyEnd]);

  const displayedTableData = tableData.slice(0, visibleRows);

  return (
    <div className="w-full max-w-5xl mx-auto py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="air-title">Dashboard Performa & Keuntungan</h1>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Welcome, <span className="font-semibold">{session?.user?.username}</span></p>
            <p className="text-xs text-gray-500">Role: {session?.user?.role}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        <button onClick={() => setFilter('daily')} className={`px-4 py-1 rounded-full ${filter === 'daily' ? 'bg-[#222222] text-white' : 'bg-[#f2f2f2]'}`}>Harian</button>
        <button onClick={() => setFilter('weekly')} className={`px-4 py-1 rounded-full ${filter === 'weekly' ? 'bg-[#222222] text-white' : 'bg-[#f2f2f2]'}`}>Mingguan</button>
        <button onClick={() => setFilter('monthly')} className={`px-4 py-1 rounded-full ${filter === 'monthly' ? 'bg-[#222222] text-white' : 'bg-[#f2f2f2]'}`}>Bulanan</button>
      </div>

      <div className="air-card p-4 mb-6">
        {filter === 'daily' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block air-label mb-1">Tanggal mulai</label>
              <input type="date" value={dailyStartDate} onChange={(e) => setDailyStartDate(e.target.value)} className="air-input w-full px-3 py-2" />
            </div>
            <div>
              <label className="block air-label mb-1">Tanggal akhir</label>
              <input type="date" value={dailyEndDate} onChange={(e) => setDailyEndDate(e.target.value)} className="air-input w-full px-3 py-2" />
            </div>
          </div>
        )}
        {filter === 'weekly' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block air-label mb-1">Minggu mulai (pilih tanggal)</label>
              <input type="date" value={weeklyStartDate} onChange={(e) => setWeeklyStartDate(e.target.value)} className="air-input w-full px-3 py-2" />
            </div>
            <div>
              <label className="block air-label mb-1">Minggu akhir (pilih tanggal)</label>
              <input type="date" value={weeklyEndDate} onChange={(e) => setWeeklyEndDate(e.target.value)} className="air-input w-full px-3 py-2" />
            </div>
          </div>
        )}
        {filter === 'monthly' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block air-label mb-1">Bulan mulai</label>
              <input type="month" value={monthlyStart} onChange={(e) => setMonthlyStart(e.target.value)} className="air-input w-full px-3 py-2" />
            </div>
            <div>
              <label className="block air-label mb-1">Bulan akhir</label>
              <input type="month" value={monthlyEnd} onChange={(e) => setMonthlyEnd(e.target.value)} className="air-input w-full px-3 py-2" />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="air-card p-4">
          <h2 className="air-card-title mb-2">Grafik Penjualan</h2>
          <div style={{ height: '220px' }}>
            <Bar
              data={{
                labels: chartData.labels,
                datasets: [
                  {
                    label: 'Kue Terjual',
                    data: chartData.sales,
                    backgroundColor: 'rgba(255,56,92,0.72)',
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
        <div className="air-card p-4">
          <h2 className="air-card-title mb-2">Grafik Keuntungan</h2>
          <div style={{ height: '220px' }}>
            <Line
              data={{
                labels: chartData.labels,
                datasets: [
                  {
                    label: 'Keuntungan',
                    data: chartData.profits,
                    borderColor: 'rgba(255,56,92,1)',
                    backgroundColor: 'rgba(255,56,92,0.2)',
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
      <div className="mt-8 space-y-6">
        <div className="air-card overflow-hidden">
          <div className="air-header px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[#ff385c] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h2 className="air-section-title">Laporan Penjualan & Keuntungan</h2>
                  <p className="air-subtitle mt-1">Data performa bisnis sesuai rentang yang dipilih</p>
                </div>
              </div>
              <div className="air-pill px-3 py-1 text-sm font-medium">{tableData.length} Periode</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full air-table">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/50">
                  <th className="text-left px-6 py-4">Periode</th>
                  <th className="text-left px-6 py-4">Kue Terjual</th>
                  <th className="text-left px-6 py-4">Total Keuntungan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/30">
                {!loading && displayedTableData.length > 0 ? (
                  displayedTableData.map((item) => (
                    <tr key={item.period} className="group hover:bg-[#fcfcfc] transition-all duration-300">
                      <td className="px-6 py-4">{item.period}</td>
                      <td className="px-6 py-4">{item.sold.toLocaleString()}</td>
                      <td className="px-6 py-4">Rp {item.profit.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center">
                      <p className="text-gray-500">{loading ? 'Memuat data...' : 'Tidak ada data untuk periode ini.'}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {tableData.length > 0 && (
            <div className="bg-[#fafafa] border-t border-[#ececec] px-6 py-4">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="text-sm text-gray-600">
                  Menampilkan {Math.min(visibleRows, tableData.length)} dari {tableData.length} periode
                </div>
                <div className="flex gap-2">
                  {visibleRows < tableData.length && (
                    <button className="air-btn-secondary px-4 py-2 text-sm" onClick={() => setVisibleRows((prev) => prev + 12)}>
                      Show more
                    </button>
                  )}
                  {visibleRows > 12 && (
                    <button className="air-btn-secondary px-4 py-2 text-sm" onClick={() => setVisibleRows(12)}>
                      Tampilkan awal
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}