import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { isTechAuthenticated, storeTechToken, storeTechInfo } from '@/utils/technicianAuth';
import { Smartphone, Lock, Loader2, Wrench } from 'lucide-react';
import InstallPrompt from '@/components/technician/InstallPrompt';

export default function TechnicianLogin() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isTechAuthenticated()) {
      router.replace('/technician');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/technician/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      storeTechToken(data.token);
      storeTechInfo({
        technicianId: data.technician.id,
        name: data.technician.name,
        role: 'technician',
      });

      router.push('/technician');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Technician Login | The Travelling Technicians</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#102a43" />
        <link key="manifest" rel="manifest" href="/manifest-technician.json" />
        <meta key="apple-wac" name="apple-mobile-web-app-capable" content="yes" />
        <meta key="apple-wac-status" name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta key="apple-wac-title" name="apple-mobile-web-app-title" content="TT Tech" />
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
      </Head>

      <InstallPrompt />
      <div className="min-h-screen bg-primary-900 flex flex-col items-center justify-center px-6">
        {/* Logo area */}
        <div className="mb-8 text-center">
          <div className="h-16 w-16 bg-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wrench className="h-8 w-8 text-primary-900" />
          </div>
          <h1 className="text-2xl font-bold text-white font-heading">
            Technician Portal
          </h1>
          <p className="text-primary-300 text-sm mt-1">The Travelling Technicians</p>
        </div>

        {/* Login form */}
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Phone input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  placeholder="(604) 555-1234"
                  required
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* PIN input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                PIN
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-base tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  placeholder="****"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-accent-500 border-gray-300 rounded focus:ring-accent-500"
              />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !phone || !pin}
              className="w-full py-3 bg-accent-500 text-primary-900 font-bold rounded-xl text-base hover:bg-accent-400 active:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">
            Contact your administrator if you need access
          </p>
        </div>
      </div>
    </>
  );
}
