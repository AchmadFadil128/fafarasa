"use client";
import { useEffect, useState } from "react";

// Definisikan tipe data untuk Producer
interface Producer {
  id: number;
  name: string;
}

export default function Producers() {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [producerName, setProducerName] = useState("");
  const [editProducer, setEditProducer] = useState<number | null>(null);
  const [editProducerName, setEditProducerName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProducers = async () => {
    setLoading(true);
    const res = await fetch("/api/producer-cake");
    const data = await res.json();
    setProducers(data.producers);
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

  const handleDeleteProducer = async (id: number) => {
    if (!confirm("Yakin hapus produsen ini?")) return;
    await fetch("/api/producer-cake", {
      method: "DELETE",
      body: JSON.stringify({ type: "producer", id }),
    });
    fetchProducers();
  };

  return (
    <div className="w-full max-w-lg mx-auto py-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-green-700">Manajemen Produsen</h1>
      <div className="bg-white rounded-lg shadow p-4 border border-green-100 mb-6">
        <form onSubmit={editProducer ? handleUpdateProducer : handleAddProducer} className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            className="border px-2 py-1 rounded w-full"
            placeholder="Nama produsen"
            value={editProducer ? editProducerName : producerName}
            onChange={e => editProducer ? setEditProducerName(e.target.value) : setProducerName(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded">
              {editProducer ? "Update" : "Tambah"}
            </button>
            {editProducer && (
              <button type="button" className="bg-gray-400 text-white px-2 py-1 rounded" onClick={() => { setEditProducer(null); setEditProducerName(""); }}>
                Batal
              </button>
            )}
          </div>
        </form>
        <h3 className="font-semibold mb-1">Daftar Produsen</h3>
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">#</th>
                <th className="border px-2 py-1">Nama</th>
                <th className="border px-2 py-1">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {producers.map((p, i) => (
                <tr key={p.id}>
                  <td className="border px-2 py-1">{i + 1}</td>
                  <td className="border px-2 py-1">{p.name}</td>
                  <td className="border px-2 py-1 flex gap-1">
                    <button className="text-green-600" onClick={() => handleEditProducer(p)}>Edit</button>
                    <button className="text-red-600" onClick={() => handleDeleteProducer(p.id)}>Hapus</button>
                  </td>
                </tr>
              ))}
              {producers.length === 0 && (
                <tr><td colSpan={3} className="text-center py-2">Belum ada produsen</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {loading && <div className="text-center mt-4">Memuat data...</div>}
    </div>
  );
} 