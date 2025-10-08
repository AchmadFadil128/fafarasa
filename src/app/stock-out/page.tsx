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

  const handleInputEnter = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextInput = document.getElementById(`stockout-input-${index + 1}`) as HTMLInputElement | null;
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4">
      
      <div className="backdrop-blur-xl bg-white/80 border border-white/20 shadow-2xl shadow-green-500/10 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-b border-white/20 px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                  Form Input Stok Sore
                </h2>
                <p className="text-sm text-gray-500 mt-1">Masukkan jumlah sisa stok untuk setiap jenis kue</p>
              </div>
            </div>
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              Tanggal: {new Date(selectedDate).toLocaleDateString('id-ID')}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <label htmlFor="date" className="font-medium text-gray-700">Tanggal:</label>
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/50">
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">Nama Kue</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">Stok Awal</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">Sisa Stok (Sore)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/30">
                  {entries.map((entry, idx) => (
                    <tr 
                      key={entry.id}
                      className="group hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 transition-all duration-300"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">{entry.cake.name}</td>
                      <td className="px-6 py-4 text-gray-700">{entry.initialStock}</td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          className="border border-gray-300 rounded-lg px-3 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={dailyForm[entry.cakeId]?.remainingStock ?? ""}
                          onChange={e => handleInputChange(entry.cakeId, e.target.value)}
                          onKeyDown={e => handleInputEnter(e, idx)}
                          id={`stockout-input-${idx}`}
                          disabled={loading}
                        />
                      </td>
                    </tr>
                  ))}
                  {entries.length === 0 && !loading && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">Tidak ada data stok pagi untuk tanggal ini</p>
                            <p className="text-sm text-gray-400">Silakan input stok pagi terlebih dahulu</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-6">
              <button 
                type="submit" 
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan Stok Sore"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 