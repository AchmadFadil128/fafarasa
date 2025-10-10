"use client";
import { useEffect, useState, useCallback } from "react";

// Definisikan tipe data
interface Producer {
  id: number;
  name: string;
  isHidden: boolean;
}

interface Cake {
  id: number;
  name: string;
  producer: Producer;
}

interface DailyForm {
  [cakeId: number]: {
    initialStock: string;
  };
}

interface DailyEntry {
  cakeId: number;
  initialStock: number;
}

export default function StockIn() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dailyForm, setDailyForm] = useState<DailyForm>({});
  const [loading, setLoading] = useState(false);

  // Fetch semua kue
  const fetchCakes = async () => {
    const res = await fetch("/api/producer-cake");
    const data = await res.json();
    // Filter out cakes from hidden producers
    const visibleCakes = data.cakes.filter((cake: Cake) => !cake.producer.isHidden);
    // Sort by producer name A-Z
    visibleCakes.sort((a: Cake, b: Cake) => a.producer.name.localeCompare(b.producer.name, 'id'));
    setCakes(visibleCakes);
  };

  // Fetch data stok yang sudah ada untuk tanggal terpilih
  const fetchExistingEntries = useCallback(async (date = selectedDate) => {
    setLoading(true);
    const res = await fetch(`/api/daily-entry?date=${date}`);
    const data: DailyEntry[] = await res.json();
    const formObj: DailyForm = {};
    data.forEach((entry) => {
      formObj[entry.cakeId] = {
        initialStock: String(entry.initialStock),
      };
    });
    setDailyForm(formObj);
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => { fetchCakes(); }, []);
  useEffect(() => { fetchExistingEntries(); }, [selectedDate, fetchExistingEntries]);

  const handleInputChange = (cakeId: number, value: string) => {
    setDailyForm({
      ...dailyForm,
      [cakeId]: { initialStock: value },
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    for (const cake of cakes) {
      const form = dailyForm[cake.id] || {};
      if (form.initialStock !== undefined && form.initialStock !== "") {
        await fetch("/api/daily-entry", {
          method: "POST",
          body: JSON.stringify({
            date: selectedDate,
            cakeId: cake.id,
            initialStock: parseInt(form.initialStock),
          }),
        });
      }
    }
    setLoading(false);
    alert("Stok pagi berhasil disimpan!");
  };

  const handleInputEnter = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextInput = document.getElementById(`stock-input-${index + 1}`) as HTMLInputElement | null;
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-2 sm:py-4 px-2 sm:px-4">
      <div className="backdrop-blur-xl bg-white/80 border border-white/20 shadow-2xl shadow-green-500/10 rounded-xl sm:rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-b border-white/20 px-3 sm:px-6 py-3 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                  Form Input Stok Pagi
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Masukkan jumlah stok awal untuk setiap jenis kue</p>
              </div>
            </div>
            <div className="bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium self-start sm:self-auto">
              Tanggal: {new Date(selectedDate).toLocaleDateString('id-ID')}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
            <label htmlFor="date" className="font-medium text-gray-700 text-sm sm:text-base">Tanggal:</label>
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm sm:text-base">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/50">
                    <th className="text-left px-2 sm:px-6 py-2 sm:py-4 font-semibold text-gray-700 text-xs sm:text-sm">Nama Kue</th>
                    <th className="text-left px-2 sm:px-6 py-2 sm:py-4 font-semibold text-gray-700 text-xs sm:text-sm">Stok Awal (Pagi)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/30">
                  {cakes.map((cake, idx) => (
                    <tr 
                      key={cake.id}
                      className="group hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 transition-all duration-300"
                    >
                      <td className="px-2 sm:px-6 py-2 sm:py-4 font-medium text-gray-900 text-xs sm:text-sm">{cake.name}</td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4">
                        <input
                          type="number"
                          min="0"
                          className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1 sm:py-2 w-20 sm:w-32 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={dailyForm[cake.id]?.initialStock ?? ""}
                          onChange={e => handleInputChange(cake.id, e.target.value)}
                          onKeyDown={e => handleInputEnter(e, idx)}
                          id={`stock-input-${idx}`}
                          disabled={loading}
                        />
                      </td>
                    </tr>
                  ))}
                  {cakes.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-3 sm:px-6 py-8 sm:py-12 text-center">
                        <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium text-sm sm:text-base">Belum ada data kue</p>
                            <p className="text-xs sm:text-sm text-gray-400">Silakan tambahkan data kue terlebih dahulu</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 sm:mt-6">
              <button 
                type="submit" 
                className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-all text-sm sm:text-base"
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan Stok Pagi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 