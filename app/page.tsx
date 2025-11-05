'use client';

import Hero from "@/components/ui/neural-network-hero";

export default function LandingPage() {
  return (
    <div className="w-screen h-screen flex flex-col relative">
      <Hero 
        title="Smart insights for smarter spending."
        description="SpendSense analyzes your financial patterns and delivers personalized recommendations powered by AI. Take control of your finances with clarity and confidence."
        badgeText="AI-Powered Insights"
        badgeLabel="Beta"
        ctaButtons={[
          { text: "Get started", href: "/login", primary: true },
          { text: "View demo", href: "/operator" }
        ]}
        microDetails={["Secure & Private", "Real-time Analysis", "Actionable Advice"]}
      />
    </div>
  );
}
