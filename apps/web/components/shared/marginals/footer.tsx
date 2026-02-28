import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative w-screen pt-16 px-6 md:px-12 font-sans bg-white border-t border-black/10 overflow-hidden">
      <div className="mx-auto w-full flex flex-col gap-16 md:gap-24">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8">
          {/* Top Left: Typography & Tagline */}
          <div className="flex flex-col gap-6 max-w-sm">
            <span className="text-sm font-semibold text-black/60 uppercase tracking-widest">
              Clinqo Copyrights &copy; 2026
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-black leading-tight tracking-tight uppercase">
              Healing lives, restoring smiles:{" "}
              <br className="hidden md:block" /> Your wellness begins with us
            </h3>
          </div>

          {/* Top Right: Links Columns */}
          <div className="grid grid-cols-2 gap-8 md:ml-auto">
            <div className="flex flex-col gap-4">
              <span className="text-sm font-bold text-black uppercase tracking-widest mb-2">
                Resources
              </span>
              <Link
                href="#"
                className="text-black/70 hover:text-black font-medium transition-colors"
              >
                Blog
              </Link>
              <Link
                href="#"
                className="text-black/70 hover:text-black font-medium transition-colors"
              >
                Events
              </Link>
              <Link
                href="#"
                className="text-black/70 hover:text-black font-medium transition-colors"
              >
                Help Centre
              </Link>
              <Link
                href="#"
                className="text-black/70 hover:text-black font-medium transition-colors"
              >
                Support
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-sm font-bold text-black uppercase tracking-widest mb-2">
                Legal
              </span>
              <Link
                href="#"
                className="text-black/70 hover:text-black font-medium transition-colors"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-black/70 hover:text-black font-medium transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-black/70 hover:text-black font-medium transition-colors"
              >
                Cookies
              </Link>
              <Link
                href="#"
                className="text-black/70 hover:text-black font-medium transition-colors"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Contact & Social */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-4 border-b border-black/10">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-black/60 uppercase tracking-widest">
              Mail
            </span>
            <a
              href="mailto:hello@clinqo.com"
              className="text-lg font-bold text-black hover:underline"
            >
              hello@clinqo.com
            </a>
          </div>

          <div className="flex flex-col gap-1 md:text-right">
            <span className="text-sm font-semibold text-black/60 uppercase tracking-widest">
              Socials
            </span>
            <div className="flex flex-wrap items-center gap-4 text-lg font-bold text-black md:justify-end">
              <a
                href="https://instagram.com/clinqo"
                className="hover:underline"
              >
                Instagram
              </a>
              <a href="https://twitter.com/clinqo" className="hover:underline">
                Twitter
              </a>
              <a
                href="https://linkedin.com/company/clinqo"
                className="hover:underline"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Giant Footer Text */}
        <div className="w-full flex justify-center -mb-[4vw] md:-mb-[2vw]">
          <h1 className="text-[24vw] font-black text-black leading-none opacity-90 select-none">
            CLINQO
          </h1>
        </div>
      </div>
    </footer>
  );
}
