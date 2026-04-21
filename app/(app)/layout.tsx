import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 relative h-screen overflow-y-auto w-full bg-background">
        <div className="sticky top-0 z-50 flex items-center p-4 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
          <SidebarTrigger />
          <span className="ml-4 font-bold text-lg text-primary">ExamWise AI</span>
        </div>
        {children}
      </main>
    </SidebarProvider>
  )
}
