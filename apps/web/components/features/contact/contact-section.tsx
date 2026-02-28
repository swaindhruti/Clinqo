"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";

const contactDetails = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@clinqo.com",
    href: "mailto:hello@clinqo.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "Bengaluru, Karnataka, India",
    href: "#",
  },
];

export function ContactSection() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
            Get in touch
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-black tracking-tight leading-[1.1]"
        >
          Contact Us
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-xl text-black/60 font-medium max-w-2xl"
        >
          Have questions or want to see Clinqo in action? We&apos;d love to hear
          from you.
        </motion.p>
      </div>

      {/* Body */}
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 pb-32 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
        {/* Left: Contact Details */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col gap-10"
        >
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl md:text-4xl font-extrabold text-black tracking-tight">
              Let&apos;s talk.
            </h2>
            <p className="text-base md:text-lg text-black/60 font-medium leading-relaxed">
              Whether you&apos;re a clinic owner, a hospital admin, or just
              curious — we&apos;re happy to walk you through everything.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {contactDetails.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-5 group"
              >
                <div className="w-12 h-12 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center shrink-0 group-hover:bg-black group-hover:border-black transition-all duration-200">
                  <item.icon className="w-5 h-5 text-black/60 group-hover:text-white transition-colors duration-200" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-widest text-black/40">
                    {item.label}
                  </span>
                  <span className="text-base font-semibold text-black group-hover:underline">
                    {item.value}
                  </span>
                </div>
              </a>
            ))}
          </div>

          {/* Socials */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-black/40">
              Follow us
            </span>
            <div className="flex items-center gap-4">
              {/* Instagram */}
              <a
                href="https://instagram.com/clinqo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center hover:bg-black hover:border-black group transition-all duration-200"
                aria-label="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-black/60 group-hover:text-white transition-colors"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              {/* Twitter / X */}
              <a
                href="https://twitter.com/clinqo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center hover:bg-black hover:border-black group transition-all duration-200"
                aria-label="Twitter"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-black/60 group-hover:text-white transition-colors"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.213 5.567 5.95-5.567zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="https://linkedin.com/company/clinqo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center hover:bg-black hover:border-black group transition-all duration-200"
                aria-label="LinkedIn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-black/60 group-hover:text-white transition-colors"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              {/* WhatsApp */}
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center hover:bg-black hover:border-black group transition-all duration-200"
                aria-label="WhatsApp"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-black/60 group-hover:text-white transition-colors"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Right: Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="rounded-2xl border-2 border-black/10 backdrop-blur-xl p-8 md:p-12 shadow-xl hover:border-black/20 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
        >
          {submitted ? (
            <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-8 h-8"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold text-black">
                Message received!
              </h3>
              <p className="text-black/60 font-medium max-w-sm">
                Thanks for reaching out. We&apos;ll get back to you within 24
                hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-black/70 uppercase tracking-widest">
                  Your Name
                </label>
                <Input
                  placeholder="Dr. Ramesh Kumar"
                  value={formState.name}
                  onChange={(e) =>
                    setFormState({ ...formState, name: e.target.value })
                  }
                  required
                  className="border-black/15 focus:border-black rounded-xl h-12 text-base font-medium placeholder:text-black/30"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-black/70 uppercase tracking-widest">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="you@yourclinic.com"
                  value={formState.email}
                  onChange={(e) =>
                    setFormState({ ...formState, email: e.target.value })
                  }
                  required
                  className="border-black/15 focus:border-black rounded-xl h-12 text-base font-medium placeholder:text-black/30"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-black/70 uppercase tracking-widest">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell us what you need..."
                  value={formState.message}
                  onChange={(e) =>
                    setFormState({ ...formState, message: e.target.value })
                  }
                  className="w-full rounded-xl border border-black/15 bg-transparent px-4 py-3 text-base font-medium placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black resize-none transition-colors"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-black text-white text-base font-bold rounded-xl hover:bg-black/80 transition-colors shadow-md flex items-center justify-center gap-2 group"
              >
                Send Message
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
