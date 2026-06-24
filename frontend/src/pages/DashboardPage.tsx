import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CheckCircle2, Clock, LogOut, MapPin, AlertCircle, QrCode, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuthStore } from '@/store/authStore';
import { attendanceApi } from '@/api/attendance';
import { QRScanner } from '@/components/QRScanner';
import { useGeolocation } from '@/hooks/useGeolocation';
import { toast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

export function DashboardPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { getLocation, loading: locLoading } = useGeolocation();
  const [scannerOpen, setScannerOpen] = useState(false);

  const { data: todayData, isLoading } = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: attendanceApi.getTodayStatus,
    refetchInterval: 30000,
  });

  const checkInMutation = useMutation({
    mutationFn: attendanceApi.checkIn,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      setScannerOpen(false);
      toast({ title: 'Checked in!', description: `Welcome to ${data.officeName}`, variant: 'default' });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Check-in failed';
      toast({ title: 'Check-in failed', description: msg, variant: 'destructive' });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: attendanceApi.checkOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({ title: 'Checked out!', description: 'Have a great rest of your day.' });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Check-out failed';
      toast({ title: 'Check-out failed', description: msg, variant: 'destructive' });
    },
  });

  const handleQRScan = async (token: string) => {
    try {
      const coords = await getLocation();
      checkInMutation.mutate({ qrToken: token, ...coords });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Location error';
      toast({ title: 'Location error', description: msg, variant: 'destructive' });
    }
  };

  const attendance = todayData?.attendance;
  const checkedIn = !!attendance;
  const checkedOut = !!attendance?.checkOutAt;

  const statusConfig = {
    PRESENT: { label: 'Present', color: 'success' as const, icon: CheckCircle2 },
    LATE: { label: 'Late', color: 'warning' as const, icon: Clock },
    ABSENT: { label: 'Absent', color: 'destructive' as const, icon: AlertCircle },
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          {user?.firstName}
        </h1>
        <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Status card */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Status</CardTitle>
          <CardDescription>Your attendance record for today</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </div>
          ) : !checkedIn ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Clock className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Not checked in</p>
                  <p className="text-sm text-muted-foreground">Scan the office QR code to check in</p>
                </div>
              </div>
              <Button
                onClick={() => setScannerOpen(true)}
                className="gap-2 sm:ml-auto"
                disabled={locLoading}
              >
                <QrCode className="w-4 h-4" />
                Scan QR to Check In
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                {/* Check-in info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn('w-12 h-12 rounded-full flex items-center justify-center',
                    attendance.status === 'PRESENT' ? 'bg-green-100' : 'bg-yellow-100'
                  )}>
                    {(() => {
                      const Ic = statusConfig[attendance.status]?.icon ?? CheckCircle2;
                      return <Ic className={cn('w-6 h-6', attendance.status === 'PRESENT' ? 'text-green-600' : 'text-yellow-600')} />;
                    })()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Checked in</p>
                      <Badge variant={statusConfig[attendance.status]?.color}>
                        {statusConfig[attendance.status]?.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(attendance.checkInAt), 'h:mm a')}
                    </p>
                  </div>
                </div>

                {/* Check-out info */}
                {checkedOut ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <LogOut className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Checked out</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(attendance.checkOutAt!), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => checkOutMutation.mutate()}
                    disabled={checkOutMutation.isPending}
                    className="gap-2 self-center"
                  >
                    {checkOutMutation.isPending
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <LogOut className="w-4 h-4" />
                    }
                    Check Out
                  </Button>
                )}
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>
                  {attendance.office?.name ?? 'Office'} —{' '}
                  GPS: {attendance.latitude.toFixed(4)}, {attendance.longitude.toFixed(4)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Office', value: user?.office?.name ?? '—', icon: MapPin, color: 'text-blue-500' },
          { label: 'Role', value: user?.role ?? '—', icon: CheckCircle2, color: 'text-green-500' },
          { label: 'Today', value: format(new Date(), 'MMM d'), icon: Clock, color: 'text-purple-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Icon className={cn('w-5 h-5', color)} />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
                  <p className="font-semibold">{value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* QR Scanner dialog */}
      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
            <DialogDescription>
              Point your camera at the office QR code to check in. GPS location will be verified automatically.
            </DialogDescription>
          </DialogHeader>
          <QRScanner
            onScan={handleQRScan}
            onError={(err) => toast({ title: 'Scanner error', description: err, variant: 'destructive' })}
          />
          {checkInMutation.isPending && (
            <div className="flex items-center justify-center gap-2 py-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying location and recording check-in...
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
