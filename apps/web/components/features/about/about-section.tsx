"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative w-full py-24 md:py-32 overflow-hidden font-sans"
    >
      <div className="mx-auto w-full max-w-6xl px-6 md:px-12 flex flex-col items-center text-center gap-12">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center gap-6"
        >
          <h2 className="text-4xl md:text-5xl lg:text-[4rem] font-bold text-black leading-[1.05] tracking-tight w-full">
            CLINQO brings your clinic&apos;s front-office operations into a
            single, intelligent workflow
          </h2>

          <p className="text-lg md:text-2xl text-black/80 font-medium max-w-2xl mt-4 drop-shadow-sm">
            So that you create smoother workflows and happier patients
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link
              href="/demo"
              className="rounded-full bg-black px-8 py-4 text-lg font-semibold text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
            >
              Watch Demo
            </Link>
            <Link
              href="/revenue"
              className="rounded-full border border-black/20 bg-black/5 backdrop-blur-md px-8 py-4 text-lg font-medium text-black shadow-xl transition-all hover:bg-black/10 hover:scale-105 active:scale-95"
            >
              Get 20% more revenue now
            </Link>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="w-full mt-12 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Stat 1 */}
          <div className="flex flex-col items-center p-8 rounded-3xl bg-black/5 border border-black/10 backdrop-blur-md hover:-translate-y-2 transition-transform duration-300">
            <span className="text-5xl md:text-6xl font-extrabold text-black mb-2">
              30%
            </span>
            <span className="text-base md:text-lg font-semibold text-black/70 text-center">
              Reduction in No-Shows
            </span>
          </div>

          {/* Stat 2 */}
          <div className="flex flex-col items-center p-8 rounded-3xl bg-black/5 border border-black/10 backdrop-blur-md hover:-translate-y-2 transition-transform duration-300">
            <span className="text-5xl md:text-6xl font-extrabold text-black mb-2">
              5x
            </span>
            <span className="text-base md:text-lg font-semibold text-black/70 text-center">
              Faster Onboarding
            </span>
          </div>

          {/* Stat 3 */}
          <div className="flex flex-col items-center p-8 rounded-3xl bg-black/5 border border-black/10 backdrop-blur-md hover:-translate-y-2 transition-transform duration-300">
            <span className="text-5xl md:text-6xl font-extrabold text-black mb-2">
              10hr
            </span>
            <span className="text-base md:text-lg font-semibold text-black/70 text-center">
              Saved Per Week
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
