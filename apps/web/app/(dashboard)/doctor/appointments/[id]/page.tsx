import { AppointmentDetailsSection } from "@/components/features/dashboard/doctor/appointments/appointment-details";

export default async function AppointmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="flex flex-1 flex-col p-6">
      <AppointmentDetailsSection appointmentId={id} />
    </div>
  );
}
