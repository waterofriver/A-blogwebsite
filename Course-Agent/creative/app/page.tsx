import type { CSSProperties } from "react"

import { HeroSection } from "../pointer-ai-landing-page/components/hero-section"
import { DashboardPreview } from "../pointer-ai-landing-page/components/dashboard-preview"
import { SocialProof } from "../pointer-ai-landing-page/components/social-proof"
import { BentoSection } from "../pointer-ai-landing-page/components/bento-section"
import { LargeTestimonial } from "../pointer-ai-landing-page/components/large-testimonial"
import { PricingSection } from "../pointer-ai-landing-page/components/pricing-section"
import { TestimonialGridSection } from "../pointer-ai-landing-page/components/testimonial-grid-section"
import { FAQSection } from "../pointer-ai-landing-page/components/faq-section"
import { CTASection } from "../pointer-ai-landing-page/components/cta-section"
import { FooterSection } from "../pointer-ai-landing-page/components/footer-section"
import { AnimatedSection } from "../pointer-ai-landing-page/components/animated-section"

const landingThemeVars: CSSProperties = {
  "--background": "210 11% 7%",
  "--foreground": "160 14% 93%",
  "--muted": "240 2% 16%",
  "--muted-foreground": "160 14% 93% / 0.7",
  "--muted-foreground-light": "160 14% 93% / 0.5",
  "--muted-foreground-dark": "160 14% 93% / 0.6",
  "--card": "220 17% 98% / 0.01",
  "--card-foreground": "160 14% 93%",
  "--popover": "210 11% 7%",
  "--popover-foreground": "160 14% 93%",
  "--primary": "165 96% 71%",
  "--primary-foreground": "160 8% 6%",
  "--primary-dark": "160 100% 50%",
  "--primary-light": "160 48% 87%",
  "--secondary": "160 14% 93%",
  "--secondary-foreground": "165 14% 8%",
  "--accent": "240 2% 25%",
  "--accent-foreground": "240 2% 96%",
  "--border": "240 100% 100% / 0.08",
  "--border-light": "210 17% 6% / 0.1",
  "--border-dark": "210 17% 6% / 0.05",
  "--ring": "165 96% 71%",
  "--radius": "0.5rem",
}

export default function LandingPage() {
  return (
    <div
      className="min-h-screen bg-background relative overflow-hidden pb-0 text-foreground"
      style={landingThemeVars}
    >
      <div className="relative z-10">
        <main className="max-w-[1320px] mx-auto relative">
          <HeroSection />
          <div className="absolute bottom-[-150px] md:bottom-[-400px] left-1/2 transform -translate-x-1/2 z-30">
            <AnimatedSection>
              <DashboardPreview />
            </AnimatedSection>
          </div>
        </main>
        <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto px-6 mt-[411px] md:mt-[400px]" delay={0.1}>
          <SocialProof />
        </AnimatedSection>
        <AnimatedSection id="features-section" className="relative z-10 max-w-[1320px] mx-auto mt-16" delay={0.2}>
          <BentoSection />
        </AnimatedSection>
        <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16" delay={0.2}>
          <LargeTestimonial />
        </AnimatedSection>
        <AnimatedSection
          id="pricing-section"
          className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16"
          delay={0.2}
        >
          <PricingSection />
        </AnimatedSection>
        <AnimatedSection
          id="testimonials-section"
          className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16"
          delay={0.2}
        >
          <TestimonialGridSection />
        </AnimatedSection>
        <AnimatedSection id="faq-section" className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16" delay={0.2}>
          <FAQSection />
        </AnimatedSection>
        <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16" delay={0.2}>
          <CTASection />
        </AnimatedSection>
        <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16" delay={0.2}>
          <FooterSection />
        </AnimatedSection>
      </div>
    </div>
  )
}
