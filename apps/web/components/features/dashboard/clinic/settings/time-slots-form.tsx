"use client";

import { useState } from "react";
import { Plus, Trash2, CalendarHeart } from "lucide-react";

const INITIAL_DOCTORS = [
  { id: "1", name: "Dr. Sarah Chen", specialty: "Cardiology" },
  { id: "2", name: "Dr. Michael Ross", specialty: "Pediatrics" },
];

export function TimeSlotsForm() {
  const [selectedDoctor, setSelectedDoctor] = useState(INITIAL_DOCTORS[0].id);

  const [slots, setSlots] = useState<
    {
      id: string;
      day: string;
      start: string;
      end: string;
      subSlots: { id: string; start: string; end: string }[];
    }[]
  >([
    {
      id: "s1",
      day: "Monday",
      start: "09:00",
      end: "17:00",
      subSlots: [
        { id: "sub1", start: "09:00", end: "10:00" },
        { id: "sub2", start: "10:30", end: "11:30" },
      ],
    },
  ]);

  const addSlot = () => {
    setSlots([
      ...slots,
      {
        id: Math.random().toString(),
        day: "Monday",
        start: "09:00",
        end: "17:00",
        subSlots: [],
      },
    ]);
  };

  const removeSlot = (id: string) => {
    setSlots(slots.filter((s) => s.id !== id));
  };

  const updateSlot = (
    id: string,
    field: "day" | "start" | "end",
    value: string,
  ) => {
    setSlots(slots.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const addSubSlot = (shiftId: string) => {
    setSlots(
      slots.map((s) => {
        if (s.id === shiftId) {
          return {
            ...s,
            subSlots: [
              ...s.subSlots,
              { id: Math.random().toString(), start: s.start, end: s.end },
            ],
          };
        }
        return s;
      }),
    );
  };

  const updateSubSlot = (
    shiftId: string,
    subId: string,
    field: "start" | "end",
    value: string,
  ) => {
    setSlots(
      slots.map((s) => {
        if (s.id === shiftId) {
          return {
            ...s,
            subSlots: s.subSlots.map((sub) =>
              sub.id === subId ? { ...sub, [field]: value } : sub,
            ),
          };
        }
        return s;
      }),
    );
  };

  const removeSubSlot = (shiftId: string, subId: string) => {
    setSlots(
      slots.map((s) => {
        if (s.id === shiftId) {
          return {
            ...s,
            subSlots: s.subSlots.filter((sub) => sub.id !== subId),
          };
        }
        return s;
      }),
    );
  };

  return (
    <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6">
      {/* HEADER SECTION */}
      <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-neutral-100 pb-5">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <CalendarHeart className="w-5 h-5 text-blue-600" />
            Doctor Time Slots
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            Allocate exact working shifts and manually create rotation blocks.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="bg-white border border-neutral-200 shadow-sm text-neutral-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full sm:w-auto p-2.5 font-bold outline-none"
          >
            {INITIAL_DOCTORS.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} • {doc.specialty}
              </option>
            ))}
          </select>
          <button
            className="bg-neutral-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-neutral-800 transition-colors whitespace-nowrap"
            onClick={() => {
              console.log("Saving doctor slots for:", selectedDoctor, slots);
            }}
          >
            Save Availability
          </button>
        </div>
      </div>

      {/* BODY SECTION */}
      <div className="space-y-4">
        <label className="text-sm font-semibold text-neutral-800 uppercase tracking-widest text-[11px]">
          Scheduled Shifts
        </label>

        {slots.length === 0 ? (
          <div className="p-8 text-center bg-neutral-50 border border-dashed border-neutral-200 rounded-lg">
            <p className="text-neutral-500 text-sm">
              No time slots configured. Doctor is marked as unavailable.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar border border-transparent">
            {slots.map((slot) => {
              return (
                <div
                  key={slot.id}
                  className="flex flex-col p-4 bg-white rounded-xl border border-neutral-200 shadow-sm animate-in slide-in-from-bottom-2 duration-300"
                >
                  {/* Row 1: Shift Configuration */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-neutral-50 px-3 py-1.5 rounded-md border border-neutral-200 min-w-[130px]">
                      <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider shrink-0">
                        DAY
                      </span>
                      <select
                        value={slot.day}
                        onChange={(e) =>
                          updateSlot(slot.id, "day", e.target.value)
                        }
                        className="text-sm font-semibold text-neutral-900 bg-transparent focus:outline-none w-full outline-none"
                      >
                        {[
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                          "Sunday",
                        ].map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 bg-neutral-50 px-3 py-1.5 rounded-md border border-neutral-200">
                      <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                        SHIFT
                      </span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) =>
                            updateSlot(slot.id, "start", e.target.value)
                          }
                          className="text-sm font-mono font-semibold text-neutral-900 bg-transparent focus:outline-none"
                        />
                        <span className="text-neutral-300 font-bold">-</span>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) =>
                            updateSlot(slot.id, "end", e.target.value)
                          }
                          className="text-sm font-mono font-semibold text-neutral-900 bg-transparent focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="ml-auto">
                      <button
                        onClick={() => removeSlot(slot.id)}
                        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-md transition-all shadow-sm"
                        aria-label="Remove shift"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Manual Time Blocks Creation */}
                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest leading-none">
                        Consultation Blocks ({slot.subSlots.length})
                      </p>
                      <button
                        onClick={() => addSubSlot(slot.id)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 uppercase tracking-wide"
                      >
                        <Plus className="w-3 h-3" /> Add Slot
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {slot.subSlots.length > 0 ? (
                        slot.subSlots.map((b) => (
                          <div
                            key={b.id}
                            className="flex items-center gap-1 bg-neutral-50 border border-neutral-200 rounded text-xs font-semibold px-2 py-1.5 shrink-0 group transition-all"
                          >
                            <input
                              type="time"
                              value={b.start}
                              onChange={(e) =>
                                updateSubSlot(
                                  slot.id,
                                  b.id,
                                  "start",
                                  e.target.value,
                                )
                              }
                              className="bg-transparent w-auto max-w-[55px] outline-none text-neutral-700"
                            />
                            <span className="text-neutral-300">-</span>
                            <input
                              type="time"
                              value={b.end}
                              onChange={(e) =>
                                updateSubSlot(
                                  slot.id,
                                  b.id,
                                  "end",
                                  e.target.value,
                                )
                              }
                              className="bg-transparent w-auto max-w-[55px] outline-none text-neutral-700"
                            />
                            <button
                              onClick={() => removeSubSlot(slot.id, b.id)}
                              className="ml-1 text-neutral-400 hover:text-red-500 w-4 h-4 rounded hover:bg-red-50 flex items-center justify-center transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-neutral-400 font-medium">
                          No specific consultation blocks allocated yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={addSlot}
          className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-dashed border-neutral-200 text-neutral-500 text-sm font-semibold rounded-lg hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Work Shift
        </button>
      </div>
    </div>
  );
}
