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
    <div className="flex flex-col gap-5 animate-in fade-in duration-500 w-full mx-auto h-[calc(100vh-120px)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Mass Communication
          </h2>
          <p className="text-neutral-500 mt-1">
            Publish updates and announcements to specific user segments.
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white border border-neutral-200 shadow-sm rounded-xl overflow-hidden flex flex-col md:flex-row">
        {/* LEFT PANE: Filters */}
        <div className="w-full md:w-[280px] lg:w-[320px] shrink-0 border-b md:border-b-0 md:border-r border-neutral-200 bg-neutral-50/50 flex flex-col relative min-h-0 z-10 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)]">
          <div className="p-5 flex-1 overflow-y-auto space-y-8 min-h-0">
            {/* Step 1: Target Audience */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-bold text-neutral-900 uppercase tracking-widest text-[11px] mb-1 block">
                  Step 1: Segment
                </Label>
                <h3 className="text-neutral-900 font-semibold mb-1">
                  Target Audience
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Select the underlying user classification.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAudience("doctors");
                    setSelectedIds([]);
                  }}
                  className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border transition-all ${
                    audience === "doctors"
                      ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm ring-1 ring-blue-600/10"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 hover:shadow-sm"
                  }`}
                >
                  <Stethoscope className="h-5 w-5" />
                  <span className="font-semibold text-[13px]">Doctors</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAudience("clinics");
                    setSelectedIds([]);
                  }}
                  className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border transition-all ${
                    audience === "clinics"
                      ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm ring-1 ring-blue-600/10"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 hover:shadow-sm"
                  }`}
                >
                  <Building2 className="h-5 w-5" />
                  <span className="font-semibold text-[13px]">Clinics</span>
                </button>
              </div>
            </div>

            {/* Step 2: Distribution Scope */}
            <div className="space-y-4 pt-1">
              <div>
                <Label className="text-sm font-bold text-neutral-900 uppercase tracking-widest text-[11px] mb-1 block">
                  Step 2: Reach
                </Label>
                <h3 className="text-neutral-900 font-semibold mb-1">Scope</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Broadcast entirely or manually select.
                </p>
              </div>

              <div className="flex bg-white rounded-lg p-1 border border-neutral-200 shadow-sm">
                <button
                  type="button"
                  onClick={() => setScope("all")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-[13px] font-semibold transition-all ${
                    scope === "all"
                      ? "bg-neutral-900 text-white shadow-sm"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  Everyone
                </button>
                <button
                  type="button"
                  onClick={() => setScope("selective")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-[13px] font-semibold transition-all ${
                    scope === "selective"
                      ? "bg-neutral-900 text-white shadow-sm"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  Selective
                </button>
              </div>

              {scope === "selective" && (
                <div className="border border-neutral-200 rounded-xl overflow-hidden flex flex-col h-[280px] bg-white shadow-sm shrink-0 animate-in slide-in-from-top-2 duration-300">
                  <div className="bg-neutral-50/80 border-b border-neutral-100 px-3 py-2.5 flex items-center justify-between shrink-0">
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                      Directory Options
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                      {selectedIds.length} Picked
                    </span>
                  </div>
                  <div className="overflow-y-auto px-2 py-2 flex flex-col gap-1.5 flex-1 min-h-0 custom-scrollbar">
                    {audience === "doctors"
                      ? dummyDoctors.map((doc) => (
                          <label
                            key={doc.id}
                            className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all border ${
                              selectedIds.includes(doc.id)
                                ? "bg-blue-50/50 border-blue-200 shadow-sm"
                                : "border-transparent hover:bg-neutral-50/80 hover:border-neutral-200"
                            }`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(doc.id)}
                                onChange={() => handleSelect(doc.id)}
                                className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-600 cursor-pointer shrink-0"
                              />
                              <span className="font-semibold text-[13px] text-neutral-900 truncate">
                                {doc.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-medium text-neutral-500 border border-neutral-200 px-1.5 py-0.5 rounded shrink-0 ml-2">
                              {doc.specialty}
                            </span>
                          </label>
                        ))
                      : dummyClinics.map((clinic) => (
                          <label
                            key={clinic.id}
                            className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all border ${
                              selectedIds.includes(clinic.id)
                                ? "bg-blue-50/50 border-blue-200 shadow-sm"
                                : "border-transparent hover:bg-neutral-50/80 hover:border-neutral-200"
                            }`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(clinic.id)}
                                onChange={() => handleSelect(clinic.id)}
                                className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-600 cursor-pointer shrink-0"
                              />
                              <span className="font-semibold text-[13px] text-neutral-900 truncate">
                                {clinic.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-medium text-neutral-500 border border-neutral-200 px-1.5 py-0.5 rounded shrink-0 ml-2">
                              {clinic.location}
                            </span>
                          </label>
                        ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CENTER PANE: Composer */}
        <div className="flex-1 flex flex-col min-h-0 bg-white relative z-0">
          {sent ? (
            <div className="flex flex-col items-center justify-center p-12 text-center animate-in zoom-in duration-300 flex-1">
              <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mb-6 ring-4 ring-green-50">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                Broadcast Initiated
              </h3>
              <p className="text-neutral-500 max-w-[320px] text-[15px] leading-relaxed">
                Your communication has been encrypted and securely queued for
                immediate delivery across the network.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSend}
              className="flex-1 flex flex-col min-h-0 h-full"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
                <div>
                  <Label className="text-sm font-bold text-neutral-900 uppercase tracking-widest text-[11px] mb-1 block">
                    Step 3: Content
                  </Label>
                  <h3 className="text-lg font-bold text-neutral-900">
                    Compose Dispatch
                  </h3>
                  <p className="text-[13px] text-neutral-500 mt-0.5">
                    Craft the exact message that{" "}
                    {scope === "selective"
                      ? `${selectedIds.length} entities`
                      : `all ${audience}`}{" "}
                    will receive.
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={
                    !subject ||
                    !content ||
                    (scope === "selective" && selectedIds.length === 0)
                  }
                  className="gap-2 px-6 h-10 shadow-sm transition-all"
                >
                  <Send className="h-4 w-4" />
                  Dispatch Now
                </Button>
              </div>

              {/* Editor */}
              <div className="p-6 flex-1 flex flex-col min-h-0 gap-6 overflow-y-auto">
                <div className="space-y-2 shrink-0">
                  <Label
                    htmlFor="subject"
                    className="text-sm font-semibold text-neutral-800"
                  >
                    Subject Line <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="subject"
                    placeholder="E.g., Important Security Update for Clinics..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="focus-visible:ring-blue-600 text-[15px] p-5 h-14 bg-neutral-50/50 border-neutral-200 shadow-sm"
                    required
                  />
                </div>

                <div className="space-y-2 flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="content"
                      className="text-sm font-semibold text-neutral-800"
                    >
                      Message Body <span className="text-red-500">*</span>
                    </Label>
                    <span className="text-[11px] font-medium text-neutral-400 bg-neutral-100 flex items-center px-2 py-0.5 rounded-full">
                      Plain Text Mode
                    </span>
                  </div>
                  <textarea
                    id="content"
                    className="flex-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-[15px] ring-offset-white placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none leading-relaxed shadow-inner font-mono text-neutral-700"
                    placeholder="Greetings..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* RIGHT PANE: Previous Comms */}
        <div className="w-full md:w-[280px] lg:w-[340px] shrink-0 bg-[#F9FAFB] flex flex-col border-t md:border-t-0 md:border-l border-neutral-200 min-w-0 z-10 shadow-[-2px_0_8px_-4px_rgba(0,0,0,0.05)]">
          <div className="p-5 border-b border-neutral-200 bg-white flex justify-between items-center shrink-0">
            <div>
              <Label className="text-sm font-bold text-neutral-900 uppercase tracking-widest text-[11px] mb-1 block">
                Archive
              </Label>
              <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                <History className="h-4 w-4 text-blue-600" />
                Previous Comms
              </h3>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
            {!showHistory ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 min-h-[300px]">
                <div className="w-14 h-14 bg-white border border-neutral-200 shadow-sm text-neutral-400 rounded-full flex items-center justify-center mb-4">
                  <History className="h-6 w-6" />
                </div>
                <h4 className="text-[15px] font-bold text-neutral-900 mb-2">
                  History Hidden
                </h4>
                <p className="text-[13px] text-neutral-500 mb-6 max-w-[200px] leading-relaxed">
                  Conserve bandwidth by loading past announcements on demand.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(true)}
                  className="bg-white hover:bg-neutral-50 shadow-sm text-[13px] h-9 px-5"
                >
                  Load Archive
                </Button>
              </div>
            ) : (
              dummyHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4
                      className="font-bold text-[14px] text-neutral-900 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors"
                      title={item.subject}
                    >
                      {item.subject}
                    </h4>
                  </div>
                  <div className="flex flex-col gap-2 border-t border-neutral-100 pt-3">
                    <div className="flex items-center gap-2 text-[12px] font-medium text-neutral-600">
                      <Users className="h-3.5 w-3.5 text-neutral-400" />
                      {item.audience}
                    </div>
                    <div className="flex items-center gap-2 text-[12px] font-medium text-neutral-500">
                      <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                      {item.date} at {item.time}
                    </div>
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
