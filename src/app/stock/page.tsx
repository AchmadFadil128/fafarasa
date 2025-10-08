"use client";
import { useEffect, useState, useCallback } from "react";

// Definisikan tipe data
interface DailyEntry {
  id: number;
  cake: {
    name: string;
    producer: {
      name: string;
    };
  };
  initialStock: number;
  remainingStock: number | null;
  date: string;
}

export default function StockReport() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  const fetchEntries = useCallback(async (date = selectedDate) => {
    setLoading(true);
    const res = await fetch(`/api/daily-entry?date=${date}`);
    const data: DailyEntry[] = await res.json();
    setEntries(data);
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => { fetchEntries(); }, [selectedDate, fetchEntries]);

  return (
    <div className="w-full max-w-5xl mx-auto py-4">
      <div className="backdrop-blur-xl bg-white/80 border border-white/20 shadow-2xl shadow-green-500/10 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-b border-white/20 px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                  Rekap Stok Harian
                </h2>
                <p className="text-sm text-gray-500 mt-1">Lihat ringkasan stok harian untuk tanggal yang dipilih</p>
              </div>
            </div>
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              Tanggal: {new Date(selectedDate).toLocaleDateString('id-ID')}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4 flex-wrap bg-white/50 p-4 rounded-xl border border-white/30 backdrop-blur-sm">
            <label htmlFor="date" className="font-medium text-gray-700">Tanggal:</label>
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200/30">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/50">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">Nama Kue</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">Produsen</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">Stok Awal</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">Sisa Stok</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">Terjual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/30">
                {entries.map(entry => {
                  const sold = entry.initialStock - (entry.remainingStock ?? 0);
                  return (
                    <tr key={entry.id} className="group hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 transition-all duration-300">
                      <td className="px-6 py-4 font-medium text-gray-900">{entry.cake.name}</td>
                      <td className="px-6 py-4 text-gray-700">{entry.cake.producer?.name}</td>
                      <td className="px-6 py-4">{entry.initialStock}</td>
                      <td className="px-6 py-4">{entry.remainingStock ?? '-'}</td>
                      <td className="px-6 py-4">{entry.remainingStock !== null ? sold : '-'}</td>
                    </tr>
                  );
                })}
                {entries.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Tidak ada data untuk tanggal ini</p>
                          <p className="text-sm text-gray-400">Silakan input data stok harian terlebih dahulu</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {loading && <div className="text-center mt-4">Memuat data...</div>}
        </div>
      </div>
    </div>
  );
} 