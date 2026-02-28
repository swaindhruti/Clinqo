"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

const metricCards = [
  {
    title: "25-35% fewer no-shows",
    description: "When every enquiry is captured, volume becomes predictable.",
  },
  {
    title: "10-20% better OPD utilisation",
    description: "When follow-ups are automatic, repeat visits increase.",
  },
  {
    title: "Front desk salary replaced by software",
    description: "One system handles intake, check-in, reminders, and records.",
  },
];

const ImageHeader = ({ src, alt }: { src: string; alt: string }) => (
  <div className="flex w-[calc(100%+48px)] h-[380px] -mt-6 -mx-6 overflow-hidden relative rounded-t-xl bg-black/5">
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover object-top filter grayscale opacity-90"
    />
  </div>
);

const audienceCards = [
  {
    title: "For Clinics",
    header: (
      <ImageHeader
        src="https://res.cloudinary.com/dbnfkkfov/image/upload/v1772276461/a04cc325-fd89-4039-ba90-3f8ca8f837eb.png"
        alt="Clinics"
      />
    ),
  },
  {
    title: "For OPD settings",
    header: (
      <ImageHeader
        src="https://res.cloudinary.com/dbnfkkfov/image/upload/v1772276495/4e5c88fc-f8b0-4ed9-b361-d3b953dc3a57.png"
        alt="OPD settings"
      />
    ),
  },
  {
    title: "For Hospital Chains",
    header: (
      <ImageHeader
        src="https://res.cloudinary.com/dbnfkkfov/image/upload/v1772276521/e07f01f3-faa4-4e4f-82f7-d49bb16ddc1f.png"
        alt="Hospital Chains"
      />
    ),
  },
];

export function CoversSection() {
  return (
    <section
      id="covers"
      className="relative w-full py-24 md:py-32 font-sans overflow-hidden"
    >
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8 flex flex-col items-center gap-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center w-full flex flex-col items-center gap-6"
        >
          <div className="rounded-full bg-black/5 border border-black/10 backdrop-blur-md px-6 py-2 shadow-sm inline-block">
            <span className="text-sm md:text-base font-semibold text-black/80">
              Visibility Creates Volume. Go from Visibility to volume
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-black tracking-tight drop-shadow-sm">
            What CLINQO Covers ?
          </h2>
        </motion.div>

        {/* Top Tier: Metric Bento Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="w-full"
        >
          <BentoGrid className="max-w-6xl mx-auto md:auto-rows-auto">
            {metricCards.map((card, i) => (
              <BentoGridItem
                key={i}
                title={
                  <span className="text-xl md:text-2xl font-bold text-black drop-shadow-sm mb-2 block">
                    {card.title}
                  </span>
                }
                description={
                  <span className="text-base md:text-lg font-medium text-black/80 leading-relaxed block">
                    {card.description}
                  </span>
                }
                className="backdrop-blur-xl border-black/10 border-2 hover:-translate-y-1 hover:border-black/30 hover:shadow-xl transition-all duration-300 md:col-span-1"
              />
            ))}
          </BentoGrid>
        </motion.div>

        {/* Bottom Tier: Audience Bento Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="w-full"
        >
          <BentoGrid className="max-w-6xl mx-auto md:auto-rows-auto">
            {audienceCards.map((card, i) => (
              <BentoGridItem
                key={i}
                header={card.header}
                title={
                  <span className="text-xl md:text-2xl font-bold text-black drop-shadow-sm mb-1 block text-center w-full">
                    {card.title}
                  </span>
                }
                className="backdrop-blur-xl border-black/10 border-2 hover:-translate-y-1 hover:border-black/30 hover:shadow-xl transition-all duration-300"
              />
            ))}
          </BentoGrid>
        </motion.div>
      </div>
    </section>
  );
}
