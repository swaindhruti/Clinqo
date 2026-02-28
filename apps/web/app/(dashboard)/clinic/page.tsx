export default function ClinicDashboard() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Clinic Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your clinic operations and performance.
          </p>
        </div>
      </div>

      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-white border border-neutral-200 shadow-sm aspect-video rounded-xl p-6 flex flex-col justify-center items-center text-center">
          <span className="text-sm font-medium text-neutral-500 mb-2">
            Total Patients
          </span>
          <span className="text-4xl font-bold text-neutral-900">1,248</span>
        </div>
        <div className="bg-white border border-neutral-200 shadow-sm aspect-video rounded-xl p-6 flex flex-col justify-center items-center text-center">
          <span className="text-sm font-medium text-neutral-500 mb-2">
            Appointments Today
          </span>
          <span className="text-4xl font-bold text-neutral-900">42</span>
        </div>
        <div className="bg-white border border-neutral-200 shadow-sm aspect-video rounded-xl p-6 flex flex-col justify-center items-center text-center">
          <span className="text-sm font-medium text-neutral-500 mb-2">
            Doctors Available
          </span>
          <span className="text-4xl font-bold text-neutral-900">8</span>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 shadow-sm min-h-[50vh] flex-1 rounded-xl p-6 flex items-center justify-center">
        <p className="text-neutral-500 font-medium">
          Main Dashboard Content Area
        </p>
      </div>
    </div>
  );
}
