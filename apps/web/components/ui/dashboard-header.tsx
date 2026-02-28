"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useState, useEffect } from "react";

export function DashboardHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      setMounted(true);
      setTime(new Date());
      interval = setInterval(() => {
        setTime(new Date());
      }, 5000); // update every 5 seconds
    }, 0);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, []);

  // Determine role based on pathname
  let role = "Clinic";
  if (pathname.startsWith("/doctor")) role = "Doctor";
  if (pathname.startsWith("/admin")) role = "Admin";

  // Determine active tab
  const tab = searchParams.get("tab") || "overview";

  let pageName = "Overview";
  if (role === "Admin") {
    if (tab === "clinics") pageName = "Clinic Management";
    if (tab === "doctors") pageName = "Doctor Management";
    if (tab === "queries") pageName = "User Queries";
    if (tab === "consultations") pageName = "All Consultations";
    if (tab === "communication") pageName = "Mass Communication";
    if (tab === "settings") pageName = "Global Settings";
  } else {
    // For clinic or doctor non-SPA routes (basic fallback)
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 1) {
      pageName = segments[1].charAt(0).toUpperCase() + segments[1].slice(1);
    } else {
      pageName = "Dashboard";
    }
  }

  const dateStr = time?.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const timeStr = time?.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-white px-4 md:px-6 shadow-sm z-10 sticky top-0">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 text-neutral-500 hover:text-neutral-900 transition-colors" />
        <Separator
          orientation="vertical"
          className="mr-2 h-4 hidden md:block"
        />
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/${role.toLowerCase()}`}
                className="font-medium text-neutral-500 transition-colors hover:text-neutral-900"
              >
                {role} Portal
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-neutral-900">
                {pageName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Date and Time Display */}
        <div className="hidden md:flex flex-col items-end leading-none min-w-[120px]">
          {mounted && time ? (
            <>
              <span className="text-sm font-bold text-neutral-800 tracking-tight">
                {timeStr}
              </span>
              <span className="text-xs font-medium text-neutral-500 mt-1">
                {dateStr}
              </span>
            </>
          ) : (
            <div className="h-8 w-24 animate-pulse bg-neutral-100 rounded-md"></div>
          )}
        </div>

        <Separator orientation="vertical" className="h-8 hidden md:block" />

        {/* User Profile */}
        <button className="flex items-center gap-3 hover:bg-neutral-50 p-1.5 rounded-xl transition-colors text-left -mr-1.5 focus:outline-none focus:ring-2 focus:ring-neutral-200">
          <div className="hidden flex-col items-end sm:flex leading-none">
            <span className="text-sm font-bold text-neutral-900">John Doe</span>
            <span className="text-xs font-medium text-neutral-500 mt-1">
              System Administrator
            </span>
          </div>
          <div className="h-9 w-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-sm font-bold text-blue-700 shadow-sm">
            JD
          </div>
        </button>
      </div>
    </header>
  );
}
