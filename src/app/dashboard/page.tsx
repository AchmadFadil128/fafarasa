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
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

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

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChartDataState {
  labels: string[];
  sales: number[];
  profits: number[];
}

interface DailyEntry {
  date: string;
  initialStock: number | null;
  remainingStock: number | null;
  cake: {
    sellingPrice: number;
    purchasePrice: number;
  };
}

interface ReportDataItem {
  period: string;
  sold: number;
  revenue: number;
  profit: number;
}

interface AggregatedPeriodData extends ReportDataItem {
  sortDate: Date;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDateIso = (date: Date) => date.toISOString().slice(0, 10);

const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  return d;
};

const getEndOfWeek = (date: Date): Date => {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
};

const EMPTY_CHART: ChartDataState = { labels: [], sales: [], profits: [] };

// ─── Component ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { data: session } = useSession();

  const [chartData, setChartData] = useState<ChartDataState>(EMPTY_CHART);
  const [tableData, setTableData] = useState<ReportDataItem[]>([]);
  const [filter, setFilter] = useState<"daily" | "weekly" | "monthly">("daily");
  const [loading, setLoading] = useState(false);
  const [visibleRows, setVisibleRows] = useState(12);

  const today = new Date();
  const todayIso = formatDateIso(today);

  const [dailyStartDate, setDailyStartDate] = useState(
    formatDateIso(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 13))
  );
  const [dailyEndDate, setDailyEndDate] = useState(todayIso);

  const [weeklyStartDate, setWeeklyStartDate] = useState(
    formatDateIso(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 49))
  );
  const [weeklyEndDate, setWeeklyEndDate] = useState(todayIso);

  const [monthlyStart, setMonthlyStart] = useState(
    new Date(today.getFullYear(), today.getMonth() - 11, 1).toISOString().slice(0, 7)
  );
  const [monthlyEnd, setMonthlyEnd] = useState(todayIso.slice(0, 7));

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleRows(12);
  }, [filter, dailyStartDate, dailyEndDate, weeklyStartDate, weeklyEndDate, monthlyStart, monthlyEnd]);

  // Fetch and process report data
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);

      try {
        let startDate: Date;
        let endDate: Date;

        if (filter === "daily") {
          startDate = new Date(dailyStartDate);
          endDate = new Date(dailyEndDate);
        } else if (filter === "weekly") {
          startDate = getStartOfWeek(new Date(weeklyStartDate));
          endDate = getEndOfWeek(new Date(weeklyEndDate));
        } else {
          startDate = new Date(`${monthlyStart}-01T00:00:00`);
          const endMonthDate = new Date(`${monthlyEnd}-01T00:00:00`);
          endDate = new Date(endMonthDate.getFullYear(), endMonthDate.getMonth() + 1, 0);
        }

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
          setChartData(EMPTY_CHART);
          setTableData([]);
          return;
        }

        const res = await fetch(
          `/api/daily-entry?startDate=${formatDateIso(startDate)}&endDate=${formatDateIso(endDate)}`
        );

        if (!res.ok) {
          setChartData(EMPTY_CHART);
          setTableData([]);
          return;
        }

        const entries: DailyEntry[] = await res.json();
        const aggregatedData = new Map<string, AggregatedPeriodData>();

        entries.forEach((entry) => {
          const date = new Date(entry.date);
          let key = "";
          let sortDate = new Date(date);

          if (filter === "daily") {
            key = formatDateIso(date);
          } else if (filter === "weekly") {
            const weekStart = getStartOfWeek(date);
            key = `${formatDateIso(weekStart)} s/d ${formatDateIso(getEndOfWeek(date))}`;
            sortDate = weekStart;
          } else {
            key = date.toISOString().slice(0, 7);
            sortDate = new Date(date.getFullYear(), date.getMonth(), 1);
          }

          if (!aggregatedData.has(key)) {
            aggregatedData.set(key, { period: key, sold: 0, revenue: 0, profit: 0, sortDate });
          }

          if (entry.initialStock !== null && entry.remainingStock !== null) {
            const sold = entry.initialStock - entry.remainingStock;
            const current = aggregatedData.get(key)!;
            current.sold += sold;
            current.revenue += sold * entry.cake.sellingPrice;
            current.profit += sold * (entry.cake.sellingPrice - entry.cake.purchasePrice);
          }
        });

        const allPeriods: AggregatedPeriodData[] = [];
        const emptyPeriod = (key: string, sortDate: Date): AggregatedPeriodData =>
          aggregatedData.get(key) ?? { period: key, sold: 0, revenue: 0, profit: 0, sortDate };

        if (filter === "daily") {
          const cursor = new Date(startDate);
          while (cursor <= endDate) {
            const key = formatDateIso(cursor);
            allPeriods.push(emptyPeriod(key, new Date(cursor)));
            cursor.setDate(cursor.getDate() + 1);
          }
        } else if (filter === "weekly") {
          const cursor = getStartOfWeek(new Date(startDate));
          while (cursor <= endDate) {
            const weekEnd = getEndOfWeek(new Date(cursor));
            const key = `${formatDateIso(cursor)} s/d ${formatDateIso(weekEnd)}`;
            allPeriods.push(emptyPeriod(key, new Date(cursor)));
            cursor.setDate(cursor.getDate() + 7);
          }
        } else {
          const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
          while (cursor <= endDate) {
            const key = cursor.toISOString().slice(0, 7);
            allPeriods.push(emptyPeriod(key, new Date(cursor)));
            cursor.setMonth(cursor.getMonth() + 1);
          }
        }

        const sortedData =
          allPeriods.length > 0
            ? allPeriods
            : Array.from(aggregatedData.values()).sort(
                (a, b) => a.sortDate.getTime() - b.sortDate.getTime()
              );

        setChartData({
          labels: sortedData.map((d) => d.period),
          sales: sortedData.map((d) => d.sold),
          profits: sortedData.map((d) => d.profit),
        });

        setTableData(
          [...sortedData]
            .reverse()
            .filter((d) => d.sold > 0 || d.revenue > 0 || d.profit > 0)
            .map(({ period, sold, revenue, profit }) => ({ period, sold, revenue, profit }))
        );
      } catch {
        setChartData(EMPTY_CHART);
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [filter, dailyStartDate, dailyEndDate, weeklyStartDate, weeklyEndDate, monthlyStart, monthlyEnd]);

  const displayedTableData = tableData.slice(0, visibleRows);
  const totalSold = tableData.reduce((sum, d) => sum + d.sold, 0);
  const totalRevenue = tableData.reduce((sum, d) => sum + d.revenue, 0);
  const totalProfit = tableData.reduce((sum, d) => sum + d.profit, 0);

  const spinnerUI = (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 rounded-lg backdrop-blur-[1px]">
      <div className="h-8 w-8 rounded-full border-4 border-gray-300 border-t-[#ff385c] animate-spin" />
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="air-title">Dashboard Performa & Keuntungan</h1>
        <div className="text-right">
          <p className="text-sm text-gray-600">
            Welcome, <span className="font-semibold">{session?.user?.username}</span>
          </p>
          <p className="text-xs text-gray-500">Role: {session?.user?.role}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center gap-2 mb-6">
        {(["daily", "weekly", "monthly"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1 rounded-full ${
              filter === f ? "bg-[#222222] text-white" : "bg-[#f2f2f2]"
            }`}
          >
            {f === "daily" ? "Harian" : f === "weekly" ? "Mingguan" : "Bulanan"}
          </button>
        ))}
      </div>

      {/* Date Range Inputs */}
      <div className="air-card p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filter === "daily" && (
            <>
              <div>
                <label className="block air-label mb-1">Tanggal mulai</label>
                <input type="date" value={dailyStartDate} onChange={(e) => setDailyStartDate(e.target.value)} className="air-input w-full px-3 py-2" />
              </div>
              <div>
                <label className="block air-label mb-1">Tanggal akhir</label>
                <input type="date" value={dailyEndDate} onChange={(e) => setDailyEndDate(e.target.value)} className="air-input w-full px-3 py-2" />
              </div>
            </>
          )}
          {filter === "weekly" && (
            <>
              <div>
                <label className="block air-label mb-1">Minggu mulai (pilih tanggal)</label>
                <input type="date" value={weeklyStartDate} onChange={(e) => setWeeklyStartDate(e.target.value)} className="air-input w-full px-3 py-2" />
              </div>
              <div>
                <label className="block air-label mb-1">Minggu akhir (pilih tanggal)</label>
                <input type="date" value={weeklyEndDate} onChange={(e) => setWeeklyEndDate(e.target.value)} className="air-input w-full px-3 py-2" />
              </div>
            </>
          )}
          {filter === "monthly" && (
            <>
              <div>
                <label className="block air-label mb-1">Bulan mulai</label>
                <input type="month" value={monthlyStart} onChange={(e) => setMonthlyStart(e.target.value)} className="air-input w-full px-3 py-2" />
              </div>
              <div>
                <label className="block air-label mb-1">Bulan akhir</label>
                <input type="month" value={monthlyEnd} onChange={(e) => setMonthlyEnd(e.target.value)} className="air-input w-full px-3 py-2" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="air-card p-4">
          <h2 className="air-card-title mb-2">Grafik Penjualan</h2>
          <div className={`relative transition-opacity duration-300 ${loading ? "opacity-70" : "opacity-100"}`} style={{ height: "220px" }}>
            {loading && spinnerUI}
            <Bar
              data={{
                labels: chartData.labels,
                datasets: [{ label: "Kue Terjual", data: chartData.sales, backgroundColor: "rgba(255,56,92,0.72)", borderRadius: 6 }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, title: { display: false } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </div>

        <div className="air-card p-4">
          <h2 className="air-card-title mb-2">Grafik Keuntungan</h2>
          <div className={`relative transition-opacity duration-300 ${loading ? "opacity-70" : "opacity-100"}`} style={{ height: "220px" }}>
            {loading && spinnerUI}
            <Line
              data={{
                labels: chartData.labels,
                datasets: [{
                  label: "Keuntungan",
                  data: chartData.profits,
                  borderColor: "rgba(255,56,92,1)",
                  backgroundColor: "rgba(255,56,92,0.2)",
                  tension: 0.3,
                  fill: true,
                  pointRadius: 3,
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  title: { display: false },
                  tooltip: {
                    callbacks: { label: (ctx: { parsed: { y: number } }) => `Rp${ctx.parsed.y.toLocaleString()}` },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { callback: (v: string | number) => "Rp" + Number(v).toLocaleString() },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Report Table */}
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
                  <th className="text-left px-6 py-4">Pendapatan Kotor</th>
                  <th className="text-left px-6 py-4">Total Keuntungan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/30">
                {!loading && displayedTableData.length > 0 ? (
                  displayedTableData.map((item) => (
                    <tr key={item.period} className="group hover:bg-[#fcfcfc] transition-all duration-300">
                      <td className="px-6 py-4">{item.period}</td>
                      <td className="px-6 py-4">{item.sold.toLocaleString()}</td>
                      <td className="px-6 py-4">Rp {item.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4">Rp {item.profit.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center">
                      {loading ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-8 w-8 rounded-full border-4 border-gray-300 border-t-[#ff385c] animate-spin" />
                          <div className="space-y-2 w-full max-w-sm mx-auto animate-pulse">
                            <div className="h-3 bg-gray-200 rounded" />
                            <div className="h-3 bg-gray-200 rounded w-5/6 mx-auto" />
                            <div className="h-3 bg-gray-200 rounded w-4/6 mx-auto" />
                          </div>
                          <p className="text-gray-500">Memuat data...</p>
                        </div>
                      ) : (
                        <p className="text-gray-500">Tidak ada data untuk periode ini.</p>
                      )}
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

      {/* Summary Stats */}
      {tableData.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Total Kue Terjual",
              value: totalSold.toLocaleString(),
              sub: "selama periode yang dipilih",
              icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
              valueClass: "text-gray-800",
            },
            {
              label: "Total Pendapatan Kotor",
              value: `Rp ${totalRevenue.toLocaleString()}`,
              sub: "sebelum dikurangi HPP",
              icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
              valueClass: "text-gray-800",
            },
            {
              label: "Total Pendapatan Bersih",
              value: `Rp ${totalProfit.toLocaleString()}`,
              sub: "setelah dikurangi HPP",
              icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
              valueClass: "text-[#ff385c]",
            },
          ].map(({ label, value, sub, icon, valueClass }) => (
            <div key={label} className="air-card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#fff0f3] flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-[#ff385c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
                <p className={`text-2xl font-bold mt-0.5 ${valueClass}`}>{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}