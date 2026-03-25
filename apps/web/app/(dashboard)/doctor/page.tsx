import { OverviewSection } from "@/components/features/dashboard/doctor/overview/overview-section";
import { AppointmentsSection } from "@/components/features/dashboard/doctor/appointments/appointments-section";
import { ScheduleSection } from "@/components/features/dashboard/doctor/schedule/schedule-section";
import { ProfileSection } from "@/components/features/dashboard/doctor/profile/profile-section";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function DoctorDashboard({ searchParams }: PageProps) {
  const params = await searchParams;
  // Extract the tab parameter from the URL, defaulting to 'overview'
  // Default to appointments as per user request for a simplified "Today's Appointments" view
  const tab = typeof params.tab === "string" ? params.tab : "appointments";

  // Determine which component to render based on the tab
  let ContentComponent = <AppointmentsSection />;
  if (tab === "schedule") {
    ContentComponent = <ScheduleSection />;
  } else if (tab === "profile") {
    ContentComponent = <ProfileSection />;
  } else if (tab === "overview") {
    ContentComponent = <OverviewSection />;
  }

  return <div className="flex flex-1 flex-col p-6">{ContentComponent}</div>;
}
