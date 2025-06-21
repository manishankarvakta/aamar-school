import { HeroSection } from "@/components/sections/hero"
import {TestimonialsSection} from "@/components/sections/testimonials"
import { Button } from "@/components/ui/button"
import FeaturesPage from "./(marketing)/features/page"
import { FeaturesSection } from "@/components/sections/features"
import { PricingSection } from "@/components/sections/pricing"
import { CTASection } from "@/components/sections/cta"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen min-w-screen">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      {/* <FooterSection /> */}
      <Footer />
    </main>
  )
} 