import { Outlet, Navigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export function AuthLayout() {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col items-center justify-center p-12 text-primary-foreground">
        <ShieldCheck className="w-20 h-20 mb-6 opacity-90" />
        <h1 className="text-4xl font-bold mb-4">LOCATE-R</h1>
        <p className="text-lg text-center opacity-80 max-w-sm">
          GPS-verified QR attendance — secure, instant, reliable.
        </p>
        <div className="mt-12 grid grid-cols-2 gap-6 text-center">
          {[
            { label: 'QR Scanning', desc: 'Dynamic 30s tokens' },
            { label: 'GPS Verify', desc: 'Geofence validation' },
            { label: 'Real-time', desc: 'Instant check-in' },
            { label: 'Secure', desc: 'JWT + replay protection' },
          ].map(({ label, desc }) => (
            <div key={label} className="bg-white/10 rounded-lg p-4">
              <p className="font-semibold">{label}</p>
              <p className="text-sm opacity-70 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <ShieldCheck className="w-7 h-7 text-primary" />
            <span className="text-2xl font-bold">LOCATE-R</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
