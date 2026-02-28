"use client";

import React from "react";
import { motion } from "framer-motion";
import { Circle, Diamond, Triangle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const items = [
  {
    value: "ehr",
    trigger: (
      <div className="flex items-center gap-3">
        <Circle className="w-4 h-4 fill-black/40 text-transparent" />
        <span>Is it an EHR ? Does it force to write Computerised Rx.</span>
      </div>
    ),
    content:
      "No, Clinqo is your front-desk manager and a simple queue predictor that integrates to both E-rx modules and your existing solutions as well as pen and paper flow.",
  },
  {
    value: "help",
    trigger: (
      <div className="flex items-center gap-3">
        <Diamond className="w-4 h-4 fill-black/40 text-transparent" />
        <span>How will it help me?</span>
      </div>
    ),
    content:
      "As a doctor you enter the clinic seeing patients waiting outside. No more setting up calls with front-desk guy from morning. Patients can book 24/7 at their convenience and query you their concerns. You see what is important.",
  },
  {
    value: "marketing",
    trigger: (
      <div className="flex items-center gap-3">
        <Triangle className="w-4 h-4 fill-black/40 text-transparent" />
        <span>Are we a marketing company ?</span>
      </div>
    ),
    content:
      "No, we help medicos organize their clinics and not do fake ads. We optimise your profile on our Whatsapp and make sure customers reach out to you 24-7 even when you are not able to reply. We are your cheerleaders.",
  },
];

export function FAQSection() {
  return (
    <section className="relative w-full py-24 md:py-32 font-sans overflow-hidden bg-transparent">
      <div className="mx-auto w-full max-w-6xl px-6 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col w-full text-center gap-12"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="rounded-full bg-black/5 border border-black/10 backdrop-blur-md px-6 py-2 shadow-sm inline-block">
              <span className="text-sm md:text-base font-semibold text-black/80">
                Frequently Asked Questions
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-black tracking-tight drop-shadow-sm">
              Got Questions ? We&apos;ve Got Answers.
            </h2>
          </div>

          <Accordion
            type="single"
            collapsible
            className="w-full rounded-2xl border-2 border-black/10 backdrop-blur-xl  p-6 shadow-xl"
            defaultValue="billing"
          >
            {items.map((item) => (
              <AccordionItem
                key={item.value}
                value={item.value}
                className="border-b border-black/10 px-4 last:border-b-0 py-2"
              >
                <AccordionTrigger className="text-lg md:text-xl font-bold text-black hover:no-underline hover:text-black/80">
                  {item.trigger}
                </AccordionTrigger>
                <AccordionContent className="text-base text-left font-medium text-black/80 leading-relaxed pt-2 pb-4">
                  {item.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Integrated Pre-Footer CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="w-full mt-2 flex justify-center"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-12 pl-4">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-black tracking-tight text-center md:text-left">
                Got more interesting questions ?
              </h3>

              <button className="px-8 py-3 bg-black text-white hover:bg-black/80 transition-colors text-sm md:text-base font-semibold rounded-lg shadow-lg whitespace-nowrap">
                Clinq Us to know more
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
