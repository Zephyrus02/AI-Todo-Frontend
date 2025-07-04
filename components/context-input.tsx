"use client"

import type React from "react"

import { useState } from "react"
import { Send, MessageSquare, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ContextEntry {
  id: string
  content: string
  timestamp: string
  type: "whatsapp" | "email" | "note"
}

const mockContextHistory: ContextEntry[] = [
  {
    id: "1",
    content: "Meeting with client tomorrow at 2 PM. Need to prepare presentation slides and review contract details.",
    timestamp: "2024-01-10T10:30:00Z",
    type: "whatsapp",
  },
  {
    id: "2",
    content:
      "Email from manager: Please complete the quarterly report by Friday. Include metrics from Q4 and projections for Q1.",
    timestamp: "2024-01-09T14:15:00Z",
    type: "email",
  },
  {
    id: "3",
    content: "Personal note: Remember to book dentist appointment and pick up dry cleaning this week.",
    timestamp: "2024-01-08T09:00:00Z",
    type: "note",
  },
]

export default function ContextInput() {
  const [contextText, setContextText] = useState("")
  const [contextHistory, setContextHistory] = useState(mockContextHistory)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contextText.trim()) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newEntry: ContextEntry = {
      id: Date.now().toString(),
      content: contextText,
      timestamp: new Date().toISOString(),
      type: "note",
    }

    setContextHistory([newEntry, ...contextHistory])
    setContextText("")
    setIsSubmitting(false)
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "whatsapp":
        return "💬"
      case "email":
        return "📧"
      case "note":
        return "📝"
      default:
        return "📄"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Context Input</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Add daily context from WhatsApp messages, emails, or personal notes to help AI understand your tasks better
        </p>
      </div>

      {/* Context Input Form */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <span>Add New Context</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={contextText}
              onChange={(e) => setContextText(e.target.value)}
              placeholder="Paste your WhatsApp messages, emails, or type your notes here..."
              rows={6}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!contextText.trim() || isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Context
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Context History */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Context History</h2>
        <div className="space-y-4">
          {contextHistory.map((entry) => (
            <Card
              key={entry.id}
              className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getTypeIcon(entry.type)}</span>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 capitalize">
                      {entry.type}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatTimestamp(entry.timestamp)}
                  </div>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{entry.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {contextHistory.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <div className="text-slate-400 text-lg">No context entries yet</div>
            <p className="text-slate-500 mt-2">Add your first context entry above to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
