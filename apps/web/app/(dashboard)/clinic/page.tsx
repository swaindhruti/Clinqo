import { OverviewSection } from "@/components/features/dashboard/clinic/overview/overview-section";
import { AppointmentsManagement } from "@/components/features/dashboard/clinic/appointments/appointments-management";
import { SettingsSection } from "@/components/features/dashboard/clinic/settings/settings-section";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ClinicDashboard({ searchParams }: PageProps) {
  const params = await searchParams;
  // Extract the tab parameter from the URL, defaulting to 'overview'
  const tab = typeof params.tab === "string" ? params.tab : "overview";

  // Determine which component to render based on the tab
  let ContentComponent = <OverviewSection />;
  if (tab === "appointments") {
    ContentComponent = <AppointmentsManagement />;
  } else if (tab === "settings") {
    ContentComponent = <SettingsSection />;
  }

  return <div className="flex flex-1 flex-col p-6">{ContentComponent}</div>;
}
