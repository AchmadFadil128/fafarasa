'use client';

import { useEffect, useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

// Move the main form logic to a separate component
function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "AccessDenied") {
      setError("Akses Google ditolak. Hanya email yang diizinkan yang dapat masuk.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid username or password');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="air-card p-8">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 bg-[#ff385c] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">F</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#222222] tracking-[-0.18px]">
              Login ke Fafarasa
            </h2>
            <p className="text-sm text-[#6a6a6a]">Silakan masuk untuk melanjutkan</p>
          </div>

          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="air-input appearance-none block w-full px-3 py-2 placeholder-gray-500 sm:text-sm"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="air-input appearance-none block w-full px-3 py-2 placeholder-gray-500 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50/90 border border-red-200 p-4">
                <div className="flex">
                  <div className="ml-1">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="air-btn-primary group relative w-full flex justify-center py-2.5 px-4 text-sm font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Memproses..." : "Masuk"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Main component that wraps the form in Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <p>Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}