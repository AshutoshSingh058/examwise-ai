import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { QuickActions } from "@/components/quick-actions"
import { DashboardSection } from "@/components/dashboard-section"
import { FeaturesSection } from "@/components/features-section"
import { HowItWorks } from "@/components/how-it-works"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  )
}
