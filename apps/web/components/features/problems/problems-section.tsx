"use client";

import React from "react";
import { motion } from "framer-motion";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

const items = [
  {
    title: "Appointments & No-Shows",
    description: (
      <ul className="list-disc pl-5 space-y-2 opacity-90 marker:text-black/50">
        <li>Up to 30% of bookings never convert.</li>
        <li>Irregular OPD loads waste time.</li>
        <li>Missed consults destroy future procedure revenue.</li>
      </ul>
    ),
  },
  {
    title: "Waiting Experience",
    description: (
      <ul className="list-disc pl-5 space-y-2 opacity-90 marker:text-black/50">
        <li>5-10% of patients abandon lines due to long waits.</li>
        <li>Zero visibility ruins clinical trust.</li>
      </ul>
    ),
  },
  {
    title: "Missed Calls",
    description: (
      <ul className="list-disc pl-5 space-y-2 opacity-90 marker:text-black/50">
        <li>10-15% of inbound enquiries vanish.</li>
        <li>WhatsApp replies are forgotten during busy OPD hours.</li>
      </ul>
    ),
  },
  {
    title: "People-Dependent Structure",
    description: (
      <ul className="list-disc pl-5 space-y-2 opacity-90 marker:text-black/50">
        <li>When ops rely on just one person, scaling stops dead.</li>
        <li>Errors multiply rapidly with every small staff change.</li>
      </ul>
    ),
  },
  {
    title: "Lost Follow-ups",
    description: (
      <ul className="list-disc pl-5 space-y-2 opacity-90 marker:text-black/50">
        <li>15-25% of patients never return due to missing reminders.</li>
        <li>Long-term subscription revenue quietly leaks.</li>
      </ul>
    ),
  },
  {
    title: "Manual Booking",
    description: (
      <ul className="list-disc pl-5 space-y-2 opacity-90 marker:text-black/50">
        <li>Phone-based booking guarantees overlapping slots.</li>
        <li>Double bookings and severe staff fatigue.</li>
      </ul>
    ),
  },
  {
    title: "Data Fragmentation",
    description: (
      <ul className="list-disc pl-5 space-y-2 opacity-90 marker:text-black/50">
        <li>Patient history is heavily scattered.</li>
        <li>Billing metrics and records become isolated.</li>
      </ul>
    ),
  },
];

export function ProblemsSection() {
  return (
    <section
      id="problems"
      className="relative w-full py-24 md:py-32 font-sans overflow-hidden"
    >
      <div className="mx-auto w-full px-6 flex flex-col items-center">
        {/* Full-width Screen Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center w-full mb-16"
        >
          <div className="mb-6 rounded-full bg-black/5 border border-black/10 backdrop-blur-md px-6 py-2 shadow-sm inline-block">
            <span className="text-sm md:text-base font-semibold text-black/80">
              Most revenue leakage happens in operations, not treatment.
            </span>
          </div>

          <h2
            className="text-4xl md:text-5xl lg:text-5xl font-extrabold text-black leading-[1.1] tracking-tight max-w-none w-full"
            style={{
              textShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            &quot; Where Clinics Lose Patients &mdash; Before the Doctor Even
            Starts &quot;
          </h2>
        </motion.div>

        {/* Aceternity Bento Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="w-full"
        >
          <BentoGrid className="max-w-6xl mx-auto">
            {items.map((item, i) => (
              <BentoGridItem
                key={i}
                title={
                  <span className="text-xl md:text-2xl font-bold text-black drop-shadow-sm mb-2">
                    {item.title}
                  </span>
                }
                description={
                  <span className="text-base md:text-lg font-medium text-black/80 leading-relaxed block">
                    {item.description}
                  </span>
                }
                // Removed header and icon as requested
                className={` backdrop-blur-xl border-black/10 border-2 hover:-translate-y-1 hover:border-black/30 hover:shadow-xl transition-all duration-300 ${
                  i === 0 || i === 3 ? "md:col-span-2" : "md:col-span-1"
                }`}
              />
            ))}
          </BentoGrid>
        </motion.div>
      </div>
    </section>
  );
}
