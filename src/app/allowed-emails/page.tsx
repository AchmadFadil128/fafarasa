"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

interface AllowedEmail {
  id: number
  email: string
  createdAt: string
}

export default function AllowedEmailsPage() {
  const { data: session } = useSession()
  const [emails, setEmails] = useState<AllowedEmail[]>([])
  const [newEmail, setNewEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const isAdmin = session?.user?.role === "admin"

  const fetchEmails = async () => {
    setLoading(true)
    const res = await fetch("/api/allowed-email")
    const data = await res.json()
    setEmails(data.emails || [])
    setLoading(false)
  }

  useEffect(() => { fetchEmails() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!newEmail) return
    try {
      const res = await fetch("/api/allowed-email", {
        method: "POST",
        body: JSON.stringify({ email: newEmail }),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Gagal menambah email")
        return
      }
      setNewEmail("")
      fetchEmails()
    } catch (e) {
      setError("Terjadi kesalahan")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus email ini dari whitelist?")) return
    await fetch("/api/allowed-email", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    })
    fetchEmails()
  }

  if (!isAdmin) {
    return (
      <div className="w-full max-w-2xl mx-auto py-4">
        <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl shadow-2xl shadow-green-500/10 p-6">
          <h1 className="text-xl font-bold text-green-700">Akses ditolak</h1>
          <p className="text-gray-600 mt-2">Halaman ini hanya untuk admin.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-green-700">Whitelist Email Google</h1>

      <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl shadow-2xl shadow-green-500/10 p-6 mb-6">
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            placeholder="email@example.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            className="flex-1 px-3 py-2 rounded-xl border border-green-100 bg-white/70 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button type="submit" className="px-4 py-2 rounded-xl text-white bg-green-600 hover:bg-green-700">Tambah</button>
        </form>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl shadow-2xl shadow-green-500/10 overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-b border-white/20">
          <h2 className="text-lg font-semibold text-green-700">Daftar Email Diizinkan</h2>
        </div>
        {loading ? (
          <div className="p-6 text-gray-500">Memuat...</div>
        ) : emails.length === 0 ? (
          <div className="p-6 text-gray-500">Belum ada email</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-2">Email</th>
                  <th className="text-left px-4 py-2">Ditambahkan</th>
                  <th className="px-4 py-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {emails.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-2">{e.email}</td>
                    <td className="px-4 py-2">{new Date(e.createdAt).toLocaleString("id-ID")}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(e.id)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 