import { Navbar } from "@/components/navbar"
import { ProfileForm } from "@/components/profile-form"

export default function SetupPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex max-w-5xl mx-auto items-center justify-center p-4 pt-24 md:p-8 md:pt-28 w-full">
        <ProfileForm />
      </main>
    </div>
  )
}
