import { AppointmentTabs } from "./appointment-tabs";

/**
 * Server Component representing the 'Appointments' tab of the Clinic Dashboard.
 * Serves as a streamlined wrapper for the appointment list interactions.
 */
export async function AppointmentsManagement() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
          Appointments Management
        </h2>
        <p className="text-neutral-500 mt-1">
          Review today&apos;s schedule, access past records, and manage future
          bookings.
        </p>
      </div>

      <div className="flex-1 w-full">
        <AppointmentTabs />
      </div>
    </div>
  );
}
