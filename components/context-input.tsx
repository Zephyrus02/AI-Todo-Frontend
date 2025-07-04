"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Send,
  MessageSquare,
  Clock,
  Sparkles,
  FileText,
  Lightbulb,
  Tag,
  ListTodo,
  ChevronDown,
  ChevronUp,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  createContextEntry,
  fetchContextEntries,
  processContextsForTaskCreation,
  type ContextEntry,
  type CreateContextRequest,
} from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const priorityColors = {
  Low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  High: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

function ContextCard({ entry }: { entry: ContextEntry }) {
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <FileText className="h-5 w-5 text-blue-500" />
              <span>{entry.source_type}</span>
            </CardTitle>
            <CardDescription className="flex items-center text-xs text-slate-500 dark:text-slate-400 pt-1">
              <Clock className="h-3 w-3 mr-1" />
              {formatTimestamp(entry.created_at)}
            </CardDescription>
          </div>
          {entry.insights && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsInsightsOpen(!isInsightsOpen)}
            >
              {isInsightsOpen ? "Hide" : "Show"} Insights
              {isInsightsOpen ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
          {entry.content}
        </p>
        {isInsightsOpen && entry.insights && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
            <div>
              <h4 className="flex items-center text-sm font-semibold mb-2">
                <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                Summary
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                {entry.insights.summary}
              </p>
            </div>
            <div>
              <h4 className="flex items-center text-sm font-semibold mb-2">
                <Tag className="h-4 w-4 mr-2 text-green-500" />
                Key Entities
              </h4>
              <div className="flex flex-wrap gap-2">
                {entry.insights.key_entities.map((entity) => (
                  <Badge key={entity} variant="secondary">
                    {entity}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="flex items-center text-sm font-semibold mb-2">
                <ListTodo className="h-4 w-4 mr-2 text-purple-500" />
                Suggested Tasks
              </h4>
              <ul className="space-y-2">
                {entry.insights.suggested_tasks.map((task, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between text-sm p-2 bg-slate-50 dark:bg-slate-900/50 rounded-md"
                  >
                    <span>{task.title}</span>
                    <Badge
                      className={cn(
                        "text-xs font-medium",
                        priorityColors[task.priority]
                      )}
                    >
                      {task.priority}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ContextInput() {
  const { user } = useAuth();
  const [contextText, setContextText] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [contexts, setContexts] = useState<ContextEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isProcessingTasks, setIsProcessingTasks] = useState(false);

  // State for manual insights
  const [showInsightsForm, setShowInsightsForm] = useState(false);
  const [summary, setSummary] = useState("");
  const [keyEntities, setKeyEntities] = useState(""); // Comma-separated
  const [suggestedTaskTitle, setSuggestedTaskTitle] = useState("");
  const [suggestedTaskPriority, setSuggestedTaskPriority] = useState<
    "Low" | "Medium" | "High"
  >("Medium");
  const [suggestedTaskDeadline, setSuggestedTaskDeadline] = useState("");

  useEffect(() => {
    const loadContexts = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const response = await fetchContextEntries();
        setContexts(response.results);
      } catch (error) {
        console.error("Failed to load context entries:", error);
        toast.error("Failed to load context history.");
      } finally {
        setLoading(false);
      }
    };
    loadContexts();
  }, [user]);

  const handleAIContextEnhance = async () => {
    if (!contextText.trim()) {
      toast.error("Please enter some content before enhancing.");
      return;
    }
    setIsEnhancing(true);
    try {
      const response = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sourceText || "General Context",
          description: contextText,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get AI enhancement.");
      }
      const data = await response.json();
      if (data.enhanced_description) {
        setContextText(data.enhanced_description);
        toast.success("Context enhanced by AI!");
      } else {
        throw new Error("Invalid response format from AI.");
      }
    } catch (error) {
      console.error("AI Enhancement Error:", error);
      toast.error(
        error instanceof Error
          ? `AI Enhancement Failed: ${error.message}`
          : "An unknown error occurred during AI enhancement."
      );
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleProcessContexts = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      toast.error("User not found. Please log in again.");
      return;
    }

    setIsProcessingTasks(true);
    try {
      await processContextsForTaskCreation(userId);
      toast.success(
        "AI is processing your contexts to create tasks. They will appear on the tasks page shortly."
      );
    } catch (error) {
      console.error("Failed to process contexts for task creation:", error);
      toast.error("Failed to start AI task creation. Please try again.");
    } finally {
      setIsProcessingTasks(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contextText.trim()) {
      toast.error("Content cannot be empty.");
      return;
    }
    setIsSubmitting(true);
    try {
      const contextData: CreateContextRequest = {
        content: contextText,
        source_type: sourceText.trim() || "Note",
      };

      if (showInsightsForm) {
        const suggestedTask: {
          title: string;
          priority: "Low" | "Medium" | "High";
          deadline?: string;
        } = {
          title: suggestedTaskTitle.trim(),
          priority: suggestedTaskPriority,
        };

        if (suggestedTaskDeadline) {
          const deadlineDate = new Date(suggestedTaskDeadline + "T18:00:00");
          suggestedTask.deadline = deadlineDate.toISOString();
        }

        contextData.insights = {
          summary: summary.trim() || undefined,
          key_entities: keyEntities
            ? keyEntities
                .split(",")
                .map((e) => e.trim())
                .filter(Boolean)
            : undefined,
          suggested_tasks: suggestedTask.title ? [suggestedTask] : undefined,
        };
      }

      const newEntry = await createContextEntry(contextData);
      setContexts([newEntry, ...contexts]);
      // Reset form
      setContextText("");
      setSourceText("");
      setSummary("");
      setKeyEntities("");
      setSuggestedTaskTitle("");
      setSuggestedTaskPriority("Medium");
      setSuggestedTaskDeadline("");
      setShowInsightsForm(false);

      toast.success("Context submitted successfully!");
    } catch (error) {
      console.error("Failed to submit context:", error);
      toast.error("Failed to submit context. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Context Input
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Add daily context from WhatsApp messages, emails, or personal notes to
          help AI understand your tasks better
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
            <div className="space-y-2">
              <Label htmlFor="source">Source Type</Label>
              <Input
                id="source"
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="e.g., Email, WhatsApp, Note (defaults to 'Note')"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="context-content">Content *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAIContextEnhance}
                  disabled={!contextText.trim() || isSubmitting || isEnhancing}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 bg-transparent"
                >
                  {isEnhancing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Enhance
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="context-content"
                value={contextText}
                onChange={(e) => setContextText(e.target.value)}
                placeholder="Paste your WhatsApp messages, emails, or type your notes here..."
                rows={6}
                className="resize-none"
                required
              />
            </div>

            {/* Manual Insights Section */}
            <div className="space-y-4 pt-2">
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto"
                onClick={() => setShowInsightsForm(!showInsightsForm)}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                {showInsightsForm ? "Hide" : "Add Manual Insights"}
              </Button>

              {showInsightsForm && (
                <div className="space-y-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                  <div className="space-y-2">
                    <Label htmlFor="summary">Summary</Label>
                    <Textarea
                      id="summary"
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="A brief summary of the context..."
                      rows={2}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="key-entities">Key Entities</Label>
                    <Input
                      id="key-entities"
                      value={keyEntities}
                      onChange={(e) => setKeyEntities(e.target.value)}
                      placeholder="e.g., Project Alpha, Q3 Report, Globex Corp"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-slate-500">
                      Enter values separated by commas.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Label>Suggested Task</Label>
                    <Input
                      value={suggestedTaskTitle}
                      onChange={(e) => setSuggestedTaskTitle(e.target.value)}
                      placeholder="Title for a suggested task..."
                      disabled={isSubmitting}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <RadioGroup
                        value={suggestedTaskPriority}
                        onValueChange={(value: "Low" | "Medium" | "High") =>
                          setSuggestedTaskPriority(value)
                        }
                        className="flex space-x-4"
                        disabled={isSubmitting}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Low" id="low" />
                          <Label htmlFor="low">Low</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Medium" id="medium" />
                          <Label htmlFor="medium">Medium</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="High" id="high" />
                          <Label htmlFor="high">High</Label>
                        </div>
                      </RadioGroup>
                      <Input
                        type="date"
                        value={suggestedTaskDeadline}
                        onChange={(e) =>
                          setSuggestedTaskDeadline(e.target.value)
                        }
                        disabled={isSubmitting}
                        className="h-10"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={
                  !contextText.trim() || isSubmitting || isProcessingTasks
                }
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

      {/* All Contexts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            All Contexts
          </h2>
          <Button
            type="button"
            variant="outline"
            onClick={handleProcessContexts}
            disabled={
              isProcessingTasks || isSubmitting || contexts.length === 0
            }
          >
            {isProcessingTasks ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2" />
                AI is Working...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                AI Create Tasks
              </>
            )}
          </Button>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Loading contexts...
            </p>
          </div>
        ) : contexts.length > 0 ? (
          <div className="space-y-4">
            {contexts.map((entry) => (
              <ContextCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <div className="text-slate-400 text-lg">No context entries yet</div>
            <p className="text-slate-500 mt-2">
              Add your first context entry above to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
