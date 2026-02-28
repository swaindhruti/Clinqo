import { Hero } from "@/components/features/landing/hero/hero";
import { AboutSection } from "@/components/features/landing/about/about-section";
import { ProblemsSection } from "@/components/features/landing/problems/problems-section";
import { CoversSection } from "@/components/features/landing/covers/covers-section";
import { EmpowerSection } from "@/components/features/landing/empower/empower-section";
import { FAQSection } from "@/components/features/landing/faq/faq-section";

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen bg-transparent">
      <main className="w-full flex-col items-center justify-center">
        <Hero />
        <AboutSection />
        <ProblemsSection />
        <CoversSection />
        <EmpowerSection />
        <FAQSection />
      </main>
    </div>
  );
}
