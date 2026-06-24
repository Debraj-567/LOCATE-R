import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, RefreshCw, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QRScannerProps {
  onScan: (token: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

// Minimal QR decoder using canvas — reads the raw image data and looks for the token
// In production, integrate @zxing/library for full QR decode support
async function decodeQRFromCanvas(canvas: HTMLCanvasElement): Promise<string | null> {
  // Dynamic import of jsQR for lightweight scanning
  try {
    const jsQR = (await import('jsqr')).default;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });
    return code?.data ?? null;
  } catch {
    return null;
  }
}

export function QRScanner({ onScan, onError, className }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const scannedRef = useRef(false);

  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [scanning, setScanning] = useState(false);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
    setScanning(false);
  }, []);

  const tick = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(tick);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      if (!scannedRef.current) {
        const result = await decodeQRFromCanvas(canvas);
        if (result) {
          scannedRef.current = true;
          stopCamera();
          onScan(result);
          return;
        }
      }
    }
    animFrameRef.current = requestAnimationFrame(tick);
  }, [onScan, stopCamera]);

  const startCamera = useCallback(async () => {
    scannedRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setScanning(true);
      animFrameRef.current = requestAnimationFrame(tick);
    } catch (err) {
      const msg = err instanceof Error && err.name === 'NotAllowedError'
        ? 'Camera permission denied. Please allow camera access.'
        : 'Could not access camera.';
      setPermissionDenied(err instanceof Error && err.name === 'NotAllowedError');
      onError?.(msg);
    }
  }, [tick, onError]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const result = await decodeQRFromCanvas(canvas);
          if (result) {
            onScan(result);
          } else {
            onError?.('Could not decode QR code from the uploaded image.');
          }
        } else {
          onError?.('Could not initialize canvas context.');
        }
      };
      img.onerror = () => {
        onError?.('Failed to load image file.');
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      onError?.('Failed to read file.');
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => () => stopCamera(), [stopCamera]);

  return (
    <div className={cn('flex flex-col items-center gap-4 w-full', className)}>
      <div className="flex w-full border-b mb-2">
        <button
          type="button"
          className={cn(
            "flex-1 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'camera'
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
          onClick={() => { setActiveTab('camera'); stopCamera(); }}
        >
          Camera
        </button>
        <button
          type="button"
          className={cn(
            "flex-1 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'upload'
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
          onClick={() => { setActiveTab('upload'); stopCamera(); }}
        >
          Upload Image
        </button>
      </div>

      {activeTab === 'camera' ? (
        <>
          <div className="relative w-full max-w-sm aspect-square bg-black rounded-xl overflow-hidden border-2 border-primary/30">
            <video
              ref={videoRef}
              className={cn('w-full h-full object-cover', !cameraActive && 'hidden')}
              muted
              playsInline
              aria-label="QR code scanner camera feed"
            />
            <canvas ref={canvasRef} className="hidden" />

            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
                {permissionDenied ? (
                  <CameraOff className="w-12 h-12 text-red-400" />
                ) : (
                  <Camera className="w-12 h-12 text-muted-foreground" />
                )}
                <p className="text-sm text-center px-4 text-muted-foreground">
                  {permissionDenied ? 'Camera access denied' : 'Camera inactive'}
                </p>
              </div>
            )}

            {cameraActive && (
              <>
                {/* Scanning overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-8 border-2 border-white/60 rounded-lg" />
                  <div className="absolute top-8 left-8 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                  <div className="absolute top-8 right-8 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                  <div className="absolute bottom-8 left-8 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                  <div className="absolute bottom-8 right-8 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                  {scanning && (
                    <div className="absolute left-8 right-8 top-8 h-0.5 bg-primary/80 animate-[scan_2s_linear_infinite]" />
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2">
            {!cameraActive ? (
              <Button onClick={startCamera} className="gap-2">
                <Camera className="w-4 h-4" />
                Start Scanner
              </Button>
            ) : (
              <Button variant="outline" onClick={stopCamera} className="gap-2">
                <CameraOff className="w-4 h-4" />
                Stop
              </Button>
            )}
            {cameraActive && (
              <Button variant="ghost" size="icon" onClick={() => { stopCamera(); setTimeout(startCamera, 300); }}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center w-full max-w-sm aspect-square bg-muted/35 border-2 border-dashed border-muted-foreground/30 rounded-xl p-6 text-center hover:bg-muted/50 cursor-pointer relative transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
            aria-label="Upload QR code image file"
          />
          <Upload className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="font-medium text-sm mb-1">Click or drag image here</p>
          <p className="text-xs text-muted-foreground">PNG, JPG, or JPEG containing a QR code</p>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 2rem; }
          100% { top: calc(100% - 2rem); }
        }
      `}</style>
    </div>
  );
}
