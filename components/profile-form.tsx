"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ProfileForm({ mode = "setup" }: { mode?: "setup" | "profile" }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    college: "",
    university: "",
    course: "",
    subject: "",
    semester: "",
    examDate: ""
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const userId = localStorage.getItem("examwise_user_id")
    if (!userId) {
      router.push("/signup")
      return
    }

    const saved = localStorage.getItem("examwise_profile")
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with defaults to prevent "controlled to uncontrolled" error if fields are missing
        setFormData(prev => ({
          ...prev,
          ...parsed
        }))
      } catch (e) {
        console.error("Could not parse saved profile form")
      }
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const userId = localStorage.getItem("examwise_user_id")
    
    try {
      const res = await fetch("/api/auth/profile-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...formData })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile")
      }


      localStorage.setItem("examwise_profile", JSON.stringify(formData))
      if (mode === "setup") {
        router.push("/chat")
      } else {
        alert("Profile updated successfully!")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl border-border/50 bg-card/50 shadow-sm mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{mode === "setup" ? "Exam Setup" : "Your Profile"}</CardTitle>
        <CardDescription>
          {mode === "setup" 
            ? "Configure your specific curriculum details right now so the AI Tutor can adapt perfectly to your upcoming exams."
            : "Update your study focus and academic details."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
            <Input id="name" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. John Doe" className="bg-background/50" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="college">College <span className="text-red-500">*</span></Label>
              <Input id="college" name="college" required value={formData.college} onChange={handleChange} placeholder="e.g. Modern Engineering College" className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="university">University <span className="text-red-500">*</span></Label>
              <Input id="university" name="university" required value={formData.university} onChange={handleChange} placeholder="e.g. State Tech University" className="bg-background/50" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">Course / Branch <span className="text-red-500">*</span></Label>
              <Input id="course" name="course" required value={formData.course} onChange={handleChange} placeholder="e.g. B.Tech CS" className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Current Focus Subject <span className="text-red-500">*</span></Label>
              <Input id="subject" name="subject" required value={formData.subject} onChange={handleChange} placeholder="e.g. DBMS" className="bg-background/50 border-primary/20" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="semester">Year / Semester <span className="text-red-500">*</span></Label>
              <Input id="semester" name="semester" required value={formData.semester} onChange={handleChange} placeholder="e.g. 6th Semester" className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="examDate">Upcoming Exam Date (Optional)</Label>
              <Input id="examDate" type="date" name="examDate" value={formData.examDate} onChange={handleChange} className="text-muted-foreground bg-background/50" />
            </div>
          </div>

        </CardContent>
        <CardFooter className="flex justify-end pt-4">
          <Button type="submit" size="lg" className="rounded-full px-8" disabled={isLoading}>
            {isLoading ? "Saving..." : mode === "setup" ? "Continue to ExamWise" : "Update Profile"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
