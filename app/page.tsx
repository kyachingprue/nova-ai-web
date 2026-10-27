import AmbientBackground from "@/components/AmbientBackground";
import Hero from "@/components/Hero";
import LogoCloud from "@/components/LogoCloud";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import ConsoleDemo from "@/components/ConsoleDemo";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import IntelligenceSection from "@/components/IntelligenceSection";

export default function Home() {
  return (
    <>
      <AmbientBackground />
      <main>
        <Hero />
        <LogoCloud />
        <Features />
        <HowItWorks />
        <ConsoleDemo />
        <IntelligenceSection />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
