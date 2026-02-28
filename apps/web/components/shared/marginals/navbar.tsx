"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest: number) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      initial={{ y: "-150%" }}
      className="fixed top-4 left-0 right-0 z-50 mx-auto flex w-[calc(100%-2rem)] max-w-screen items-center justify-between rounded-lg bg-black/5 px-8 py-4 text-black shadow-xl backdrop-blur-md font-sans border border-black/10"
    >
      {/* Left: Logo */}
      <div className="flex-1">
        <Link href="/" className="inline-flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7 text-black"
          >
            <path d="M12 2v20M17 5l-10 14M22 12H2M19 17L5 7" />
          </svg>
          <span className="text-2xl font-bold tracking-tight">Clinqo</span>
        </Link>
      </div>

      {/* Middle: Nav Items (Hidden on small screens) */}
      <div className="hidden md:flex items-center space-x-8 text-lg font-semibold text-black">
        {[
          { name: "Home", href: "/" },
          { name: "About Us", href: "/#about" },
          { name: "Problems We Solve", href: "/#problems" },
          { name: "How it Works", href: "/how-it-works" },
          { name: "Products", href: "/products" },
          { name: "Contact Us", href: "/contact-us" },
        ].map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="relative py-1 after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-black after:origin-bottom-left after:scale-x-0 after:transition-transform hover:after:scale-x-100"
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Right: Action Button */}
      <div className="flex-1 flex justify-end">
        <Link
          href="/sign-in"
          className="group flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-base font-bold text-white transition-all hover:scale-105 active:scale-95"
        >
          Be a Clinqer
          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-45 rotate-45" />
        </Link>
      </div>
    </motion.nav>
  );
}
