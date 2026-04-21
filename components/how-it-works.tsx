import { MessageSquare, Cpu, BookOpen, Trophy } from "lucide-react"

const steps = [
  {
    icon: MessageSquare,
    step: "01",
    title: "Tell Us About Your Exam",
    description: "Enter your subject, time available, and target score. Our AI understands your needs.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Analyzes & Plans",
    description: "Our AI processes past papers, syllabus, and patterns to create your perfect strategy.",
  },
  {
    icon: BookOpen,
    step: "03",
    title: "Study Smart",
    description: "Follow your personalized plan with priority topics, likely questions, and quick notes.",
  },
  {
    icon: Trophy,
    step: "04",
    title: "Ace Your Exam",
    description: "Walk into your exam confident and prepared to score better than ever before.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            How It Works
          </h2>
          <p className="mt-3 text-muted-foreground">
            From panic to prepared in four simple steps
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.step} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-12 hidden h-px w-full bg-border/50 lg:block" />
              )}
              
              <div className="relative flex flex-col items-center text-center">
                {/* Step number and icon */}
                <div className="relative mb-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-border/50 bg-card">
                    <step.icon className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {step.step}
                  </span>
                </div>
                
                <h3 className="mb-2 font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
