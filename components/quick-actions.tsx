import { Card, CardContent } from "@/components/ui/card"
import { Clock, Target, Brain, MessageSquare } from "lucide-react"

const actions = [
  {
    icon: Clock,
    title: "Exam Tomorrow",
    description: "Get emergency prep plan in seconds",
    gradient: "from-orange-500/10 to-red-500/10",
    iconColor: "text-orange-500",
  },
  {
    icon: Target,
    title: "Need Pass Marks",
    description: "Focus only on highest ROI topics",
    gradient: "from-green-500/10 to-emerald-500/10",
    iconColor: "text-green-500",
  },
  {
    icon: Brain,
    title: "Predict Questions",
    description: "Analyze likely repeated exam questions",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: MessageSquare,
    title: "Viva Prep",
    description: "Practice oral questions instantly",
    gradient: "from-pink-500/10 to-rose-500/10",
    iconColor: "text-pink-500",
  },
]

export function QuickActions() {
  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Quick Actions
          </h2>
          <p className="mt-3 text-muted-foreground">
            Jump right into what you need most
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => (
            <Card 
              key={action.title}
              className="group cursor-pointer border-border/50 bg-card/50 transition-all hover:border-border hover:shadow-lg"
            >
              <CardContent className="p-6">
                <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${action.gradient} p-3`}>
                  <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                </div>
                <h3 className="font-semibold">{action.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
