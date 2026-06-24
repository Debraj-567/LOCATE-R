import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QRData } from '@/types';
import { cn } from '@/lib/utils';

interface QRDisplayProps {
  officeId: string;
  officeName: string;
  onGenerate: () => Promise<QRData>;
  className?: string;
}

export function QRDisplay({ officeId: _officeId, officeName, onGenerate, className }: QRDisplayProps) {
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await onGenerate();
      setQrData(data);
      setTimeLeft(data.expiresInSeconds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  }, [onGenerate]);

  // Auto-regenerate on mount
  useEffect(() => { generate(); }, [generate]);

  // Countdown timer
  useEffect(() => {
    if (!qrData || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          // Auto-regenerate when expired
          generate();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [qrData, timeLeft, generate]);

  const urgency = timeLeft <= 10 ? 'destructive' : timeLeft <= 20 ? 'warning' : 'success';

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">QR Code for</p>
        <p className="font-semibold text-lg">{officeName}</p>
      </div>

      <div className="relative">
        {loading ? (
          <div className="w-64 h-64 flex items-center justify-center bg-muted rounded-xl border">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="w-64 h-64 flex flex-col items-center justify-center gap-2 bg-red-50 rounded-xl border border-red-200">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <p className="text-sm text-red-600 text-center px-4">{error}</p>
          </div>
        ) : qrData ? (
          <div className={cn('p-3 rounded-xl border-2 bg-white transition-all', urgency === 'destructive' ? 'border-red-400 animate-pulse' : 'border-primary/20')}>
            <img
              src={qrData.qrDataUrl}
              alt="Attendance QR Code"
              className="w-56 h-56"
            />
          </div>
        ) : null}
      </div>

      {qrData && !loading && (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <Badge variant={urgency === 'success' ? 'success' : urgency === 'warning' ? 'warning' : 'destructive'}>
            {timeLeft > 0 ? `Expires in ${timeLeft}s` : 'Expired — regenerating...'}
          </Badge>
        </div>
      )}

      <Button variant="outline" size="sm" onClick={generate} disabled={loading} className="gap-2">
        <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        Regenerate
      </Button>

      <p className="text-xs text-muted-foreground text-center max-w-xs">
        QR codes expire every 30 seconds and can only be used once to prevent replay attacks.
      </p>
    </div>
  );
}
