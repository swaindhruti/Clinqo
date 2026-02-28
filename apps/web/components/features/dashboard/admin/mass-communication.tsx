"use client";

import { useState } from "react";
import {
  Building2,
  Send,
  CheckCircle2,
  Stethoscope,
  History,
  Calendar,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MassCommunication() {
  const [audience, setAudience] = useState<"doctors" | "clinics">("doctors");
  const [scope, setScope] = useState<"all" | "selective">("all");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sent, setSent] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Dummy selective lists
  const dummyDoctors = [
    { id: "d1", name: "Dr. Sarah Chen", specialty: "Cardiology" },
    { id: "d2", name: "Dr. Marcus Johnson", specialty: "Orthopedics" },
    { id: "d3", name: "Dr. James Wilson", specialty: "Dermatology" },
    { id: "d4", name: "Dr. Anita Patel", specialty: "Pediatrics" },
    { id: "d5", name: "Dr. Emily Rostova", specialty: "Neurology" },
  ];

  const dummyClinics = [
    { id: "c1", name: "MetroHealth Center", location: "Downtown" },
    { id: "c2", name: "Pioneer Orthopedics", location: "Westside" },
    { id: "c3", name: "Sunrise Care Hub", location: "East Campus" },
    { id: "c4", name: "Westside Dental", location: "Westside" },
  ];

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !content) return;
    if (scope === "selective" && selectedIds.length === 0) return;

    // Simulate sending email
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setSubject("");
      setContent("");
      setSelectedIds([]);
      setScope("all");
    }, 4000);
  };

  const dummyHistory = [
    {
      id: "h1",
      subject: "Platform Maintenance Notice",
      date: "2023-10-15",
      time: "10:00 AM",
      audience: "All Doctors",
    },
    {
      id: "h2",
      subject: "New Clinic Feature Release",
      date: "2023-10-12",
      time: "02:30 PM",
      audience: "All Clinics",
    },
    {
      id: "h3",
      subject: "Policy Update: Telehealth",
      date: "2023-10-05",
      time: "09:15 AM",
      audience: "Selective",
    },
    {
      id: "h4",
      subject: "Welcome to Clinqo Platform",
      date: "2023-09-20",
      time: "11:00 AM",
      audience: "All Doctors",
    },
    {
      id: "h5",
      subject: "System Upgrade v2.1",
      date: "2023-09-15",
      time: "08:00 AM",
      audience: "All Clinics",
    },
    {
      id: "h6",
      subject: "Q3 Townhall Meeting Link",
      date: "2023-09-01",
      time: "01:00 PM",
      audience: "Selective",
    },
  ];

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500 w-full mx-auto h-[calc(100vh-120px)]">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
          Mass Communication
        </h2>
        <p className="text-muted-foreground mt-1">
          Draft and send emails to user groups across the platform.
        </p>
      </div>

      <div className="flex-1 min-h-0 bg-white border border-neutral-200 shadow-sm rounded-xl overflow-hidden flex">
        {/* LEFT PANEL: Form */}
        <div className="flex-1 flex flex-col border-r border-neutral-200 relative min-w-0">
          {sent ? (
            <div className="flex flex-col items-center justify-center p-12 text-center animate-in zoom-in duration-300 flex-1">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">
                Message Dispatched Successfully
              </h3>
              <p className="text-neutral-500 max-w-[300px]">
                Your communication has been queued and will be delivered to the
                selected recipients shortly.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSend}
              className="p-5 md:p-6 flex flex-col flex-1 min-h-0"
            >
              {/* Top Half: Audience & Scope side-by-side */}
              <div className="flex flex-col md:flex-row gap-6 h-[45%] min-h-0 shrink-0">
                {/* Step 1: Target Audience */}
                <div className="flex-1 flex flex-col space-y-3 min-h-0">
                  <div className="shrink-0">
                    <Label className="text-base font-semibold text-neutral-900">
                      1. Target Audience
                    </Label>
                    <p className="text-xs text-neutral-500 mt-1 cursor-default line-clamp-1">
                      Choose which group of users you wish to contact.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
                    <button
                      type="button"
                      onClick={() => {
                        setAudience("doctors");
                        setSelectedIds([]);
                      }}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all h-full ${
                        audience === "doctors"
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50"
                      }`}
                    >
                      <Stethoscope className="h-5 w-5 shrink-0" />
                      <span className="font-semibold text-sm">
                        Registered Doctors
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAudience("clinics");
                        setSelectedIds([]);
                      }}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all h-full ${
                        audience === "clinics"
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50"
                      }`}
                    >
                      <Building2 className="h-5 w-5 shrink-0" />
                      <span className="font-semibold text-sm">
                        Registered Clinics
                      </span>
                    </button>
                  </div>
                </div>

                {/* Step 2: Distribution Scope */}
                <div className="flex-1 space-y-3 flex flex-col min-h-0 border-t md:border-t-0 pt-4 md:pt-0 border-neutral-100">
                  <div className="shrink-0">
                    <Label className="text-base font-semibold text-neutral-900">
                      2. Distribution Scope
                    </Label>
                    <p className="text-xs text-neutral-500 mt-1 cursor-default line-clamp-1">
                      Send to everyone or select specific recipients.
                    </p>
                  </div>
                  <div className="flex gap-6 pt-1 shrink-0">
                    <label
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => setScope("all")}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${scope === "all" ? "border-blue-600 bg-blue-50" : "border-neutral-300 group-hover:border-blue-400 bg-white"}`}
                      >
                        {scope === "all" && (
                          <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                        )}
                      </div>
                      <span
                        className={`font-semibold text-sm ${scope === "all" ? "text-blue-700" : "text-neutral-600 group-hover:text-neutral-900"}`}
                      >
                        All {audience === "doctors" ? "Doctors" : "Clinics"}
                      </span>
                    </label>
                    <label
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => setScope("selective")}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${scope === "selective" ? "border-blue-600 bg-blue-50" : "border-neutral-300 group-hover:border-blue-400 bg-white"}`}
                      >
                        {scope === "selective" && (
                          <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                        )}
                      </div>
                      <span
                        className={`font-semibold text-sm ${scope === "selective" ? "text-blue-700" : "text-neutral-600 group-hover:text-neutral-900"}`}
                      >
                        Selective
                      </span>
                    </label>
                  </div>

                  {scope === "selective" && (
                    <div className="mt-2 border border-neutral-200 rounded-md overflow-hidden flex-1 flex flex-col min-h-0">
                      <div className="bg-neutral-50/80 border-b border-neutral-200 px-3 py-2 text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex justify-between rounded-t-lg shrink-0 items-center">
                        <span>Available Selection</span>
                        <span className="text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full leading-none">
                          {selectedIds.length} Selected
                        </span>
                      </div>
                      <div className="overflow-y-auto p-2 flex flex-col gap-1.5 bg-white flex-1 min-h-0">
                        {audience === "doctors"
                          ? dummyDoctors.map((doc) => (
                              <label
                                key={doc.id}
                                className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all ${selectedIds.includes(doc.id) ? "bg-blue-50/50 border-blue-200 shadow-sm" : "border-transparent hover:bg-neutral-50 hover:border-neutral-200"}`}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedIds.includes(doc.id)}
                                    onChange={() => handleSelect(doc.id)}
                                    className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                                  />
                                  <span className="font-semibold text-sm text-neutral-900 line-clamp-1">
                                    {doc.name}
                                  </span>
                                </div>
                                <span className="text-[11px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md shrink-0 ml-2 whitespace-nowrap">
                                  {doc.specialty}
                                </span>
                              </label>
                            ))
                          : dummyClinics.map((clinic) => (
                              <label
                                key={clinic.id}
                                className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all ${selectedIds.includes(clinic.id) ? "bg-blue-50/50 border-blue-200 shadow-sm" : "border-transparent hover:bg-neutral-50 hover:border-neutral-200"}`}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedIds.includes(clinic.id)}
                                    onChange={() => handleSelect(clinic.id)}
                                    className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                                  />
                                  <span className="font-semibold text-sm text-neutral-900 line-clamp-1">
                                    {clinic.name}
                                  </span>
                                </div>
                                <span className="text-[11px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md shrink-0 ml-2 whitespace-nowrap">
                                  {clinic.location}
                                </span>
                              </label>
                            ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Half: Composer */}
              <div className="flex flex-col flex-1 pt-4 md:pt-5 border-t border-neutral-100 min-h-0 mt-4 md:mt-5 gap-3">
                <div className="shrink-0 flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold text-neutral-900">
                      3. Compose Message
                    </Label>
                    <p className="text-xs text-neutral-500 mt-1 cursor-default line-clamp-1">
                      This email will be delivered to the target group.
                    </p>
                  </div>
                  {/* Submit Action placed efficiently in the remaining header space */}
                  <Button
                    type="submit"
                    disabled={
                      !subject ||
                      !content ||
                      (scope === "selective" && selectedIds.length === 0)
                    }
                    className="gap-2 shrink-0"
                  >
                    <Send className="h-4 w-4" />
                    Dispatch
                  </Button>
                </div>

                <div className="space-y-3 flex-1 flex flex-col min-h-0 border border-neutral-200 rounded-lg p-3 bg-neutral-50">
                  <div className="space-y-1.5 shrink-0">
                    <Label
                      htmlFor="subject"
                      className="text-xs font-semibold text-neutral-700"
                    >
                      Email Subject <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="subject"
                      placeholder="e.g. Important Update regarding Platform SLA"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="focus-visible:ring-blue-600 bg-white"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                    <Label
                      htmlFor="content"
                      className="text-xs font-semibold text-neutral-700"
                    >
                      Message Content <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      id="content"
                      className="flex-1 w-full rounded-md border border-neutral-200 bg-white px-3 py-3 text-sm ring-offset-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none leading-relaxed"
                      placeholder="Type your message here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* RIGHT PANEL: Previous Communications */}
        <div className="w-full md:w-[280px] lg:w-[360px] shrink-0 bg-neutral-50/50 flex flex-col border-t md:border-t-0 md:border-l border-neutral-200 min-w-0">
          <div className="p-4 border-b border-neutral-200 bg-white flex justify-between items-center shrink-0">
            <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
              <History className="h-4 w-4 text-neutral-500" />
              Previous Comms
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {!showHistory ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 h-full min-h-[300px]">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <History className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-semibold text-neutral-900 mb-2">
                  History Hidden
                </h4>
                <p className="text-xs text-neutral-500 mb-4 max-w-[200px]">
                  Load previous communications to view past announcements and
                  messages sent.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(true)}
                >
                  Load Previous
                </Button>
              </div>
            ) : (
              dummyHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm hover:border-blue-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4
                      className="font-semibold text-sm text-neutral-900 line-clamp-2 leading-tight"
                      title={item.subject}
                    >
                      {item.subject}
                    </h4>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-medium text-neutral-500 mt-2 pt-2 border-t border-neutral-100">
                    <span className="flex items-center gap-1.5 bg-neutral-100 px-2 py-0.5 rounded-full">
                      <Users className="h-3 w-3" /> {item.audience}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" /> {item.date} {item.time}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
