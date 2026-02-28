import { AppSidebar } from "@/components/ui/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Suspense } from "react";

import { DashboardHeader } from "@/components/ui/dashboard-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <Suspense fallback={null}>
          <AppSidebar />
        </Suspense>
        <SidebarInset className="bg-neutral-50 min-h-screen">
          <Suspense
            fallback={
              <header className="h-16 flex shrink-0 items-center justify-between gap-2 border-b bg-white px-4 md:px-6 shadow-sm z-10 sticky top-0" />
            }
          >
            <DashboardHeader />
          </Suspense>
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
