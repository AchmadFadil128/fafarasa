'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChangeAdminCredentialsPage() {
  const [currentUsername, setCurrentUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validasi password confirmation
    if (newPassword !== confirmPassword) {
      setError('Password baru dan konfirmasi password tidak cocok');
      setIsLoading(false);
      return;
    }

    // Validasi panjang password
    if (newPassword.length < 6) {
      setError('Password baru minimal 6 karakter');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/change-credential', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentUsername,
          currentPassword,
          newUsername,
          newPassword,
        }),
      });

      // Check if response is ok first
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Gagal mengubah kredensial';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Try to parse JSON response
      let data;
      try {
        data = await response.json();
        // Console log digunakan agar variable data dipakai
        console.log('Data yang diterima:', data);
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error('Response dari server tidak valid');
      }

      setSuccess('Kredensial admin berhasil diubah!');
      
      // Reset form
      setCurrentUsername('');
      setCurrentPassword('');
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');

      // Redirect setelah 2 detik
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (error) {
      console.error('Change credentials error:', error);
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengubah kredensial');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl shadow-2xl shadow-green-500/10 p-8">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
              Ubah Kredensial Admin
            </h2>
            <p className="text-sm text-gray-500">Masukkan kredensial lama dan baru untuk mengubah akun admin</p>
          </div>

          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            {/* Current Credentials Section */}
            <div className="space-y-4">
              <div className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
                Kredensial Saat Ini
              </div>
              <div>
                <label htmlFor="currentUsername" className="sr-only">
                  Username Saat Ini
                </label>
                <input
                  id="currentUsername"
                  name="currentUsername"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 rounded-xl border border-green-100 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white/70"
                  placeholder="Username saat ini"
                  value={currentUsername}
                  onChange={(e) => setCurrentUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="currentPassword" className="sr-only">
                  Password Saat Ini
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 rounded-xl border border-green-100 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white/70"
                  placeholder="Password saat ini"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
            </div>

            {/* New Credentials Section */}
            <div className="space-y-4">
              <div className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
                Kredensial Baru
              </div>
              <div>
                <label htmlFor="newUsername" className="sr-only">
                  Username Baru
                </label>
                <input
                  id="newUsername"
                  name="newUsername"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 rounded-xl border border-green-100 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white/70"
                  placeholder="Username baru"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="sr-only">
                  Password Baru
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  minLength={6}
                  className="appearance-none block w-full px-3 py-2 rounded-xl border border-green-100 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white/70"
                  placeholder="Password baru (minimal 6 karakter)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Konfirmasi Password Baru
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  className="appearance-none block w-full px-3 py-2 rounded-xl border border-green-100 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white/70"
                  placeholder="Konfirmasi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-red-50/90 border border-red-200 p-4">
                <div className="flex">
                  <div className="ml-1">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="rounded-xl bg-green-50/90 border border-green-200 p-4">
                <div className="flex">
                  <div className="ml-1">
                    <h3 className="text-sm font-medium text-green-800">{success}</h3>
                    <p className="text-xs text-green-600 mt-1">Anda akan dialihkan ke halaman login...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 flex justify-center py-2.5 px-4 text-sm font-medium rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                disabled={isLoading}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex justify-center py-2.5 px-4 text-sm font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isLoading ? "Memproses..." : "Ubah Kredensial"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}