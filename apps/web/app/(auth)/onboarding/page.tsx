export default function OnboardingPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
          Clinic Onboarding
        </h1>
        <p className="text-neutral-500 mt-2 text-sm">
          Complete your clinic profile to get started
        </p>
      </div>

      <div className="pt-4">
        {/* We can dynamically load the form component */}
        <ClinicOnboardingForm />
      </div>

      <div className="pt-4 mt-2 border-t border-neutral-100 text-center">
        <a
          href="/sign-in"
          className="text-sm text-neutral-600 hover:text-black hover:underline underline-offset-4 transition-colors inline-flex items-center gap-1"
        >
          Already have an account?
          <span className="font-semibold text-black">Sign in</span>
        </a>
      </div>
    </div>
  );
}

// Inline definition of the form component to avoid importing for now.
// A more robust implementation would separate this into components/features/auth/clinic-onboarding-form.tsx
import { ClinicOnboardingForm } from "../../../components/features/auth/clinic-onboarding-form";
