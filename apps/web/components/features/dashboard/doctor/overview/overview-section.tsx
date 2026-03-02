import { CalendarDays, Users, FileText } from "lucide-react";

/**
 * Server Component representing the 'Overview' tab of the Doctor Dashboard.
 * Serves as the primary entry point for a doctor to review their daily metrics.
 */
export async function OverviewSection() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
          Doctor Overview
        </h2>
        <p className="text-neutral-500 mt-1">
          Welcome back. Here is a summary of your upcoming schedule and patient
          load.
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6 flex flex-col justify-center items-center text-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
            <CalendarDays className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-1">
            Today&apos;s Consultations
          </span>
          <span className="text-4xl font-black text-neutral-900">12</span>
        </div>

        <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6 flex flex-col justify-center items-center text-center">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-1">
            Pending Reports
          </span>
          <span className="text-4xl font-black text-neutral-900">5</span>
        </div>

        <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6 flex flex-col justify-center items-center text-center">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3">
            <Users className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-1">
            New Patients
          </span>
          <span className="text-4xl font-black text-neutral-900">3</span>
        </div>
      </div>

      {/* Main Content Area Placeholder */}
      <div className="bg-white border border-neutral-200 shadow-sm min-h-[40vh] flex-1 rounded-xl p-8 flex flex-col items-center justify-center text-center">
        <div className="bg-neutral-50 w-full h-full rounded-lg border border-dashed border-neutral-300 flex items-center justify-center min-h-[300px]">
          <p className="text-neutral-400 font-medium">
            Next Appointment Details loading area...
          </p>
        </div>
      </div>
    </div>
  );
}
