import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from './layouts/AuthLayout';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AttendancePage } from './pages/AttendancePage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminAttendancePage } from './pages/admin/AdminAttendancePage';
import { AdminEmployeesPage } from './pages/admin/AdminEmployeesPage';
import { AdminOfficesPage } from './pages/admin/AdminOfficesPage';
import { AdminQRPage } from './pages/admin/AdminQRPage';
import { Toaster } from './components/ui/toaster';
import { useAuthStore } from './store/authStore';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected app routes */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Admin-only routes */}
          <Route path="/admin/attendance" element={<AdminRoute><AdminAttendancePage /></AdminRoute>} />
          <Route path="/admin/employees" element={<AdminRoute><AdminEmployeesPage /></AdminRoute>} />
          <Route path="/admin/offices" element={<AdminRoute><AdminOfficesPage /></AdminRoute>} />
          <Route path="/admin/qr" element={<AdminRoute><AdminQRPage /></AdminRoute>} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
