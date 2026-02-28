"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const steps = [
  {
    step: "01",
    title: "Get Onboarded",
    description:
      "Sign up with your details on the Clinqo platform and Be a Clinqer.",
    cta: { label: "Be a Clinqer", href: "/get-started" },
    secondaryCta: { label: "Sign In", href: "/sign-in" },
    image:
      "https://res.cloudinary.com/dbnfkkfov/image/upload/v1772282142/0f5ee0d1-6097-440b-b77f-0f14aa09b1f2.png",
    imageLeft: false,
  },
  {
    step: "02",
    title: "Patients book your appointment via Whatsapp.",
    description:
      "Start getting appointments. View all appointment flow over your single dashboard.",
    cta: { label: "See how →", href: "#" },
    image:
      "https://res.cloudinary.com/dbnfkkfov/image/upload/v1772282226/6d40cb0e-69b1-4c76-ac0b-7a2d982fcc18.png",
    imageLeft: true,
  },
  {
    step: "03",
    title: "Patients Check-in when arrive.",
    description:
      "Patients get a real-time token number when they come and check in at the doorstep.",
    cta: { label: "Learn more →", href: "#" },
    image:
      "https://res.cloudinary.com/dbnfkkfov/image/upload/v1772282271/8cab9151-de87-45da-a549-313d2ce3e357.png",
    imageLeft: false,
  },
  {
    step: "04",
    title: "Set priority appointment flows",
    description:
      "Emergency and other queues can be prioritized in settings. Use manual onboarding in case of patient walk-ins.",
    cta: { label: "Explore →", href: "#" },
    image:
      "https://res.cloudinary.com/dbnfkkfov/image/upload/v1772282447/20f2d698-0fa0-4209-8d25-f1d0bb715f63.png",
    imageLeft: true,
  },
  {
    step: "05",
    title: "Patient gets live queue updates",
    description:
      "Live patient queue updates over Whatsapp and clinic signage board.",
    cta: { label: "Learn more →", href: "#" },
    image:
      "https://res.cloudinary.com/dbnfkkfov/image/upload/v1772282639/ac1d5870-689d-4017-bc29-9996ffa35448.png",
    imageLeft: false,
  },
  {
    step: "06",
    title: "Doctor can see the queue and check patients accordingly.",
    description:
      "Doctor's portal login and view appointments, complete appointments. Enabled with both e-rx and paper rx modules.",
    cta: { label: "Get started →", href: "/get-started" },
    image:
      "https://res.cloudinary.com/dbnfkkfov/image/upload/v1772282639/ac1d5870-689d-4017-bc29-9996ffa35448.png",
    imageLeft: true,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

export function HowItWorksSection() {
  return (
    <section className="relative w-full font-sans bg-transparent">
      {/* Page Header */}
      <div className="w-full py-24 md:py-36 px-6 md:px-12 flex flex-col items-center text-center gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="rounded-full bg-black/5 border border-black/10 backdrop-blur-md px-6 py-2 shadow-sm inline-block"
        >
          <span className="text-sm md:text-base font-semibold text-black/80">
            Step by step
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-black tracking-tight leading-[1.1]"
        >
          How it Works
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-xl text-black/60 font-medium max-w-2xl"
        >
          Everything from onboarding to the doctor&apos;s portal — built to run
          without friction.
        </motion.p>
      </div>

      {/* Steps */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-32 pb-32"
      >
        {steps.map((step) => (
          <motion.div
            key={step.step}
            variants={itemVariants}
            className={`flex flex-col ${
              step.imageLeft ? "md:flex-row-reverse" : "md:flex-row"
            } items-center gap-12 md:gap-20`}
          >
            {/* Text Side */}
            <div className="flex flex-col gap-6 flex-1">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-black/30">
                Step {step.step}
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-black leading-[1.2] tracking-tight">
                {step.title}
              </h2>
              <p className="text-base md:text-lg text-black/60 font-medium leading-relaxed max-w-md">
                {step.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <Link
                  href={step.cta.href}
                  className="px-6 py-3 bg-black text-white text-sm font-bold rounded-lg hover:bg-black/80 transition-colors shadow-md"
                >
                  {step.cta.label}
                </Link>
                {step.secondaryCta && (
                  <Link
                    href={step.secondaryCta.href}
                    className="px-6 py-3 bg-black/5 border border-black/15 text-black text-sm font-bold rounded-lg hover:bg-black/10 transition-colors"
                  >
                    {step.secondaryCta.label}
                  </Link>
                )}
              </div>
            </div>

            {/* Image Side */}
            <div className="flex-1 w-full">
              <div className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden border-2 border-black/10 shadow-lg bg-black/5 p-4">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-contain filter grayscale"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Demo Video CTA */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-7xl mx-auto px-6 md:px-12 pb-32"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-12 rounded-2xl border-2 border-black/10 backdrop-blur-xl shadow-xl hover:border-black/30 hover:shadow-2xl transition-all duration-300">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-black tracking-tight leading-[1.2] flex items-center gap-2">
            See Clinqo in action
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-9 h-9 shrink-0 text-black"
            >
              <path d="M7 17L17 7M7 7h10v10" />
            </svg>
          </h2>

          <Link
            href="https://youtube.com/@clinqo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-8 py-4 bg-black text-white font-bold text-base rounded-xl hover:bg-black/80 transition-colors shadow-lg group whitespace-nowrap"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-white"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            Watch on YouTube
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
