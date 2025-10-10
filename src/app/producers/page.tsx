"use client";
import { useEffect, useState } from "react";

// Definisikan tipe data untuk Producer
interface Producer {
  id: number;
  name: string;
  isHidden: boolean;
}

export default function Producers() {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [hiddenProducers, setHiddenProducers] = useState<Producer[]>([]);
  const [producerName, setProducerName] = useState("");
  const [editProducer, setEditProducer] = useState<number | null>(null);
  const [editProducerName, setEditProducerName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProducers = async () => {
    setLoading(true);
    try {
      // Fetch all producers
      const res = await fetch("/api/producer-cake-all");
      const allData = await res.json();
      
      const allProds = allData.producers;
      const visibleProds = allProds.filter((p: Producer) => !p.isHidden);
      const hiddenProds = allProds.filter((p: Producer) => p.isHidden);
      
      setProducers(visibleProds);
      setHiddenProducers(hiddenProds);
    } catch (error) {
      console.error('Error fetching producers:', error);
      // Fallback to current API that only returns non-hidden producers
      const res = await fetch("/api/producer-cake");
      const data = await res.json();
      setProducers(data.producers);
      setHiddenProducers([]);
    }
    
    setLoading(false);
  };

  useEffect(() => { fetchProducers(); }, []);

  const handleAddProducer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!producerName) return;
    await fetch("/api/producer-cake", {
      method: "POST",
      body: JSON.stringify({ type: "producer", name: producerName }),
    });
    setProducerName("");
    fetchProducers();
  };

  const handleEditProducer = (producer: Producer) => {
    setEditProducer(producer.id);
    setEditProducerName(producer.name);
  };

  const handleUpdateProducer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetch("/api/producer-cake", {
      method: "PUT",
      body: JSON.stringify({ type: "producer", id: editProducer, name: editProducerName }),
    });
    setEditProducer(null);
    setEditProducerName("");
    fetchProducers();
  };

  const handleHideProducer = async (id: number) => {
    if (!confirm("Yakin sembunyikan produsen ini?")) return;
    await fetch("/api/producer-cake", {
      method: "DELETE",
      body: JSON.stringify({ type: "producer", id }),
    });
    fetchProducers();
  };

  const handleUnhideProducer = async (id: number) => {
    // For unhide, we need to update the isHidden field to false
    await fetch("/api/producer-cake", {
      method: "PUT",
      body: JSON.stringify({ type: "producer", id: id, name: hiddenProducers.find(p => p.id === id)?.name, isHidden: false }),
    });
    fetchProducers();
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                  Form Manajemen Produsen
                </h2>
                <p className="text-sm text-gray-500 mt-1">Tambah, edit, atau sembunyikan produsen</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={editProducer ? handleUpdateProducer : handleAddProducer} className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Nama produsen"
              value={editProducer ? editProducerName : producerName}
              onChange={e => editProducer ? setEditProducerName(e.target.value) : setProducerName(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <button type="submit" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all">
                {editProducer ? "Update" : "Tambah"}
              </button>
              {editProducer && (
                <button 
                  type="button" 
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                  onClick={() => { setEditProducer(null); setEditProducerName(""); }}
                >
                  Batal
                </button>
              )}
            </div>
          </form>
          
          {/* Visible Producers */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Produsen Aktif</h3>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                {producers.length} Produsen
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/50">
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">#</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">Nama</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/30">
                  {producers.map((p, i) => (
                    <tr 
                      key={p.id}
                      className="group hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 transition-all duration-300"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">{i + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button 
                            className="text-green-600 hover:text-green-800 font-medium"
                            onClick={() => handleEditProducer(p)}
                          >
                            Edit
                          </button>
                          <button 
                            className="text-yellow-600 hover:text-yellow-800 font-medium"
                            onClick={() => handleHideProducer(p.id)}
                          >
                            Sembunyikan
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {producers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">Tidak ada produsen aktif</p>
                            <p className="text-sm text-gray-400">Produsen yang ditambahkan akan muncul di sini</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Hidden Producers */}
          {hiddenProducers.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Produsen Tersembunyi</h3>
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                  {hiddenProducers.length} Produsen
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/50">
                      <th className="text-left px-6 py-4 font-semibold text-gray-700">#</th>
                      <th className="text-left px-6 py-4 font-semibold text-gray-700">Nama</th>
                      <th className="text-left px-6 py-4 font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/30">
                    {hiddenProducers.map((p, i) => (
                      <tr 
                        key={p.id}
                        className="group hover:bg-gradient-to-r hover:from-yellow-50/50 hover:to-amber-50/50 transition-all duration-300"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">{i + 1}</td>
                        <td className="px-6 py-4 font-medium text-gray-500 line-through">{p.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-3">
                            <button 
                              className="text-blue-600 hover:text-blue-800 font-medium"
                              onClick={() => handleUnhideProducer(p.id)}
                            >
                              Tampilkan
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {loading && <div className="text-center mt-4">Memuat data...</div>}
    </div>
  );
} 