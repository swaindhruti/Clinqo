"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  MessageCircle,
  Users,
  ClipboardList,
  BarChart3,
  Monitor,
  Stethoscope,
  Bell,
  ArrowUpRight,
} from "lucide-react";

const products = [
  {
    id: "queue",
    icon: Users,
    tag: "Core",
    name: "Smart Queue Manager",
    tagline: "Zero chaos, full visibility.",
    description:
      "Real-time patient token system with live queue display. Patients know their turn before they even sit down.",
    highlights: [
      "Live token allocation",
      "Priority queue controls",
      "Walk-in manual onboarding",
    ],
    colSpan: "md:col-span-2",
    large: true,
  },
  {
    id: "whatsapp",
    icon: MessageCircle,
    tag: "Bookings",
    name: "WhatsApp Booking",
    tagline: "Appointments via the app they already use.",
    description:
      "Patients book directly on WhatsApp. No app downloads, no portals, no friction.",
    highlights: [
      "Auto-confirmation",
      "Rescheduling flows",
      "Single dashboard view",
    ],
    colSpan: "md:col-span-1",
    large: false,
  },
  {
    id: "doctor-portal",
    icon: Stethoscope,
    tag: "Doctor",
    name: "Doctor's Portal",
    tagline: "Your queue, your way.",
    description:
      "Login, see your patient list, complete consultations, and write prescriptions — all from one screen.",
    highlights: [
      "e-Rx module",
      "Paper Rx support",
      "Patient history at a glance",
    ],
    colSpan: "md:col-span-1",
    large: false,
  },
  {
    id: "erx",
    icon: ClipboardList,
    tag: "Prescriptions",
    name: "e-Prescription Module",
    tagline: "Digital or paper, your choice.",
    description:
      "Write, save, and share prescriptions digitally. Designed for doctors who want flexibility without complexity.",
    highlights: ["Drug database", "Shareable via WhatsApp", "Offline-ready"],
    colSpan: "md:col-span-1",
    large: false,
  },
  {
    id: "signage",
    icon: Monitor,
    tag: "Display",
    name: "Clinic Signage Board",
    tagline: "The waiting room, reimagined.",
    description:
      "Display live queue updates on a TV or screen at your clinic entrance. Patients self-regulate without staff intervention.",
    highlights: [
      "Live token display",
      "Custom branding",
      "Plug-and-play setup",
    ],
    colSpan: "md:col-span-1",
    large: false,
  },
  {
    id: "reminders",
    icon: Bell,
    tag: "Follow-ups",
    name: "Auto Reminders",
    tagline: "No-shows are a thing of the past.",
    description:
      "Automated appointment reminders via WhatsApp keep patients punctual and reduce empty slots.",
    highlights: ["WhatsApp reminders", "Custom timing", "Follow-up nudges"],
    colSpan: "md:col-span-1",
    large: false,
  },
  {
    id: "analytics",
    icon: BarChart3,
    tag: "Insights",
    name: "Clinic Analytics",
    tagline: "Know your numbers.",
    description:
      "Track footfall, no-shows, OPD utilisation, and peak hours from a clean, intuitive dashboard.",
    highlights: [
      "Daily & weekly reports",
      "No-show tracking",
      "Revenue insights",
    ],
    colSpan: "md:col-span-2",
    large: true,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export function ProductsSection() {
  return (
    <section className="relative w-full font-sans bg-transparent">
      {/* Header */}
      <div className="w-full py-24 md:py-36 px-6 md:px-12 flex flex-col items-center text-center gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="rounded-full bg-black/5 border border-black/10 backdrop-blur-md px-6 py-2 shadow-sm inline-block"
        >
          <span className="text-sm md:text-base font-semibold text-black/80">
            Built for modern clinics
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-black tracking-tight leading-[1.1]"
        >
          Our Products
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-xl text-black/60 font-medium max-w-2xl"
        >
          A full stack of tools to run your clinic front-office — from
          appointments to prescriptions, all under one roof.
        </motion.p>
      </div>

      {/* Product Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="w-full max-w-7xl mx-auto px-6 md:px-12 pb-32 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {products.map((product) => {
          const Icon = product.icon;
          return (
            <motion.div
              key={product.id}
              variants={cardVariants}
              className={`relative flex flex-col gap-6 rounded-2xl border-2 border-black/10 backdrop-blur-xl p-8 shadow-lg hover:-translate-y-1 hover:border-black/25 hover:shadow-xl transition-all duration-300 group ${product.colSpan}`}
            >
              {/* Tag + Icon row */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-[0.25em] text-black/40 bg-black/5 border border-black/10 rounded-full px-3 py-1">
                  {product.tag}
                </span>
                <div className="w-10 h-10 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center group-hover:bg-black group-hover:border-black transition-all duration-300">
                  <Icon className="w-5 h-5 text-black/60 group-hover:text-white transition-colors duration-300" />
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-3 flex-1">
                <h2
                  className={`font-extrabold text-black tracking-tight leading-tight ${product.large ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"}`}
                >
                  {product.name}
                </h2>
                <p className="text-sm font-semibold text-black/50 uppercase tracking-widest">
                  {product.tagline}
                </p>
                <p className="text-base text-black/60 font-medium leading-relaxed mt-1">
                  {product.description}
                </p>

                {/* Highlights */}
                <ul className="flex flex-col gap-2 mt-2">
                  {product.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-center gap-2 text-sm font-medium text-black/70"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-black/40 shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <Link
                href="/contact-us"
                className="inline-flex items-center gap-2 text-sm font-bold text-black border-t border-black/10 pt-4 hover:gap-3 transition-all duration-200"
              >
                Get early access
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Bottom CTA Box */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-7xl mx-auto px-6 md:px-12 pb-32"
      >
        <div className="rounded-2xl border-2 border-black/10 backdrop-blur-xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl hover:-translate-y-1 hover:border-black/25 hover:shadow-2xl transition-all duration-300">
          <h2 className="text-2xl md:text-4xl font-extrabold text-black tracking-tight">
            Not sure which plan fits you?
          </h2>
          <Link
            href="/contact-us"
            className="flex items-center gap-3 px-8 py-4 bg-black text-white font-bold text-base rounded-xl hover:bg-black/80 transition-colors shadow-lg whitespace-nowrap"
          >
            Talk to us
            <ArrowUpRight className="w-5 h-5" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
