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
  isHidden: boolean;
  producer?: Producer;
}

export default function Cakes() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [hiddenCakes, setHiddenCakes] = useState<Cake[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [newCakeForm, setNewCakeForm] = useState({
    name: "",
    purchasePrice: "",
    sellingPrice: "",
    producerId: "",
  });
  const [editCakeForm, setEditCakeForm] = useState({
    id: null as number | null,
    name: "",
    purchasePrice: "",
    sellingPrice: "",
    producerId: "",
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/producer-cake?includeHidden=true");
    const data = await res.json();
    setCakes(data.cakes.filter((cake: Cake) => !cake.isHidden));
    setHiddenCakes(data.cakes.filter((cake: Cake) => cake.isHidden));
    setProducers(data.producers);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleNewCakeFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewCakeForm({ ...newCakeForm, [e.target.name]: e.target.value });
  };

  const handleEditCakeFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditCakeForm({ ...editCakeForm, [e.target.name]: e.target.value });
  };

  const handleAddCake = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      type: "cake",
      name: newCakeForm.name,
      purchasePrice: parseFloat(newCakeForm.purchasePrice),
      sellingPrice: parseFloat(newCakeForm.sellingPrice),
      producerId: parseInt(newCakeForm.producerId),
    };
    await fetch("/api/producer-cake", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setNewCakeForm({ name: "", purchasePrice: "", sellingPrice: "", producerId: "" });
    fetchData();
  };

  const handleEditCake = (cake: Cake) => {
    setEditCakeForm({
      id: cake.id,
      name: cake.name,
      purchasePrice: String(cake.purchasePrice),
      sellingPrice: String(cake.sellingPrice),
      producerId: String(cake.producerId),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateCake = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editCakeForm.id) return;
    const res = await fetch("/api/producer-cake", {
      method: "PUT",
      body: JSON.stringify({
        type: "cake",
        id: editCakeForm.id,
        name: editCakeForm.name,
        purchasePrice: parseFloat(editCakeForm.purchasePrice),
        sellingPrice: parseFloat(editCakeForm.sellingPrice),
        producerId: parseInt(editCakeForm.producerId),
      }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      alert(errorData.error || "Gagal mengupdate kue.");
      return;
    }
    setIsEditModalOpen(false);
    setEditCakeForm({ id: null, name: "", purchasePrice: "", sellingPrice: "", producerId: "" });
    fetchData();
  };

  const handleHideCake = async (id: number) => {
    if (!confirm("Yakin sembunyikan kue ini?")) return;
    const res = await fetch("/api/producer-cake", {
      method: "PUT",
      body: JSON.stringify({ type: "cake", id, isHidden: true }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      alert(errorData.error || "Gagal menyembunyikan kue.");
      return;
    }
    fetchData();
  };

  const handleUnhideCake = async (id: number) => {
    const res = await fetch("/api/producer-cake", {
      method: "PUT",
      body: JSON.stringify({ type: "cake", id, isHidden: false }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      alert(errorData.error || "Gagal menampilkan kue.");
      return;
    }
    fetchData();
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4">
      <div className="air-card overflow-hidden">
        {/* Header */}
        <div className="air-header px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#ff385c] rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h2 className="air-section-title">
                  Manajemen Kue
                </h2>
                <p className="air-subtitle mt-1">Tambah, edit, atau sembunyikan data kue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleAddCake} className="mb-6 bg-white/50 p-4 rounded-xl border border-white/30 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block air-label mb-1">Nama Kue</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="air-input w-full px-3 py-2 focus:outline-none"
                  placeholder="Nama kue"
                  value={newCakeForm.name}
                  onChange={handleNewCakeFormChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="producerId" className="block air-label mb-1">Produsen</label>
                <select
                  id="producerId"
                  name="producerId"
                  className="air-select w-full px-3 py-2 focus:outline-none"
                  value={newCakeForm.producerId}
                  onChange={handleNewCakeFormChange}
                  required
                >
                  <option value="">Pilih produsen</option>
                  {producers.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="purchasePrice" className="block air-label mb-1">Harga Beli</label>
                <input
                  id="purchasePrice"
                  type="number"
                  name="purchasePrice"
                  className="air-input w-full px-3 py-2 focus:outline-none"
                  placeholder="Harga beli"
                  value={newCakeForm.purchasePrice}
                  onChange={handleNewCakeFormChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="sellingPrice" className="block air-label mb-1">Harga Jual</label>
                <input
                  id="sellingPrice"
                  type="number"
                  name="sellingPrice"
                  className="air-input w-full px-3 py-2 focus:outline-none"
                  placeholder="Harga jual"
                  value={newCakeForm.sellingPrice}
                  onChange={handleNewCakeFormChange}
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button type="submit" className="air-btn-primary px-6 py-2 focus:outline-none transition-all">
                Tambah
              </button>
            </div>
          </form>
          
          <h3 className="air-card-title mb-4">Daftar Kue</h3>
          <div className="overflow-x-auto rounded-xl border border-gray-200/30">
            <table className="w-full air-table">
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
                    <tr key={c.id} className="group hover:bg-[#fcfcfc] transition-all duration-300">
                      <td className="px-6 py-4">{i + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                      <td className="px-6 py-4 text-gray-700">{c.producer?.name}</td>
                      <td className="px-6 py-4">Rp{c.purchasePrice.toLocaleString()}</td>
                      <td className="px-6 py-4">Rp{c.sellingPrice.toLocaleString()}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <button className="text-[#ff385c] hover:text-[#e00b41] font-medium" onClick={() => handleEditCake(c)}>Edit</button>
                        <button className="text-amber-600 hover:text-amber-800 font-medium" onClick={() => handleHideCake(c.id)}>Sembunyikan</button>
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
          {hiddenCakes.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="air-card-title">Kue Tersembunyi</h3>
                <span className="air-pill px-3 py-1 text-sm font-medium">{hiddenCakes.length} Kue</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-200/30">
                <table className="w-full air-table">
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
                    {hiddenCakes
                      .slice()
                      .sort((a, b) => (a.producer?.name || '').localeCompare(b.producer?.name || ''))
                      .map((c, i) => (
                        <tr key={c.id} className="group hover:bg-[#fcfcfc] transition-all duration-300">
                          <td className="px-6 py-4">{i + 1}</td>
                          <td className="px-6 py-4 font-medium text-gray-500 line-through">{c.name}</td>
                          <td className="px-6 py-4 text-gray-500">{c.producer?.name}</td>
                          <td className="px-6 py-4 text-gray-500">Rp{c.purchasePrice.toLocaleString()}</td>
                          <td className="px-6 py-4 text-gray-500">Rp{c.sellingPrice.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <button className="text-blue-600 hover:text-blue-800 font-medium" onClick={() => handleUnhideCake(c.id)}>Tampilkan</button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {loading && <div className="text-center mt-4">Memuat data...</div>}
        </div>
      </div>
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="air-card w-full max-w-xl p-6">
            <div className="mb-4">
              <h3 className="air-card-title">Edit Kue</h3>
              <p className="air-subtitle mt-1">Ubah detail kue lalu simpan perubahan.</p>
            </div>
            <form onSubmit={handleUpdateCake}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="edit-name" className="block air-label mb-1">Nama Kue</label>
                  <input
                    id="edit-name"
                    type="text"
                    name="name"
                    className="air-input w-full px-3 py-2 focus:outline-none"
                    value={editCakeForm.name}
                    onChange={handleEditCakeFormChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="edit-producerId" className="block air-label mb-1">Produsen</label>
                  <select
                    id="edit-producerId"
                    name="producerId"
                    className="air-select w-full px-3 py-2 focus:outline-none"
                    value={editCakeForm.producerId}
                    onChange={handleEditCakeFormChange}
                    required
                  >
                    <option value="">Pilih produsen</option>
                    {producers.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="edit-purchasePrice" className="block air-label mb-1">Harga Beli</label>
                  <input
                    id="edit-purchasePrice"
                    type="number"
                    name="purchasePrice"
                    className="air-input w-full px-3 py-2 focus:outline-none"
                    value={editCakeForm.purchasePrice}
                    onChange={handleEditCakeFormChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="edit-sellingPrice" className="block air-label mb-1">Harga Jual</label>
                  <input
                    id="edit-sellingPrice"
                    type="number"
                    name="sellingPrice"
                    className="air-input w-full px-3 py-2 focus:outline-none"
                    value={editCakeForm.sellingPrice}
                    onChange={handleEditCakeFormChange}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="air-btn-secondary px-4 py-2"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="air-btn-primary px-6 py-2">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 