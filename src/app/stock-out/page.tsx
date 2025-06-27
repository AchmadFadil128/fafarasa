"use client";
import { useEffect, useState, useCallback } from "react";

// Definisikan tipe data
interface DailyEntry {
  id: number;
  cakeId: number;
  initialStock: number;
  remainingStock: number | null;
  cake: { name: string };
}

interface DailyForm {
  [cakeId: number]: {
    remainingStock: string;
  };
}

export default function StockOut() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dailyForm, setDailyForm] = useState<DailyForm>({});
  const [loading, setLoading] = useState(false);

  // Fetch data stok yang sudah ada untuk tanggal terpilih
  const fetchEntries = useCallback(async (date = selectedDate) => {
    setLoading(true);
    const res = await fetch(`/api/daily-entry?date=${date}`);
    const data: DailyEntry[] = await res.json();
    // Hanya tampilkan yang sudah ada stok awal
    const filteredData = data.filter(e => e.initialStock > 0);
    setEntries(filteredData);
    
    const formObj: DailyForm = {};
    filteredData.forEach(entry => {
      formObj[entry.cakeId] = {
        remainingStock: entry.remainingStock !== null ? String(entry.remainingStock) : "",
      };
    });
    setDailyForm(formObj);
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => { fetchEntries(); }, [selectedDate, fetchEntries]);

  const handleInputChange = (cakeId: number, value: string) => {
    setDailyForm({
      ...dailyForm,
      [cakeId]: { ...dailyForm[cakeId], remainingStock: value },
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    for (const entry of entries) {
      const form = dailyForm[entry.cakeId] || {};
      if (form.remainingStock !== undefined) {
        await fetch("/api/daily-entry", {
          method: "POST",
          body: JSON.stringify({
            date: selectedDate,
            cakeId: entry.cakeId,
            remainingStock: form.remainingStock !== "" ? parseInt(form.remainingStock) : null,
          }),
        });
      }
    }
    setLoading(false);
    alert("Stok sore berhasil disimpan!");
  };

  return (
    <div className="w-full max-w-lg mx-auto py-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-green-700">Input Stok Sore</h1>
      <div className="bg-white rounded-lg shadow p-4 border border-green-100 mb-6">
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
        <form onSubmit={handleSubmit}>
          <div className="overflow-x-auto">
            <table className="w-full border text-sm mb-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">Nama Kue</th>
                  <th className="border px-2 py-1">Stok Awal</th>
                  <th className="border px-2 py-1">Sisa Stok (Sore)</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr key={entry.id}>
                    <td className="border px-2 py-1">{entry.cake.name}</td>
                    <td className="border px-2 py-1">{entry.initialStock}</td>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        className="border px-1 py-0.5 rounded w-24"
                        value={dailyForm[entry.cakeId]?.remainingStock ?? ""}
                        onChange={e => handleInputChange(entry.cakeId, e.target.value)}
                        disabled={loading}
                      />
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && !loading && (
                  <tr><td colSpan={3} className="text-center py-2">Tidak ada data stok pagi untuk tanggal ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Stok Sore"}
          </button>
        </form>
      </div>
    </div>
  );
} 