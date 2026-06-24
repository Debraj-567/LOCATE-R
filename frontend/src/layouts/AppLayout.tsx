import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Clock, User, Building2, Users,
  BarChart3, LogOut, QrCode, Menu, X, ShieldCheck
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const employeeNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/attendance', label: 'My Attendance', icon: Clock },
  { href: '/profile', label: 'Profile', icon: User },
];

const adminNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/attendance', label: 'My Attendance', icon: Clock },
  { href: '/admin/attendance', label: 'All Attendance', icon: BarChart3 },
  { href: '/admin/employees', label: 'Employees', icon: Users },
  { href: '/admin/offices', label: 'Offices', icon: Building2 },
  { href: '/admin/qr', label: 'QR Generator', icon: QrCode },
  { href: '/profile', label: 'Profile', icon: User },
];

export function AppLayout() {
  const { user, isAuthenticated, logout, refreshToken } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  const navItems = user.role === 'ADMIN' ? adminNav : employeeNav;

  const handleLogout = async () => {
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } finally {
      logout();
    }
  };

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <ShieldCheck className="w-7 h-7 text-primary" />
        <span className="font-bold text-xl tracking-tight">LOCATE-R</span>
      </div>

      {/* User info */}
      <div className="flex items-center gap-3 px-4 py-4 border-b">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
          <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = location.pathname === href || location.pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              to={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <Separator />
      <div className="p-3">
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 border-r flex-col bg-card">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 h-full bg-card border-r flex flex-col shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b bg-card">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <ShieldCheck className="w-5 h-5 text-primary" />
          <span className="font-bold text-lg">LOCATE-R</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
