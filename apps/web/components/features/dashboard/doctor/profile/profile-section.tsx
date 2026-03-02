import { User, Mail, Phone, MapPin, Award, Building2 } from "lucide-react";

// Mock Data for the Doctor Profile
const DOCTOR_PROFILE = {
  name: "Dr. Sarah Jenkins",
  specialization: "Senior Cardiologist",
  email: "sarah.jenkins@clinqo.com",
  phone: "+1 (555) 123-4567",
  location: "New York, NY",
  experience: "15+ Years",
  about:
    "Dr. Jenkins is a renowned cardiologist specializing in preventive cardiology and heart failure. She is committed to providing comprehensive cardiovascular care with a focus on early detection and lifestyle modifications.",
  clinics: [
    {
      id: "cli_1",
      name: "Downtown Medical Center",
      role: "Lead Cardiologist",
      address: "120 Broadway, New York, NY",
    },
    {
      id: "cli_2",
      name: "Uptown Heart Clinic",
      role: "Consultant",
      address: "450 5th Avenue, New York, NY",
    },
  ],
};

export function ProfileSection() {
  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header Profile Card */}
      <div className="bg-white border border-neutral-200 shadow-sm rounded-xl overflow-hidden flex flex-col">
        <div className="p-6 md:p-8 bg-neutral-50/50 flex flex-col md:flex-row items-center md:items-start gap-6 relative border-b border-neutral-100">
          <div className="w-24 h-24 bg-white rounded-full border border-neutral-200 shadow-sm flex items-center justify-center shrink-0">
            <div className="w-[88px] h-[88px] bg-neutral-100/50 rounded-full flex items-center justify-center text-neutral-400">
              <User className="w-10 h-10" />
            </div>
          </div>

          <div className="text-center md:text-left flex-1 pt-1">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
              {DOCTOR_PROFILE.name}
            </h2>
            <p className="text-blue-600 font-bold text-[15px] mt-1">
              {DOCTOR_PROFILE.specialization}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-white border border-neutral-200 px-5 py-2.5 text-sm font-bold text-neutral-700 shadow-sm shrink-0 md:mt-2">
            <Award className="w-4 h-4 text-blue-600" />
            <span>{DOCTOR_PROFILE.experience} Experience</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Info & About */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-neutral-200 shadow-sm rounded-xl overflow-hidden">
            <div className="p-5 md:p-6 border-b border-neutral-100 bg-neutral-50/50">
              <h3 className="text-lg font-bold text-neutral-900">About Me</h3>
              <p className="text-sm text-neutral-500 mt-1">
                Professional background and medical philosophy
              </p>
            </div>
            <div className="p-5 md:p-6">
              <p className="text-neutral-600 leading-relaxed text-[15px]">
                {DOCTOR_PROFILE.about}
              </p>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 shadow-sm rounded-xl overflow-hidden">
            <div className="p-5 md:p-6 border-b border-neutral-100 bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-neutral-500" />
                <h3 className="text-lg font-bold text-neutral-900">
                  Associated Clinics
                </h3>
              </div>
              <p className="text-sm text-neutral-500 mt-1">
                Registered locations within the Clinqo network
              </p>
            </div>

            <div className="p-5 md:p-6">
              <div className="flex flex-col gap-3">
                {DOCTOR_PROFILE.clinics.map((clinic) => (
                  <div
                    key={clinic.id}
                    className="p-4 rounded-xl border border-neutral-100 bg-neutral-50/30 hover:bg-blue-50/20 hover:border-neutral-200 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 text-[15px] group-hover:text-blue-700 transition-colors">
                          {clinic.name}
                        </h4>
                        <p className="text-sm text-neutral-500 mt-0.5">
                          {clinic.address}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex bg-white border border-neutral-200 text-neutral-600 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap shadow-sm">
                      {clinic.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Details */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-neutral-200 shadow-sm rounded-xl overflow-hidden">
            <div className="p-5 md:p-6 border-b border-neutral-100 bg-neutral-50/50">
              <h3 className="text-lg font-bold text-neutral-900">
                Contact Data
              </h3>
              <p className="text-sm text-neutral-500 mt-1">
                Direct communication channels
              </p>
            </div>

            <div className="p-5 md:p-6">
              <ul className="space-y-6">
                <li className="flex items-start gap-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-500 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden pt-0.5">
                    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      Email
                    </p>
                    <p className="text-[15px] font-medium text-neutral-900 truncate group-hover:text-blue-700 transition-colors">
                      {DOCTOR_PROFILE.email}
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-500 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      Phone
                    </p>
                    <p className="text-[15px] font-medium text-neutral-900 group-hover:text-blue-700 transition-colors">
                      {DOCTOR_PROFILE.phone}
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-500 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      Location
                    </p>
                    <p className="text-[15px] font-medium text-neutral-900 group-hover:text-blue-700 transition-colors">
                      {DOCTOR_PROFILE.location}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
