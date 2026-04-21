import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, Sparkles, BookOpen } from "lucide-react"

export default function HotTopicsPage() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8 fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hot Topics</h1>
        <p className="mt-2 text-muted-foreground">See what other students in your curriculum are focusing on right now.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50 shadow-sm bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Currently Studying</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">428</div>
            <p className="text-xs text-muted-foreground">students active in your branch</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 shadow-sm bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Trending Focus</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Unit 3</div>
            <p className="text-xs text-muted-foreground">Normalization & ERD</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-yellow-500" /> Likely Important Topics</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex justify-between items-center p-3 rounded-lg border border-border/50 bg-background/50">
               <div>
                 <p className="font-medium">Boyce-Codd Normal Form (BCNF)</p>
                 <p className="text-xs text-muted-foreground">98% probability based on past trends</p>
               </div>
               <Badge>Very High</Badge>
             </div>
             <div className="flex justify-between items-center p-3 rounded-lg border border-border/50 bg-background/50">
               <div>
                 <p className="font-medium">ACID Properties</p>
                 <p className="text-xs text-muted-foreground">85% probability</p>
               </div>
               <Badge variant="secondary">High</Badge>
             </div>
             <div className="flex justify-between items-center p-3 rounded-lg border border-border/50 bg-background/50">
               <div>
                 <p className="font-medium">Two-Phase Locking (2PL)</p>
                 <p className="text-xs text-muted-foreground">72% probability</p>
               </div>
               <Badge variant="outline">Medium</Badge>
             </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Trending Questions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2 p-3 rounded-lg border border-border/50 bg-background/50 cursor-pointer hover:border-primary/50 transition-colors">
               <p className="font-medium text-sm">"What is the difference between 3NF and BCNF with examples?"</p>
               <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3 "/> Asked by 142 students today</p>
             </div>
             <div className="space-y-2 p-3 rounded-lg border border-border/50 bg-background/50 cursor-pointer hover:border-primary/50 transition-colors">
               <p className="font-medium text-sm">"Explain the Wait-Die and Wound-Wait protocols."</p>
               <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3 "/> Asked by 89 students today</p>
             </div>
             <div className="space-y-2 p-3 rounded-lg border border-border/50 bg-background/50 cursor-pointer hover:border-primary/50 transition-colors">
               <p className="font-medium text-sm">"How to construct a B+ tree of order 3?"</p>
               <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3 "/> Asked by 56 students today</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
