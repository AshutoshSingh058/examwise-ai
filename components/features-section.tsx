import { Card, CardContent } from "@/components/ui/card"
import { 
  FileSearch, 
  CalendarDays, 
  FileText, 
  Mic2, 
  Zap, 
  Lightbulb 
} from "lucide-react"

const features = [
  {
    icon: FileSearch,
    title: "Past Paper Analysis",
    description: "AI analyzes years of past papers to identify patterns, repeated topics, and question trends.",
  },
  {
    icon: CalendarDays,
    title: "AI Study Plans",
    description: "Get personalized study schedules based on your available time and exam priority.",
  },
  {
    icon: FileText,
    title: "Concise Answers",
    description: "Get exam-ready answers that are clear, structured, and optimized for marks.",
  },
  {
    icon: Mic2,
    title: "Voice Doubts",
    description: "Ask questions using your voice and get instant explanations in simple language.",
  },
  {
    icon: Zap,
    title: "Fast Revision Sheets",
    description: "Auto-generated revision notes with key points, formulas, and definitions.",
  },
  {
    icon: Lightbulb,
    title: "Smart Exam Strategy",
    description: "Learn which questions to attempt first and how to maximize your score.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="border-t border-border/50 bg-secondary/20 px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Everything You Need to Ace Your Exams
          </h2>
          <p className="mt-3 text-muted-foreground">
            Powerful AI features designed specifically for exam preparation
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card 
              key={feature.title}
              className="border-border/50 bg-card/80 backdrop-blur-sm transition-all hover:border-border hover:shadow-lg"
            >
              <CardContent className="p-6">
                <div className="mb-4 inline-flex rounded-xl bg-accent/10 p-3">
                  <feature.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
