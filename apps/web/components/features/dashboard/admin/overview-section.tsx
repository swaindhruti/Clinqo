import {
  Trophy,
  TrendingUp,
  Building2,
  Stethoscope,
  BriefcaseMedical,
} from "lucide-react";

export function OverviewSection() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Platform Overview
          </h2>
          <p className="text-muted-foreground mt-1">
            High-level metrics and system performance.
          </p>
        </div>
      </div>

      <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6 flex flex-col justify-center">
          <span className="text-sm font-medium text-neutral-500 mb-2">
            Active Clinics
          </span>
          <span className="text-4xl font-bold text-neutral-900">156</span>
          <span className="text-sm font-medium text-green-600 mt-2">
            +12% from last month
          </span>
        </div>
        <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6 flex flex-col justify-center">
          <span className="text-sm font-medium text-neutral-500 mb-2">
            Active Doctors
          </span>
          <span className="text-4xl font-bold text-neutral-900">1,204</span>
          <span className="text-sm font-medium text-green-600 mt-2">
            +8% from last month
          </span>
        </div>
        <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6 flex flex-col justify-center">
          <span className="text-sm font-medium text-neutral-500 mb-2">
            Today&apos;s Bookings
          </span>
          <span className="text-4xl font-bold text-neutral-900">3,492</span>
          <span className="text-sm font-medium text-neutral-500 mt-2">
            Across all timezones
          </span>
        </div>
        <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6 flex flex-col justify-center">
          <span className="text-sm font-medium text-neutral-500 mb-2">
            Monthly Revenue
          </span>
          <span className="text-4xl font-bold text-neutral-900">$248k</span>
          <span className="text-sm font-medium text-green-600 mt-2">
            +15% from last month
          </span>
        </div>
      </div>

      {/* Top Performers Grid */}
      <h3 className="text-lg font-semibold tracking-tight text-neutral-900 mt-2 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-500" />
        Platform Top Performers
      </h3>
      <div className="grid gap-4 md:grid-cols-3">
        {/* Top 3 Clinics */}
        <div className="bg-white border border-neutral-200 shadow-sm rounded-xl overflow-hidden flex flex-col">
          <div className="bg-neutral-50/50 border-b border-neutral-100 p-4 shrink-0">
            <h4 className="font-semibold text-neutral-800 flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-blue-600" />
              Top 3 Clinics
            </h4>
          </div>
          <div className="flex flex-col p-4 gap-4 flex-1">
            {[
              {
                rank: 1,
                name: "MetroHealth Center",
                stat: "12.4k pts",
                color: "text-yellow-600",
              },
              {
                rank: 2,
                name: "Pioneer Orthopedics",
                stat: "9.2k pts",
                color: "text-neutral-500",
              },
              {
                rank: 3,
                name: "Sunrise Care Hub",
                stat: "8.5k pts",
                color: "text-amber-700",
              },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${item.color}`}>
                    #{item.rank}
                  </span>
                  <span className="font-medium text-neutral-900 text-sm">
                    {item.name}
                  </span>
                </div>
                <span className="text-xs font-medium text-neutral-500">
                  {item.stat}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 3 Doctors */}
        <div className="bg-white border border-neutral-200 shadow-sm rounded-xl overflow-hidden flex flex-col">
          <div className="bg-neutral-50/50 border-b border-neutral-100 p-4 shrink-0">
            <h4 className="font-semibold text-neutral-800 flex items-center gap-2 text-sm">
              <Stethoscope className="h-4 w-4 text-teal-600" />
              Top 3 Doctors
            </h4>
          </div>
          <div className="flex flex-col p-4 gap-4 flex-1">
            {[
              {
                rank: 1,
                name: "Dr. Sarah Chen",
                stat: "420 appts",
                color: "text-yellow-600",
              },
              {
                rank: 2,
                name: "Dr. Marcus Johnson",
                stat: "392 appts",
                color: "text-neutral-500",
              },
              {
                rank: 3,
                name: "Dr. James Wilson",
                stat: "341 appts",
                color: "text-amber-700",
              },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${item.color}`}>
                    #{item.rank}
                  </span>
                  <span className="font-medium text-neutral-900 text-sm">
                    {item.name}
                  </span>
                </div>
                <span className="text-xs font-medium text-neutral-500">
                  {item.stat}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 3 Categories */}
        <div className="bg-white border border-neutral-200 shadow-sm rounded-xl overflow-hidden flex flex-col">
          <div className="bg-neutral-50/50 border-b border-neutral-100 p-4 shrink-0">
            <h4 className="font-semibold text-neutral-800 flex items-center gap-2 text-sm">
              <BriefcaseMedical className="h-4 w-4 text-rose-600" />
              Top Demanding Specialties
            </h4>
          </div>
          <div className="flex flex-col p-4 gap-4 flex-1">
            {[
              { rank: 1, name: "Orthopedics", trend: "+24%", trendUp: true },
              {
                rank: 2,
                name: "Dermatology (Skin)",
                trend: "+18%",
                trendUp: true,
              },
              {
                rank: 3,
                name: "Otolaryngology (ENT)",
                trend: "+12%",
                trendUp: true,
              },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${item.trendUp ? "bg-green-500" : "bg-neutral-300"}`}
                  />
                  <span className="font-medium text-neutral-900 text-sm">
                    {item.name}
                  </span>
                </div>
                <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                  {item.trend} <TrendingUp className="h-3 w-3" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
