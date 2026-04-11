import { OverviewSection } from "@/components/features/dashboard/clinic/overview/overview-section";
import { AppointmentsManagement } from "@/components/features/dashboard/clinic/appointments/appointments-management";
import { DoctorsSection } from "@/components/features/dashboard/clinic/doctors/doctors-section";
import { CheckInSection } from "@/components/features/dashboard/clinic/check-in/check-in-section";
import { QueriesSection } from "@/components/features/dashboard/clinic/queries/queries-section";
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
    ContentComponent = <AppointmentsManagement visitType="consultation" />;
  } else if (tab === "doctors") {
    ContentComponent = <DoctorsSection />;
  } else if (tab === "checkin") {
    ContentComponent = <CheckInSection />;
  } else if (tab === "queries") {
    ContentComponent = <QueriesSection />;
  } else if (tab === "procedures") {
    ContentComponent = <AppointmentsManagement visitType="procedure" />;
  } else if (tab === "settings") {
    ContentComponent = <SettingsSection />;
  }

  return <div className="flex flex-1 flex-col p-6">{ContentComponent}</div>;
}
