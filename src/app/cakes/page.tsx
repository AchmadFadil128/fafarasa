"use client";
import { useEffect, useState } from "react";

// Definisikan tipe data untuk menghindari error 'any'
interface Producer {
  id: number;
  name: string;
}

interface Cake {
  id: number;
  name: string;
  purchasePrice: number;
  sellingPrice: number;
  producerId: number;
  producer?: Producer;
}

export default function Cakes() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [cakeForm, setCakeForm] = useState({
    id: null as number | null,
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

  const handleCakeFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCakeForm({ ...cakeForm, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdateCake = async (e: React.FormEvent<HTMLFormElement>) => {
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

  const handleEditCake = (cake: Cake) => {
    setCakeForm({
      id: cake.id,
      name: cake.name,
      purchasePrice: String(cake.purchasePrice),
      sellingPrice: String(cake.sellingPrice),
      producerId: String(cake.producerId),
    });
  };

  const handleDeleteCake = async (id: number) => {
    if (!confirm("Yakin hapus kue ini?")) return;
    await fetch("/api/producer-cake", {
      method: "DELETE",
      body: JSON.stringify({ type: "cake", id }),
    });
    fetchData();
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                  Manajemen Kue
                </h2>
                <p className="text-sm text-gray-500 mt-1">Tambah, edit, atau hapus data kue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleAddOrUpdateCake} className="mb-6 bg-white/50 p-4 rounded-xl border border-white/30 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama Kue</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Nama kue"
                  value={cakeForm.name}
                  onChange={handleCakeFormChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="producerId" className="block text-sm font-medium text-gray-700 mb-1">Produsen</label>
                <select
                  id="producerId"
                  name="producerId"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={cakeForm.producerId}
                  onChange={handleCakeFormChange}
                  required
                >
                  <option value="">Pilih produsen</option>
                  {producers.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 mb-1">Harga Beli</label>
                <input
                  id="purchasePrice"
                  type="number"
                  name="purchasePrice"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Harga beli"
                  value={cakeForm.purchasePrice}
                  onChange={handleCakeFormChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700 mb-1">Harga Jual</label>
                <input
                  id="sellingPrice"
                  type="number"
                  name="sellingPrice"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Harga jual"
                  value={cakeForm.sellingPrice}
                  onChange={handleCakeFormChange}
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button type="submit" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all">
                {cakeForm.id ? "Update" : "Tambah"}
              </button>
              {cakeForm.id && (
                <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all" onClick={() => setCakeForm({ id: null, name: "", purchasePrice: "", sellingPrice: "", producerId: "" })}>
                  Batal
                </button>
              )}
            </div>
          </form>
          
          <h3 className="font-semibold text-lg mb-4 text-gray-700">Daftar Kue</h3>
          <div className="overflow-x-auto rounded-xl border border-gray-200/30">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/50">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">#</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">Nama</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">Produsen</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">Harga Beli</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">Harga Jual</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/30">
                {cakes
                  .slice()
                  .sort((a, b) => (a.producer?.name || '').localeCompare(b.producer?.name || ''))
                  .map((c, i) => (
                    <tr key={c.id} className="group hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 transition-all duration-300">
                      <td className="px-6 py-4">{i + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                      <td className="px-6 py-4 text-gray-700">{c.producer?.name}</td>
                      <td className="px-6 py-4">Rp{c.purchasePrice.toLocaleString()}</td>
                      <td className="px-6 py-4">Rp{c.sellingPrice.toLocaleString()}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <button className="text-green-600 hover:text-green-800 font-medium" onClick={() => handleEditCake(c)}>Edit</button>
                        <button className="text-red-600 hover:text-red-800 font-medium" onClick={() => handleDeleteCake(c.id)}>Hapus</button>
                      </td>
                    </tr>
                  ))}
                {cakes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Belum ada data kue</p>
                          <p className="text-sm text-gray-400">Silakan tambahkan data kue terlebih dahulu</p>
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