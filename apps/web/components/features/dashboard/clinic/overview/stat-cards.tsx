import { Users, CalendarHeart, Stethoscope } from "lucide-react";

// Mock data fetching function to simulate Server Component data fetching
async function getClinicStats() {
  return [
    {
      title: "Total Patients",
      value: "1,248",
      icon: Users,
    },
    {
      title: "Appointments Today",
      value: "42",
      icon: CalendarHeart,
    },
    {
      title: "Doctors Available",
      value: "8",
      icon: Stethoscope,
    },
  ];
}

export async function StatCards() {
  const stats = await getClinicStats();

  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-3 w-full">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-white border border-neutral-200 shadow-sm aspect-video rounded-xl p-6 flex flex-col justify-center items-center text-center animate-in fade-in zoom-in duration-500"
        >
          <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 ring-4 ring-blue-50/50">
            <stat.icon className="h-6 w-6" />
          </div>
          <span className="text-sm font-semibold text-neutral-500 mb-1">
            {stat.title}
          </span>
          <span className="text-3xl font-bold text-neutral-900 tracking-tight">
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
