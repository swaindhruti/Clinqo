"use client";

import React from "react";
import { motion } from "framer-motion";

export function EmpowerSection() {
  return (
    <section className="relative w-full py-24  font-sans overflow-hidden bg-transparent">
      <div className="mx-auto w-full max-w-screen px-6 md:px-12 flex flex-col items-center text-center gap-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center gap-8"
        >
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-black tracking-tight leading-[1.1] drop-shadow-sm">
            Made to empower medicos. It&apos;s CLINQO{" "}
            <br className="hidden md:block" />
            <span className="inline-block mt-2">Power to every Medico!</span>
          </h2>

          <div className="mt-4 flex flex-col items-center gap-1">
            <p className="text-xl md:text-2xl font-semibold text-black/80 drop-shadow-sm">
              Most clinics don&apos;t lose patients.
            </p>
            <p className="text-xl md:text-2xl font-semibold text-black/80 drop-shadow-sm">
              They lose intent.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
