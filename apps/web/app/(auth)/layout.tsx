import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans relative overflow-hidden">
      {/* Header Container */}
      <header className="w-full p-6 md:px-12 flex justify-between items-center z-10">
        {/* Back Button */}
        <Link
          href="/"
          className="group flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-black transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-neutral-200 shadow-sm group-hover:border-neutral-300 transition-all">
            <ChevronLeft className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline">Back to Home</span>
        </Link>

        {/* Logo */}
        <Link href="/" className="inline-flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-black"
          >
            <path d="M12 2v20M17 5l-10 14M22 12H2M19 17L5 7" />
          </svg>
          <span className="text-xl font-bold tracking-tight text-black">
            Clinqo
          </span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center items-center p-6 relative z-10">
        <div className="w-full max-w-xl bg-white/90 backdrop-blur-xl border border-neutral-200 rounded-3xl shadow-2xl shadow-black/5 p-8 md:p-10 relative overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
