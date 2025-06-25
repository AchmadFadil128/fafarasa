"use client";
import { useEffect, useState } from "react";

export default function Cakes() {
  const [cakes, setCakes] = useState([]);
  const [producers, setProducers] = useState([]);
  const [cakeForm, setCakeForm] = useState({
    id: null,
    name: "",
    purchasePrice: "",
    sellingPrice: "",
    producerId: "",
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/producer-cake");
    const data = await res.json();
    setCakes(data.cakes);
    setProducers(data.producers);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCakeFormChange = (e) => {
    setCakeForm({ ...cakeForm, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdateCake = async (e) => {
    e.preventDefault();
    const method = cakeForm.id ? "PUT" : "POST";
    const payload = {
      type: "cake",
      id: cakeForm.id,
      name: cakeForm.name,
      purchasePrice: parseFloat(cakeForm.purchasePrice),
      sellingPrice: parseFloat(cakeForm.sellingPrice),
      producerId: parseInt(cakeForm.producerId),
    };
    await fetch("/api/producer-cake", {
      method,
      body: JSON.stringify(payload),
    });
    setCakeForm({ id: null, name: "", purchasePrice: "", sellingPrice: "", producerId: "" });
    fetchData();
  };

  const handleEditCake = (cake) => {
    setCakeForm({
      id: cake.id,
      name: cake.name,
      purchasePrice: cake.purchasePrice,
      sellingPrice: cake.sellingPrice,
      producerId: cake.producerId,
    });
  };

  const handleDeleteCake = async (id) => {
    if (!confirm("Yakin hapus kue ini?")) return;
    await fetch("/api/producer-cake", {
      method: "DELETE",
      body: JSON.stringify({ type: "cake", id }),
    });
    fetchData();
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-green-700">Manajemen Kue</h1>
      <div className="bg-white rounded-lg shadow p-4 border border-green-100 mb-6">
        <form onSubmit={handleAddOrUpdateCake} className="flex flex-col gap-2 mb-4">
          <input
            type="text"
            name="name"
            className="border px-2 py-1 rounded"
            placeholder="Nama kue"
            value={cakeForm.name}
            onChange={handleCakeFormChange}
            required
          />
          <input
            type="number"
            name="purchasePrice"
            className="border px-2 py-1 rounded"
            placeholder="Harga beli"
            value={cakeForm.purchasePrice}
            onChange={handleCakeFormChange}
            required
          />
          <input
            type="number"
            name="sellingPrice"
            className="border px-2 py-1 rounded"
            placeholder="Harga jual"
            value={cakeForm.sellingPrice}
            onChange={handleCakeFormChange}
            required
          />
          <select
            name="producerId"
            className="border px-2 py-1 rounded"
            value={cakeForm.producerId}
            onChange={handleCakeFormChange}
            required
          >
            <option value="">Pilih produsen</option>
            {producers.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded">
              {cakeForm.id ? "Update" : "Tambah"}
            </button>
            {cakeForm.id && (
              <button type="button" className="bg-gray-400 text-white px-2 py-1 rounded" onClick={() => setCakeForm({ id: null, name: "", purchasePrice: "", sellingPrice: "", producerId: "" })}>
                Batal
              </button>
            )}
          </div>
        </form>
        <h3 className="font-semibold mb-1">Daftar Kue</h3>
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">#</th>
                <th className="border px-2 py-1">Nama</th>
                <th className="border px-2 py-1">Produsen</th>
                <th className="border px-2 py-1">Harga Beli</th>
                <th className="border px-2 py-1">Harga Jual</th>
                <th className="border px-2 py-1">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cakes.map((c, i) => (
                <tr key={c.id}>
                  <td className="border px-2 py-1">{i + 1}</td>
                  <td className="border px-2 py-1">{c.name}</td>
                  <td className="border px-2 py-1">{c.producer?.name}</td>
                  <td className="border px-2 py-1">Rp{c.purchasePrice.toLocaleString()}</td>
                  <td className="border px-2 py-1">Rp{c.sellingPrice.toLocaleString()}</td>
                  <td className="border px-2 py-1 flex gap-1">
                    <button className="text-green-600" onClick={() => handleEditCake(c)}>Edit</button>
                    <button className="text-red-600" onClick={() => handleDeleteCake(c.id)}>Hapus</button>
                  </td>
                </tr>
              ))}
              {cakes.length === 0 && (
                <tr><td colSpan={6} className="text-center py-2">Belum ada kue</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {loading && <div className="text-center mt-4">Memuat data...</div>}
    </div>
  );
} 