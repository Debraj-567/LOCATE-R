import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QrCode, Building2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { QRDisplay } from '@/components/QRDisplay';
import { officesApi } from '@/api/offices';
import { qrApi } from '@/api/qr';
import { QRData } from '@/types';

export function AdminQRPage() {
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>('');

  const { data: offices, isLoading } = useQuery({
    queryKey: ['offices'],
    queryFn: officesApi.getAll,
  });

  const selectedOffice = offices?.find((o) => o.id === selectedOfficeId);

  const handleGenerate = useCallback(async (): Promise<QRData> => {
    return qrApi.generate(selectedOfficeId);
  }, [selectedOfficeId]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">QR Code Generator</h1>
        <p className="text-muted-foreground">Generate dynamic QR codes for employee check-in</p>
      </div>

      {/* Security info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-primary">Security Features</p>
              <ul className="text-muted-foreground space-y-0.5 list-disc list-inside">
                <li>QR codes expire after 30 seconds</li>
                <li>Each code is cryptographically signed with HMAC-SHA256</li>
                <li>One-time use only — prevents replay attacks</li>
                <li>GPS geofence validated server-side on scan</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Office selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Select Office
          </CardTitle>
          <CardDescription>Choose which office to generate a QR code for</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading offices...</p>
          ) : !offices?.length ? (
            <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded-md">
              <AlertTriangle className="w-4 h-4" />
              <p className="text-sm">No offices found. Create an office first.</p>
            </div>
          ) : (
            <div className="space-y-2 max-w-sm">
              <Label>Office</Label>
              <Select value={selectedOfficeId} onValueChange={setSelectedOfficeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an office..." />
                </SelectTrigger>
                <SelectContent>
                  {offices.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name} — {o.radius}m radius
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Display */}
      {selectedOffice && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Active QR Code
            </CardTitle>
            <CardDescription>
              Display this on a screen at {selectedOffice.name} for employees to scan
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <QRDisplay
              key={selectedOfficeId}
              officeId={selectedOfficeId}
              officeName={selectedOffice.name}
              onGenerate={handleGenerate}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
