export default function SignInPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
          Welcome back
        </h1>
        <p className="text-neutral-500 mt-2 text-sm">
          Select your account type to continue
        </p>
      </div>

      <div className="flex flex-col space-y-3">
        {/* Server Components are fast! These links act as buttons. */}
        <a
          href="#"
          className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 bg-white hover:border-black hover:shadow-sm transition-all group"
        >
          <div className="flex flex-col text-left">
            <span className="font-semibold text-neutral-900">Clinic</span>
            <span className="text-xs text-neutral-500 mt-0.5">
              Manage your clinic & patients
            </span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-neutral-400 group-hover:text-black transition-colors"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </a>

        <a
          href="#"
          className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 bg-white hover:border-black hover:shadow-sm transition-all group"
        >
          <div className="flex flex-col text-left">
            <span className="font-semibold text-neutral-900">Doctor</span>
            <span className="text-xs text-neutral-500 mt-0.5">
              Access your schedule & records
            </span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-neutral-400 group-hover:text-black transition-colors"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </a>

        <a
          href="#"
          className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 bg-white hover:border-black hover:shadow-sm transition-all group"
        >
          <div className="flex flex-col text-left">
            <span className="font-semibold text-neutral-900">
              Company Admin
            </span>
            <span className="text-xs text-neutral-500 mt-0.5">
              System management & overview
            </span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-neutral-400 group-hover:text-black transition-colors"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </a>
      </div>

      <div className="pt-4 mt-2 border-t border-neutral-100 text-center">
        <a
          href="/onboarding"
          className="text-sm text-neutral-600 hover:text-black hover:underline underline-offset-4 transition-colors inline-flex items-center gap-1"
        >
          New on platform?
          <span className="font-semibold text-black">Be a Clinqer</span>
        </a>
      </div>
    </div>
  );
}
