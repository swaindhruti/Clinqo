"use client";

import { useSearchParams } from "next/navigation";
import { WorkingDaysForm } from "./working-days-form";
import { TimeSlotsForm } from "./time-slots-form";

/**
 * Client Component representing the 'Management' tab of the Clinic Dashboard.
 * Serves as a wrapper to load specific configuration widgets based on the view parameter.
 */
export function SettingsSection() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "operating";

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
          Clinic Management
        </h2>
        <p className="text-neutral-500 mt-1">
          {view === "operating"
            ? "Configure operational schedules and clinic preferences."
            : "Manage doctor availability and precise consultation time slots."}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Render child components dynamically based on active sidebar tab */}
        {view === "operating" ? <WorkingDaysForm /> : <TimeSlotsForm />}
      </div>
    </div>
  );
}
