"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Building,
  MapPin,
  Phone,
} from "lucide-react";

type Stage = 1 | 2 | 3 | 4; // 1: Basic, 2: Location, 3: Contact, 4: Success

export function ClinicOnboardingForm() {
  const [stage, setStage] = useState<Stage>(1);
  const [formData, setFormData] = useState({
    clinicName: "",
    category: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    address: "",
    workingDays: "",
    workingHours: "",
    mobile: "",
    email: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStage = () =>
    setStage((prev) => (prev < 4 ? ((prev + 1) as Stage) : prev));
  const prevStage = () =>
    setStage((prev) => (prev > 1 ? ((prev - 1) as Stage) : prev));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stage < 3) {
      nextStage();
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Submitted:", formData);
      setIsSubmitting(false);
      setStage(4); // Move to success stage
    }, 1500);
  };

  // Check if current stage is valid
  const isStage1Valid =
    formData.clinicName.length > 0 && formData.category.length > 0;
  const isStage2Valid =
    formData.country.length > 0 &&
    formData.state.length > 0 &&
    formData.city.length > 0 &&
    formData.pincode.length > 0 &&
    formData.address.length > 0;
  const isStage3Valid =
    formData.workingDays.length > 0 &&
    formData.workingHours.length > 0 &&
    formData.mobile.length > 0 &&
    formData.email.length > 0;

  if (stage === 4) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900">
          Application Submitted!
        </h2>
        <p className="text-neutral-600 max-w-sm">
          Thank you for applying to be a Clinqer. Your application has been
          submitted and you will be notified within{" "}
          <span className="font-semibold text-black">3-4 working days</span>.
        </p>
        <Button
          className="mt-6 w-full"
          onClick={() => (window.location.href = "/")}
        >
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Progress Tracker */}
      <div className="flex justify-between items-center mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-neutral-100 -z-10" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-black -z-10 transition-all duration-500"
          style={{ width: `${((stage - 1) / 2) * 100}%` }}
        />

        {[
          { num: 1, label: "Basic Info", icon: Building },
          { num: 2, label: "Location", icon: MapPin },
          { num: 3, label: "Contact", icon: Phone },
        ].map((step) => (
          <div
            key={step.num}
            className="flex flex-col items-center gap-2 bg-white px-2"
          >
            <div
              className={`
              h-10 w-10 bg-white rounded-full flex items-center justify-center border-2 transition-all duration-300
              ${stage >= step.num ? "border-black text-black" : "border-neutral-200 text-neutral-400"}
              ${stage === step.num ? "scale-110" : "scale-100"}
            `}
            >
              <step.icon className="h-5 w-5" />
            </div>
            <span
              className={`text-xs font-semibold ${stage >= step.num ? "text-black" : "text-neutral-400"}`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
        {/* Stage 1: Basic Information */}
        {stage === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-1">
              <label
                htmlFor="clinicName"
                className="text-sm font-medium text-neutral-900"
              >
                Clinic Name
              </label>
              <Input
                id="clinicName"
                name="clinicName"
                placeholder="e.g. HealthPlus Clinic"
                required
                value={formData.clinicName}
                onChange={handleChange}
                className="h-11"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="category"
                className="text-sm font-medium text-neutral-900"
              >
                Clinic Category
              </label>
              <Input
                id="category"
                name="category"
                placeholder="e.g. Dental, General Physician, Pediatric"
                required
                value={formData.category}
                onChange={handleChange}
                className="h-11"
              />
            </div>
          </div>
        )}

        {/* Stage 2: Location Details */}
        {stage === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-1">
              <label
                htmlFor="address"
                className="text-sm font-medium text-neutral-900"
              >
                Full Address
              </label>
              <Input
                id="address"
                name="address"
                placeholder="Street address, building, floor"
                required
                value={formData.address}
                onChange={handleChange}
                className="h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label
                  htmlFor="city"
                  className="text-sm font-medium text-neutral-900"
                >
                  City
                </label>
                <Input
                  id="city"
                  name="city"
                  placeholder="City"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="h-11"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="pincode"
                  className="text-sm font-medium text-neutral-900"
                >
                  Pincode
                </label>
                <Input
                  id="pincode"
                  name="pincode"
                  placeholder="Pincode"
                  required
                  value={formData.pincode}
                  onChange={handleChange}
                  className="h-11"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label
                  htmlFor="state"
                  className="text-sm font-medium text-neutral-900"
                >
                  State
                </label>
                <Input
                  id="state"
                  name="state"
                  placeholder="State"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  className="h-11"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="country"
                  className="text-sm font-medium text-neutral-900"
                >
                  Country
                </label>
                <Input
                  id="country"
                  name="country"
                  placeholder="Country"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  className="h-11"
                />
              </div>
            </div>
          </div>
        )}

        {/* Stage 3: Contact & Hours */}
        {stage === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label
                  htmlFor="mobile"
                  className="text-sm font-medium text-neutral-900"
                >
                  Mobile Number
                </label>
                <Input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  placeholder="+1 234 567 890"
                  required
                  value={formData.mobile}
                  onChange={handleChange}
                  className="h-11"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-neutral-900"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="clinic@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="h-11"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label
                  htmlFor="workingDays"
                  className="text-sm font-medium text-neutral-900"
                >
                  Working Days
                </label>
                <Input
                  id="workingDays"
                  name="workingDays"
                  placeholder="e.g. Mon - Sat"
                  required
                  value={formData.workingDays}
                  onChange={handleChange}
                  className="h-11"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="workingHours"
                  className="text-sm font-medium text-neutral-900"
                >
                  Working Hours
                </label>
                <Input
                  id="workingHours"
                  name="workingHours"
                  placeholder="e.g. 9:00 AM - 5:00 PM"
                  required
                  value={formData.workingHours}
                  onChange={handleChange}
                  className="h-11"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3 pt-4">
          {stage > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={prevStage}
              className="px-4 h-11"
              disabled={isSubmitting}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}

          <Button
            type="submit"
            className="flex-1 h-11"
            disabled={
              isSubmitting ||
              (stage === 1 && !isStage1Valid) ||
              (stage === 2 && !isStage2Valid) ||
              (stage === 3 && !isStage3Valid)
            }
          >
            {isSubmitting ? (
              "Submitting..."
            ) : stage === 3 ? (
              "Complete Application"
            ) : (
              <>
                Next Step
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
