import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pt-32 pb-20 lg:px-8 lg:pt-40 lg:pb-32">
      {/* Background gradient effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-1.5 text-sm">
          <span className="text-accent">AI-Powered</span>
          <span className="text-muted-foreground">Exam Preparation</span>
        </div>

        {/* Headline */}
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Study Smarter.{" "}
          <span className="text-muted-foreground">Score Better.</span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground lg:text-xl">
          AI exam copilot for college students. Get priority topics, likely questions, 
          study plans, and last-minute preparation help.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full rounded-full px-8">
              Start Preparing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full rounded-full px-8 sm:w-auto"
          >
            <Play className="mr-2 h-4 w-4" />
            Watch Demo
          </Button>
        </div>

        {/* Trust indicators */}
        <p className="mt-10 text-sm text-muted-foreground">
          Trusted by <span className="font-medium text-foreground">10,000+</span> students from top universities
        </p>
      </div>
    </section>
  )
}
