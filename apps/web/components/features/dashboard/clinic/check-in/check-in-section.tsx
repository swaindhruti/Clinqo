"use client";

import { useState } from "react";
import { QrCode, ShieldCheck, ScanLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CheckInDialog } from "../appointments/check-in-dialog";

export function CheckInSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Check-in</h2>
        <p className="text-neutral-500 mt-1">
          Scan QR codes or enter the patient check-in code to place them in the queue.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <QrCode className="h-5 w-5 text-blue-600" />
          <h3 className="mt-3 text-base font-semibold text-neutral-900">QR scanning</h3>
          <p className="mt-2 text-sm text-neutral-500">Use the built-in scanner to validate patient arrival quickly.</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <h3 className="mt-3 text-base font-semibold text-neutral-900">Code fallback</h3>
          <p className="mt-2 text-sm text-neutral-500">Manually verify the check-in code if the camera is unavailable.</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <ScanLine className="h-5 w-5 text-violet-600" />
          <h3 className="mt-3 text-base font-semibold text-neutral-900">Queue entry</h3>
          <p className="mt-2 text-sm text-neutral-500">Successful check-ins immediately update the clinic queue.</p>
        </div>
      </div>

      <div className="flex justify-start">
        <Button onClick={() => setOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <QrCode className="h-4 w-4" />
          Open Check-in Scanner
        </Button>
      </div>

      <CheckInDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}