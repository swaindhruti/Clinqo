import { StatCards } from "./stat-cards";
import { BusiestDayChart } from "./busiest-day-chart";

/**
 * Server Component representing the 'Overview' tab of the Clinic Dashboard.
 * Serves as an orchestration wrapper to load and stream smaller feature widgets.
 */
export async function OverviewSection() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
          Clinic Overview
        </h2>
        <p className="text-neutral-500 mt-1">
          Monitor your clinic&apos;s performance and manage operational
          parameters.
        </p>
      </div>

      <StatCards />

      {/* Main Content Area - Analytics */}
      <div className="w-full flex">
        <BusiestDayChart />
      </div>
    </div>
  );
}
