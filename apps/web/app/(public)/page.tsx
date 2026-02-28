import { Hero } from "@/components/features/hero/hero";
import { AboutSection } from "@/components/features/about/about-section";
import { ProblemsSection } from "@/components/features/problems/problems-section";
import { CoversSection } from "@/components/features/covers/covers-section";
import { EmpowerSection } from "@/components/features/empower/empower-section";
import { FAQSection } from "@/components/features/faq/faq-section";

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
