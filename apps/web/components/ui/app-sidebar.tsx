"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Stethoscope,
  Settings,
  CalendarDays,
  BarChart3,
  LogOut,
  User,
  MessageSquare,
  ChevronRight,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Role-based navigation configuration
type NavItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  isActive?: boolean;
  items?: { title: string; url: string }[];
};

type NavigationConfig = {
  clinic: NavItem[];
  doctor: NavItem[];
  admin: NavItem[];
};

const navigationConfig: NavigationConfig = {
  clinic: [
    { title: "Overview", url: "/clinic?tab=overview", icon: BarChart3 },
    {
      title: "Appointments",
      url: "/clinic?tab=appointments",
      icon: CalendarDays,
      isActive: true, // Default open for demonstration or matching route
      items: [
        { title: "Today's", url: "/clinic?tab=appointments&view=today" },
        { title: "Upcoming", url: "/clinic?tab=appointments&view=upcoming" },
        { title: "Past", url: "/clinic?tab=appointments&view=past" },
      ],
    },
    {
      title: "Management",
      url: "/clinic?tab=settings",
      icon: Settings,
      isActive: false,
      items: [
        {
          title: "Operating Schedule",
          url: "/clinic?tab=settings&view=operating",
        },
        { title: "Doctor Schedule", url: "/clinic?tab=settings&view=doctor" },
      ],
    },
  ],
  doctor: [
    {
      title: "Today's Appointments",
      url: "/doctor?tab=appointments",
      icon: CalendarDays,
    },
    { title: "My Schedule", url: "/doctor?tab=schedule", icon: CalendarDays },
    { title: "Profile", url: "/doctor?tab=profile", icon: User },
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
      isActive: true,
      items: [
        { title: "Today's", url: "/admin?tab=consultations&view=today" },
        { title: "Upcoming", url: "/admin?tab=consultations&view=upcoming" },
        { title: "Past", url: "/admin?tab=consultations&view=past" },
      ],
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
  const currentView = searchParams.get("view") || "today";

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
                let isMainActive = false;
                if (item.url.includes("?tab=")) {
                  isMainActive = item.url.includes(`tab=${currentTab}`);
                } else {
                  isMainActive = pathname === item.url;
                }

                if (item.items && item.items.length > 0) {
                  return (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen={isMainActive || item.isActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            isActive={isMainActive}
                          >
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => {
                              const isSubActive =
                                isMainActive &&
                                subItem.url.includes(`view=${currentView}`);
                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isSubActive}
                                  >
                                    <Link href={subItem.url}>
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isMainActive}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        {item.icon && <item.icon />}
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
