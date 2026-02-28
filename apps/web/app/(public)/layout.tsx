import { Navbar } from "@/components/shared/marginals/navbar";
import { GridBackground } from "@/components/shared/background/grid-background";
import { Footer } from "@/components/shared/marginals/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <GridBackground />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
