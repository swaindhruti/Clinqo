"use client";

import { useState } from "react";
import { Clock, Building2 } from "lucide-react";

// Mock Data: This represents the doctor's specific shifts allocated across multiple clinics
const DOCTOR_SCHEDULE = [
  {
    day: "Monday",
    start: "09:00",
    end: "13:00",
    active: true,
    clinic: "Downtown Medical Center",
  },
  {
    day: "Tuesday",
    start: "09:00",
    end: "17:00",
    active: true,
    clinic: "Uptown Heart Clinic",
  },
  {
    day: "Wednesday",
    start: "14:00",
    end: "18:00",
    active: true,
    clinic: "Downtown Medical Center",
  },
  {
    day: "Thursday",
    start: "09:00",
    end: "17:00",
    active: true,
    clinic: "Uptown Heart Clinic",
  },
  {
    day: "Friday",
    start: "09:00",
    end: "13:00",
    active: true,
    clinic: "Downtown Medical Center",
  },
  { day: "Saturday", start: "", end: "", active: false, clinic: "" },
  { day: "Sunday", start: "", end: "", active: false, clinic: "" },
];

export function ScheduleSection() {
  const [schedule] = useState(DOCTOR_SCHEDULE);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
          My Schedule
        </h2>
        <p className="text-neutral-500 mt-1">
          Review your weekly operating hours and assigned consultation slots
          across all registered clinics.
        </p>
      </div>

      <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-neutral-900">
              Assigned Clinic Timings
            </h3>
            <p className="text-sm text-neutral-500 mt-1 max-w-[500px]">
              This is your official weekly schedule as defined by clinic
              management. You are expected at the designated clinic for each
              active shift blocks.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {/* Header Row */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-4 pb-2 border-b border-neutral-100 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
            <div className="col-span-3">Day</div>
            <div className="col-span-9">Shift Assignment</div>
          </div>

          {/* Schedule Rows */}
          {schedule.map((item) => (
            <div
              key={item.day}
              className={`grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-4 rounded-xl border transition-all ${
                item.active
                  ? "bg-blue-50/20 border-blue-100 shadow-sm"
                  : "bg-neutral-50/50 border-neutral-100"
              }`}
            >
              <div className="col-span-1 border-b sm:border-0 pb-2 sm:pb-0 sm:col-span-3 flex items-center gap-3">
                <span
                  className={`font-bold text-[15px] sm:text-sm ${
                    item.active ? "text-neutral-900" : "text-neutral-400"
                  }`}
                >
                  {item.day}
                </span>
                {!item.active && (
                  <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-sm">
                    Off
                  </span>
                )}
              </div>

              <div
                className={`col-span-1 sm:col-span-9 flex flex-col sm:flex-row sm:items-center gap-3 transition-opacity ${
                  item.active ? "opacity-100" : "opacity-40"
                }`}
              >
                {item.active ? (
                  <>
                    <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 shadow-sm px-3 py-1.5 rounded-lg text-sm font-semibold text-neutral-700 shrink-0">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>{item.start}</span>
                      <span className="text-neutral-300">-</span>
                      <span>{item.end}</span>
                    </div>

                    <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 shadow-sm px-3 py-1.5 rounded-lg text-sm font-semibold text-neutral-700 truncate min-w-[200px]">
                      <Building2 className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span className="truncate">{item.clinic}</span>
                    </div>
                  </>
                ) : (
                  <span className="text-sm text-neutral-400 font-medium">
                    No hours assigned
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
