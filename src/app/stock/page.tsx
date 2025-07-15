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
    <div className="w-full max-w-2xl mx-auto py-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-green-700">Rekap Stok Harian</h1>
      <div className="bg-white rounded-lg shadow p-4 border border-green-100">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <label htmlFor="date">Tanggal:</label>
          <input
            id="date"
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Nama Kue</th>
                <th className="border px-2 py-1">Produsen</th>
                <th className="border px-2 py-1">Stok Awal</th>
                <th className="border px-2 py-1">Sisa Stok</th>
                <th className="border px-2 py-1">Terjual</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => {
                const sold = entry.initialStock - (entry.remainingStock ?? 0);
                return (
                  <tr key={entry.id}>
                    <td className="border px-2 py-1">{entry.cake.name}</td>
                    <td className="border px-2 py-1">{entry.cake.producer?.name}</td>
                    <td className="border px-2 py-1">{entry.initialStock}</td>
                    <td className="border px-2 py-1">{entry.remainingStock ?? '-'}</td>
                    <td className="border px-2 py-1">{entry.remainingStock !== null ? sold : '-'}</td>
                  </tr>
                );
              })}
              {entries.length === 0 && !loading && (
                <tr><td colSpan={5} className="text-center py-2">Tidak ada data untuk tanggal ini.</td></tr>
              )}
            </tbody>
          </table>
          {loading && <div className="text-center mt-2">Memuat data...</div>}
        </div>
      </div>
    </div>
  );
} 