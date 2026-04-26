import { Header } from "../components/layout/Header";
import { Hero } from "../components/sections/Hero";
import { Features } from "../components/sections/Features";
import { HowItWorks } from "../components/sections/HowItWorks";
import { AnalyticsPreview } from "../components/sections/AnalyticsPreview";
import { Pricing } from "../components/sections/Pricing";
import { CTA } from "../components/sections/CTA";
import { Footer } from "../components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#15231D] scroll-smooth">
      <Header />
      <Hero />
      <div id="features"><Features /></div>
      <HowItWorks />
      <div id="analytics"><AnalyticsPreview /></div>
      <div id="pricing"><Pricing /></div>
      <CTA />
      <Footer />
    </main>
  );
}
