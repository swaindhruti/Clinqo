"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 text-center isolate font-sans">
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="z-10 mt-16 flex flex-col items-center gap-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
          className="rounded-full bg-black/5 border border-black/10 backdrop-blur-md px-6 py-2 shadow-lg"
        >
          <span className="text-lg md:text-xl font-medium text-black/80 drop-shadow-sm">
            Clinical workflow is hard
          </span>
        </motion.div>

        <h1 className="text-5xl tracking-tight sm:text-7xl md:text-[5.5rem] font-bold text-black leading-[1.1] text-center">
          Simplify your Appointments <br className="hidden md:block" /> with
          CLINQO
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-6"
        >
          <Link
            href="/get-it-now"
            className="rounded-full bg-black px-8 py-4 text-lg font-semibold text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
          >
            Get Started
          </Link>
          <Link
            href="/be-a-clinqer"
            className="rounded-full border border-black/20 bg-black/5 backdrop-blur-md px-8 py-4 text-lg font-medium text-black shadow-xl transition-all hover:bg-black/10 hover:scale-105 active:scale-95"
          >
            Learn More
          </Link>
        </motion.div>
      </motion.div>

      {/* Downward Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
          delay: 1.2,
        }}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut",
          }}
        >
          <Image
            src="https://res.cloudinary.com/dbnfkkfov/image/upload/v1772279819/rhimxe68epcpgf2yryds.svg"
            alt="Scroll down icon"
            width={36}
            height={36}
            className="opacity-70"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
