"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Save,
  Calendar,
  Tag,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createTask, type CreateTaskRequest } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

export default function AddTaskPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "Medium" as "Low" | "Medium" | "High",
    deadline: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.deadline
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to create tasks");
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert deadline to ISO format with timezone
      const deadlineDate = new Date(formData.deadline + "T18:00:00");
      const deadlineISO = deadlineDate.toISOString();

      const taskData: CreateTaskRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority_label: formData.priority,
        deadline: deadlineISO,
        status: "Pending",
      };

      // Only include category if it's provided and not the "none" value
      if (
        formData.category &&
        formData.category.trim() &&
        formData.category !== "none"
      ) {
        taskData.category = formData.category;
      }

      await createTask(taskData);

      toast.success("Task created successfully!");
      router.push("/tasks");
    } catch (error) {
      console.error("Error creating task:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create task. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAIDescriptionEnhance = async () => {
    if (!formData.title) {
      toast.error("Please enter a title before enhancing the description.");
      return;
    }

    setIsEnhancing(true);
    try {
      const response = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to enhance description.");
      }

      const data = await response.json();

      if (data.enhanced_description) {
        setFormData((prev) => ({
          ...prev,
          description: data.enhanced_description,
        }));
        toast.success("Description enhanced by AI!");
      } else {
        throw new Error("Invalid response from AI.");
      }
    } catch (error) {
      console.error("AI Enhancement Error:", error);
      if (error instanceof Error) {
        toast.error(`AI Enhancement Failed: ${error.message}`);
      } else {
        toast.error("An unknown error occurred during AI enhancement.");
      }
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAISuggestion = async () => {
    if (!formData.title || !formData.description) {
      toast.error(
        "Please enter a title and description before getting AI suggestions."
      );
      return;
    }

    setIsSuggesting(true);
    try {
      const response = await fetch("/api/suggest-task-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get AI suggestions.");
      }

      const data = await response.json();

      setFormData((prev) => ({
        ...prev,
        category: data.category || prev.category,
        priority: data.priority || prev.priority,
        deadline: data.deadline || prev.deadline,
      }));
      toast.success("AI suggestions applied!");
    } catch (error) {
      console.error("AI Suggestion Error:", error);
      if (error instanceof Error) {
        toast.error(`AI Suggestion Failed: ${error.message}`);
      } else {
        toast.error("An unknown error occurred during AI suggestion.");
      }
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Create New Task
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Add a new task to your todo list
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="h-5 w-5 text-blue-500" />
                <span>Task Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Enter a clear, descriptive task title..."
                    required
                    disabled={isSubmitting}
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description">Description *</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAIDescriptionEnhance}
                        disabled={
                          !formData.title ||
                          isSubmitting ||
                          isEnhancing ||
                          isSuggesting
                        }
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-transparent"
                      >
                        {isEnhancing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                            Enhancing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            AI Enhance
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAISuggestion}
                        disabled={
                          !formData.title ||
                          !formData.description ||
                          isSubmitting ||
                          isSuggesting ||
                          isEnhancing
                        }
                        className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 bg-transparent"
                      >
                        {isSuggesting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2" />
                            Suggesting...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            AI Suggest
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe what needs to be done, or use AI Enhance after entering a title."
                    rows={4}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Category (Optional)</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, category: value }))
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Category</SelectItem>
                        <SelectItem value="Work">Work</SelectItem>
                        <SelectItem value="Personal">Personal</SelectItem>
                        <SelectItem value="Development">Development</SelectItem>
                        <SelectItem value="Management">Management</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Learning">Learning</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Home">Home</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline *</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          deadline: e.target.value,
                        }))
                      }
                      required
                      disabled={isSubmitting}
                      min={new Date().toISOString().split("T")[0]} // Prevent past dates
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Priority *</Label>
                  <RadioGroup
                    value={formData.priority}
                    onValueChange={(value: "Low" | "Medium" | "High") =>
                      setFormData((prev) => ({ ...prev, priority: value }))
                    }
                    className="flex space-x-6"
                    disabled={isSubmitting}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Low" id="low" />
                      <Label
                        htmlFor="low"
                        className="text-green-600 font-medium"
                      >
                        Low
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Medium" id="medium" />
                      <Label
                        htmlFor="medium"
                        className="text-yellow-600 font-medium"
                      >
                        Medium
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="High" id="high" />
                      <Label
                        htmlFor="high"
                        className="text-red-600 font-medium"
                      >
                        High
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !formData.title.trim() ||
                      !formData.description.trim() ||
                      !formData.deadline
                    }
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Task
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-500" />
                <span>Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                  Writing Good Tasks:
                </h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Be specific and actionable</li>
                  <li>Include measurable outcomes</li>
                  <li>Set realistic deadlines</li>
                  <li>Break large tasks into smaller ones</li>
                </ul>
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-400">
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                  Using AI Features:
                </h4>
                <p>
                  Use <strong>AI Enhance</strong> to improve your description.
                  Use <strong>AI Suggest</strong> to get smart suggestions for
                  the category, priority, and deadline.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-500" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    deadline: new Date().toISOString().split("T")[0],
                  }))
                }
                disabled={isSubmitting}
              >
                Set deadline to today
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0],
                  }))
                }
                disabled={isSubmitting}
              >
                Set deadline to next week
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, priority: "High" }))
                }
                disabled={isSubmitting}
              >
                Mark as high priority
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
