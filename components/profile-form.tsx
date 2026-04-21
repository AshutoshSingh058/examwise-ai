"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ProfileForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    college: "",
    university: "",
    course: "",
    semester: "",
    examDate: ""
  })

  useEffect(() => {
    const saved = localStorage.getItem("examwise_profile")
    if (saved) {
      try {
        setFormData(JSON.parse(saved))
      } catch (e) {
        console.error("Could not parse saved profile form")
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem("examwise_profile", JSON.stringify(formData))
    router.push("/chat")
  }

  return (
    <Card className="w-full max-w-2xl border-border/50 bg-card/50 shadow-sm mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Exam Setup</CardTitle>
        <CardDescription>Configure your specific curriculum details right now so the AI Tutor can adapt perfectly to your upcoming exams.</CardDescription>
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

          <div className="space-y-2">
            <Label htmlFor="course">Course / Branch <span className="text-red-500">*</span></Label>
            <Input id="course" name="course" required value={formData.course} onChange={handleChange} placeholder="e.g. B.Tech Computer Science" className="bg-background/50" />
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
          <Button type="submit" size="lg" className="rounded-full px-8">Continue to ExamWise</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
