"use client";

import { BarChart3, TrendingUp } from "lucide-react";

// Mock Analytical Data - In a real app, this would be computed from the backend DB.
const weeklyData = [
  { day: "Mon", patients: 45, max: 80 },
  { day: "Tue", patients: 62, max: 80 },
  { day: "Wed", patients: 55, max: 80 },
  { day: "Thu", patients: 78, max: 80 }, // Busiest Day
  { day: "Fri", patients: 68, max: 80 },
  { day: "Sat", patients: 35, max: 80 },
  { day: "Sun", patients: 12, max: 80 },
];

export function BusiestDayChart() {
  const busiestDay = [...weeklyData].sort((a, b) => b.patients - a.patients)[0];

  return (
    <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6 md:p-8 w-full flex flex-col xl:flex-row gap-8 xl:items-center">
      {/* Analytics Summary */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-2 text-blue-600 font-semibold mb-2">
          <BarChart3 className="w-5 h-5" />
          <span>Weekly Traffic Analysis</span>
        </div>

        <h3 className="text-3xl font-black text-neutral-900 tracking-tight">
          {busiestDay.day} is your <br />
          <span className="text-blue-600">busiest operating day.</span>
        </h3>

        <p className="text-neutral-500 font-medium">
          Based on consultation volume from the last 30 days, {busiestDay.day}{" "}
          consistently sees the highest patient traffic, averaging{" "}
          <strong className="text-neutral-900">
            {busiestDay.patients} appointments
          </strong>
          .
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 mt-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-bold">
          <TrendingUp className="w-4 h-4" />
          <span>
            Optimization Recommendation: Consider adding +1 doctor shift on
            Thursdays.
          </span>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 h-[200px] pt-4 border-t xl:border-t-0 xl:border-l xl:pl-8 border-neutral-100 mt-4 xl:mt-0">
        {weeklyData.map((data) => {
          const isHighest = data.day === busiestDay.day;
          const heightPercentage = Math.round((data.patients / data.max) * 100);

          return (
            <div
              key={data.day}
              className="flex flex-col items-center gap-3 flex-1 group"
            >
              {/* Tooltip equivalent (visible on hover) */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 text-white text-[10px] font-bold px-2 py-1 rounded absolute -mt-8 pointer-events-none">
                {data.patients}
              </div>

              {/* Bar */}
              <div className="w-full relative bg-neutral-100 rounded-t-sm rounded-b-sm h-full flex items-end">
                <div
                  className={`w-full rounded-t-sm rounded-b-sm transition-all duration-700 ease-out ${isHighest ? "bg-blue-600 shadow-sm" : "bg-blue-200"}`}
                  style={{ height: `${heightPercentage}%` }}
                />
              </div>

              {/* Label */}
              <span
                className={`text-xs font-bold uppercase tracking-wider ${isHighest ? "text-blue-600" : "text-neutral-400"}`}
              >
                {data.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
