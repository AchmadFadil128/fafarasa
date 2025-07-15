"use client";
import { useEffect, useState, useCallback } from "react";

// Definisikan tipe data
interface Cake {
  id: number;
  name: string;
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
    setCakes(data.cakes);
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

  return (
    <div className="w-full max-w-lg mx-auto py-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-green-700">Input Stok Pagi</h1>
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
                  <th className="border px-2 py-1">Stok Awal (Pagi)</th>
                </tr>
              </thead>
              <tbody>
                {cakes.map(cake => (
                  <tr key={cake.id}>
                    <td className="border px-2 py-1">{cake.name}</td>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        className="border px-1 py-0.5 rounded w-24"
                        value={dailyForm[cake.id]?.initialStock ?? ""}
                        onChange={e => handleInputChange(cake.id, e.target.value)}
                        disabled={loading}
                      />
                    </td>
                  </tr>
                ))}
                {cakes.length === 0 && (
                  <tr><td colSpan={2} className="text-center py-2">Belum ada kue</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Stok Pagi"}
          </button>
        </form>
      </div>
    </div>
  );
} 