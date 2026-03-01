"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export function WorkingDaysForm() {
  const [schedule, setSchedule] = useState(
    [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].map((day) => ({
      day,
      short: day.substring(0, 3),
      isOpen: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(
        day,
      ),
      start: "09:00",
      end: "17:00",
    })),
  );

  const toggleDay = (dayName: string) => {
    setSchedule((prev) =>
      prev.map((s) => (s.day === dayName ? { ...s, isOpen: !s.isOpen } : s)),
    );
  };

  const updateTime = (
    dayName: string,
    field: "start" | "end",
    value: string,
  ) => {
    setSchedule((prev) =>
      prev.map((s) => (s.day === dayName ? { ...s, [field]: value } : s)),
    );
  };

  return (
    <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">
            Clinic Operating Schedule
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            Define the working days and general operational hours for your
            clinic.
          </p>
        </div>
        <button
          className="bg-neutral-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-neutral-800 transition-colors whitespace-nowrap"
          onClick={() => {
            console.log("Saving working schedule:", schedule);
          }}
        >
          Save Operating Hours
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {/* Header Row */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-4 pb-2 border-b border-neutral-100 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
          <div className="col-span-3">Day</div>
          <div className="col-span-4">Start Time</div>
          <div className="col-span-4">End Time</div>
        </div>

        {/* Schedule Rows */}
        {schedule.map((item) => (
          <div
            key={item.day}
            className={`grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-4 rounded-xl border transition-all ${
              item.isOpen
                ? "bg-blue-50/40 border-blue-200 shadow-sm"
                : "bg-neutral-50/50 border-neutral-100"
            }`}
          >
            <div className="col-span-1 border-b sm:border-0 pb-2 sm:pb-0 sm:col-span-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleDay(item.day)}
                className={`flex shrink-0 items-center justify-center w-5 h-5 rounded border ${
                  item.isOpen
                    ? "bg-blue-600 border-blue-600"
                    : "border-neutral-300 bg-white"
                }`}
              >
                {item.isOpen && (
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                )}
              </button>
              <span
                className={`font-bold text-[15px] sm:text-sm ${
                  item.isOpen ? "text-neutral-900" : "text-neutral-400"
                }`}
              >
                {item.day}
              </span>
            </div>

            <div
              className={`col-span-1 sm:col-span-9 grid grid-cols-2 gap-4 transition-opacity ${
                item.isOpen ? "opacity-100" : "opacity-30 pointer-events-none"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="sm:hidden text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none">
                  Start
                </span>
                <input
                  type="time"
                  value={item.start}
                  onChange={(e) =>
                    updateTime(item.day, "start", e.target.value)
                  }
                  disabled={!item.isOpen}
                  className="text-sm font-semibold text-neutral-900 bg-white border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 w-full max-w-[140px]"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="sm:hidden text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none">
                  End
                </span>
                <input
                  type="time"
                  value={item.end}
                  onChange={(e) => updateTime(item.day, "end", e.target.value)}
                  disabled={!item.isOpen}
                  className="text-sm font-semibold text-neutral-900 bg-white border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 w-full max-w-[140px]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
