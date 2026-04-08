"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, AlertCircle, QrCode } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { CheckIn, APIErrorResponse } from "@/types/api";

interface CheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (data: CheckIn) => void;
}

export function CheckInDialog({ open, onOpenChange, onSuccess }: CheckInDialogProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<CheckIn | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const qrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerActiveRef = useRef(false);

  const normalizeCheckInCode = (value: string) => {
    const raw = value.trim();
    if (!raw) return "";

    try {
      const url = new URL(raw);
      const fromQuery = url.searchParams.get("data") || url.searchParams.get("check_in_code");
      if (fromQuery) {
        return fromQuery.trim().toUpperCase();
      }

      const lastPath = url.pathname.split("/").filter(Boolean).pop();
      if (lastPath) {
        return lastPath.trim().toUpperCase();
      }
    } catch {
      // Not a URL; fall through to raw text handling.
    }

    return raw.toUpperCase();
  };

  const handleCheckIn = async (checkInCode: string) => {
    const normalizedCode = normalizeCheckInCode(checkInCode);
    if (!normalizedCode) {
      setError("Please scan a valid check-in QR code or enter a valid code.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await apiClient.post<CheckIn>("/checkins", {
        check_in_code: normalizedCode,
      });
      setSuccessData(result);
      if (onSuccess) onSuccess(result);
      // Stop scanning if it was active
      await stopScanner();
    } catch (err) {
      const apiErr = err as APIErrorResponse;
      setError(apiErr.message || "Failed to check in. Please check the code.");
    } finally {
      setIsLoading(false);
    }
  };

  const startScanner = async () => {
    setIsScanning(true);
    scannerActiveRef.current = true;
    setError(null);
    setSuccessData(null);
    
    // Give time for the div to mount
    setTimeout(async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (!devices || devices.length === 0) {
          throw new Error("No cameras found on this device.");
        }

        const html5QrCode = new Html5Qrcode("qr-reader");
        qrCodeRef.current = html5QrCode;
        
        // Try to find the back camera, otherwise use the first one
        const backCamera = devices.find(d => 
          d.label.toLowerCase().includes('back') || 
          d.label.toLowerCase().includes('rear') ||
          d.label.toLowerCase().includes('environment')
        ) || devices[0];
        
        await html5QrCode.start(
          backCamera.id,
          {
            fps: 15,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minDimension = Math.min(viewfinderWidth, viewfinderHeight);
              const qrboxSize = Math.floor(minDimension * 0.75);
              return { width: qrboxSize, height: qrboxSize };
            },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (scannerActiveRef.current) {
              // We found a code! Stop immediately and process
              stopScanner().then(() => {
                handleCheckIn(decodedText);
              });
            }
          },
          () => {
            // parse errors, ignore them
          }
        ).catch(() => {
            // If starting with specific camera failed, try with facingMode
            return html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 15,
                    qrbox: { width: 280, height: 280 }
                },
                (decodedText) => {
                    if (scannerActiveRef.current) {
                      stopScanner().then(() => {
                        handleCheckIn(decodedText);
                      });
                    }
                },
                () => {}
            );
        });
      } catch (err) {
        console.error("Scanner error:", err);
        setError(`Failed to start camera: ${err instanceof Error ? err.message : "Unknown error"}. Ensure you are on HTTPS.`);
        setIsScanning(false);
      }
    }, 300);
  };

  const stopScanner = async () => {
    scannerActiveRef.current = false;
    if (qrCodeRef.current) {
      try {
        await qrCodeRef.current.stop();
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
      qrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (!open) {
      stopScanner();
      setCode("");
      setError(null);
      setSuccessData(null);
    }
    
    return () => {
      scannerActiveRef.current = false;
      if (qrCodeRef.current) {
        qrCodeRef.current.stop().then(() => {
          qrCodeRef.current = null;
          setIsScanning(false);
        }).catch(() => {
          console.error("Cleanup error during unmount");
        });
      }
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-neutral-900">Patient Check-in</DialogTitle>
          <DialogDescription className="text-neutral-500">
            Scan the patient&apos;s QR code or enter the check-in code manually.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {successData ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900">Successfully Checked In!</h3>
              <p className="text-neutral-500 mt-2 text-lg">
                Queue Position: <span className="font-bold text-blue-600">#{successData.queue_position}</span>
              </p>
              <Button 
                onClick={() => onOpenChange(false)} 
                className="mt-8 w-full h-11 text-base font-bold"
                variant="outline"
              >
                Done
              </Button>
            </div>
          ) : (
            <>
              {isScanning ? (
                <div className="flex flex-col gap-4">
                  <div id="qr-reader" className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-900 min-h-[300px]" />
                  <Button variant="ghost" onClick={stopScanner} className="text-neutral-500 hover:text-red-500">
                    Cancel Scanning
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <Button 
                    className="h-28 flex-col gap-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300 transition-all group"
                    variant="outline"
                    onClick={startScanner}
                  >
                    <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-base">Open QR Scanner</span>
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-neutral-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-neutral-400 font-bold tracking-widest">Or enter code</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                      <Input
                        placeholder="e.g. AB1234"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        className="text-center text-xl font-mono tracking-widest h-14 uppercase border-2 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                        maxLength={10}
                        autoFocus
                      />
                    </div>
                    
                    {error && (
                      <div className="flex items-center gap-3 text-red-600 text-sm font-medium bg-red-50 p-4 rounded-xl border border-red-100 animate-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>{error}</p>
                      </div>
                    )}

                    <Button 
                      onClick={() => handleCheckIn(code)} 
                      disabled={isLoading || code.length < 4}
                      className="h-12 text-base font-bold shadow-sm"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify & Check-in"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
