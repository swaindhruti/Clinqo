import { OverviewSection } from "@/components/features/dashboard/admin/overview-section";
import { DoctorManagement } from "@/components/features/dashboard/admin/doctor-management";
import { ClinicManagement } from "@/components/features/dashboard/admin/clinic-management";
import { QueriesManagement } from "@/components/features/dashboard/admin/queries-management";
import { ConsultationsManagement } from "@/components/features/dashboard/admin/consultations-management";
import { MassCommunication } from "@/components/features/dashboard/admin/mass-communication";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminDashboard({ searchParams }: PageProps) {
  const params = await searchParams;
  // Extract the tab parameter from the URL, defaulting to 'overview'
  const tab = typeof params.tab === "string" ? params.tab : "overview";

  // Determine which component to render based on the tab
  let ContentComponent = <OverviewSection />;
  if (tab === "doctors") {
    ContentComponent = <DoctorManagement />;
  } else if (tab === "clinics") {
    ContentComponent = <ClinicManagement />;
  } else if (tab === "queries") {
    ContentComponent = <QueriesManagement />;
  } else if (tab === "consultations") {
    ContentComponent = <ConsultationsManagement />;
  } else if (tab === "communication") {
    ContentComponent = <MassCommunication />;
  }

  return <div className="flex flex-1 flex-col p-6">{ContentComponent}</div>;
}
