"use client";
import { useEffect, useState } from "react";

export default function Stock() {
  const [cakes, setCakes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [dailyEntries, setDailyEntries] = useState([]);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyForm, setDailyForm] = useState({});

  const fetchCakes = async () => {
    const res = await fetch("/api/producer-cake");
    const data = await res.json();
    setCakes(data.cakes);
  };

  const fetchDailyEntries = async (date = selectedDate) => {
    setDailyLoading(true);
    const res = await fetch(`/api/daily-entry?date=${date}`);
    const data = await res.json();
    setDailyEntries(data);
    const formObj = {};
    data.forEach(entry => {
      formObj[entry.cakeId] = {
        initialStock: entry.initialStock,
        remainingStock: entry.remainingStock ?? "",
        entryId: entry.id,
      };
    });
    setDailyForm(formObj);
    setDailyLoading(false);
  };

  useEffect(() => { fetchCakes(); }, []);
  useEffect(() => { fetchDailyEntries(); }, [selectedDate, cakes.length]);

  const handleDailyInputChange = (cakeId, field, value) => {
    setDailyForm({
      ...dailyForm,
      [cakeId]: {
        ...dailyForm[cakeId],
        [field]: value,
      },
    });
  };

  const handleDailySubmit = async (e) => {
    e.preventDefault();
    for (const cake of cakes) {
      const form = dailyForm[cake.id] || {};
      if (form.initialStock !== undefined && form.initialStock !== "") {
        await fetch("/api/daily-entry", {
          method: "POST",
          body: JSON.stringify({
            date: selectedDate,
            cakeId: cake.id,
            initialStock: parseInt(form.initialStock),
            remainingStock: form.remainingStock !== "" ? parseInt(form.remainingStock) : null,
          }),
        });
      }
    }
    fetchDailyEntries();
  };

  const handleDeleteDailyEntry = async (entryId) => {
    if (!confirm("Yakin hapus data stok harian ini?")) return;
    await fetch("/api/daily-entry", {
      method: "DELETE",
      body: JSON.stringify({ id: entryId }),
    });
    fetchDailyEntries();
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-green-700">Input & Rekap Stok Harian</h1>
      <div className="bg-white rounded-lg shadow p-4 border border-green-100 mb-6">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <label htmlFor="date">Tanggal: </label>
          <input
            id="date"
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
        <form onSubmit={handleDailySubmit}>
          <div className="overflow-x-auto">
            <table className="w-full border text-sm mb-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">Nama Kue</th>
                  <th className="border px-2 py-1">Stok Awal (Pagi)</th>
                  <th className="border px-2 py-1">Sisa Stok (Sore)</th>
                  <th className="border px-2 py-1">Aksi</th>
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
                        className="border px-1 py-0.5 rounded w-20"
                        value={dailyForm[cake.id]?.initialStock ?? ""}
                        onChange={e => handleDailyInputChange(cake.id, "initialStock", e.target.value)}
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        className="border px-1 py-0.5 rounded w-20"
                        value={dailyForm[cake.id]?.remainingStock ?? ""}
                        onChange={e => handleDailyInputChange(cake.id, "remainingStock", e.target.value)}
                      />
                    </td>
                    <td className="border px-2 py-1">
                      {dailyForm[cake.id]?.entryId && (
                        <button type="button" className="text-red-600" onClick={() => handleDeleteDailyEntry(dailyForm[cake.id].entryId)}>
                          Hapus
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {cakes.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-2">Belum ada kue</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded" disabled={dailyLoading}>
            Simpan Stok Harian
          </button>
        </form>
      </div>
      <div className="bg-white rounded-lg shadow p-4 border border-green-100">
        <h3 className="font-semibold mb-3">Rekap Stok Harian ({selectedDate})</h3>
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Nama Kue</th>
                <th className="border px-2 py-1">Produsen</th>
                <th className="border px-2 py-1">Stok Awal</th>
                <th className="border px-2 py-1">Sisa Stok</th>
              </tr>
            </thead>
            <tbody>
              {dailyEntries.map(entry => (
                <tr key={entry.id}>
                  <td className="border px-2 py-1">{entry.cake.name}</td>
                  <td className="border px-2 py-1">{entry.cake.producer?.name}</td>
                  <td className="border px-2 py-1">{entry.initialStock}</td>
                  <td className="border px-2 py-1">{entry.remainingStock ?? '-'}</td>
                </tr>
              ))}
              {dailyEntries.length === 0 && (
                <tr><td colSpan={4} className="text-center py-2">Belum ada data stok harian</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {dailyLoading && <div className="text-center mt-4">Memuat data...</div>}
    </div>
  );
} 