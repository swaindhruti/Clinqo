"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Stethoscope,
  Settings,
  Users,
  CalendarDays,
  FileText,
  BarChart3,
  LogOut,
  User,
  MessageSquare,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

// Role-based navigation configuration
const navigationConfig = {
  clinic: [
    { title: "Dashboard", url: "/clinic", icon: BarChart3 },
    { title: "Doctors", url: "/clinic/doctors", icon: Stethoscope },
    { title: "Patients", url: "/clinic/patients", icon: Users },
    { title: "Appointments", url: "/clinic/appointments", icon: CalendarDays },
    { title: "Records", url: "/clinic/records", icon: FileText },
    { title: "Settings", url: "/clinic/settings", icon: Settings },
  ],
  doctor: [
    { title: "Overview", url: "/doctor", icon: BarChart3 },
    { title: "My Patients", url: "/doctor/patients", icon: Users },
    { title: "Schedule", url: "/doctor/schedule", icon: CalendarDays },
    { title: "Consultations", url: "/doctor/consultations", icon: FileText },
    { title: "Profile", url: "/doctor/profile", icon: User },
  ],
  admin: [
    { title: "Overview", url: "/admin?tab=overview", icon: BarChart3 },
    { title: "Clinic Management", url: "/admin?tab=clinics", icon: Building2 },
    {
      title: "Doctor Management",
      url: "/admin?tab=doctors",
      icon: Stethoscope,
    },
    { title: "User Queries", url: "/admin?tab=queries", icon: MessageSquare },
    {
      title: "All Consultations",
      url: "/admin?tab=consultations",
      icon: CalendarDays,
    },
    {
      title: "Mass Communication",
      url: "/admin?tab=communication",
      icon: MessageSquare,
    },
  ],
};

export function AppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Determine role based on pathname
  let role: "clinic" | "doctor" | "admin" = "clinic"; // default fallback
  if (pathname.startsWith("/doctor")) role = "doctor";
  if (pathname.startsWith("/admin")) role = "admin";

  const navigationItems = navigationConfig[role];
  const currentTab = searchParams.get("tab") || "overview";

  return (
    <Sidebar>
      {/* Sidebar Header - Branding */}
      <SidebarHeader className="h-16 flex items-center justify-center border-b">
        <Link href="/" className="flex items-center gap-2 px-4 w-full">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-black text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
            >
              <path d="M12 2v20M17 5l-10 14M22 12H2M19 17L5 7" />
            </svg>
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-bold tracking-tight text-lg">Clinqo</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {role} Portal
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Sidebar Main Content - Role Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                let isActive = false;
                if (item.url.includes("?tab=")) {
                  isActive = item.url.includes(`tab=${currentTab}`);
                } else {
                  isActive = pathname === item.url;
                }
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      {/* Sidebar Footer - User Actions */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Link href="/sign-in">
                <LogOut />
                <span>Sign Out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
