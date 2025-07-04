"use client";

import type React from "react";

import { useState } from "react";
import { X, Sparkles } from "lucide-react";
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
import { createTask, type CreateTaskRequest } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: {
    title: string;
    description: string;
    category: string;
    priority: "Low" | "Medium" | "High";
    deadline: string;
  }) => void;
}

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
}: TaskModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "Medium" as "Low" | "Medium" | "High",
    deadline: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      console.log("Submitting task data:", taskData);

      const response = await createTask(taskData);

      console.log("Task created successfully:", response);

      // Call the original onSubmit for local state updates
      onSubmit(formData);

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        priority: "Medium",
        deadline: "",
      });

      toast.success("Task created successfully!");
      onClose();
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

  const handleAISuggestion = () => {
    // Mock AI suggestion functionality
    setFormData((prev) => ({
      ...prev,
      description:
        prev.description +
        " (AI enhanced: Consider breaking this into smaller subtasks for better productivity)",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 7 days from now
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Add New Task
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter task title..."
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAISuggestion}
                className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 bg-transparent"
                disabled={isSubmitting}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Enhance
              </Button>
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
              placeholder="Describe your task..."
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
                  setFormData((prev) => ({ ...prev, deadline: e.target.value }))
                }
                required
                disabled={isSubmitting}
                min={new Date().toISOString().split("T")[0]} // Prevent past dates
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Priority</Label>
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
                <Label htmlFor="low" className="text-green-600">
                  Low
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Medium" id="medium" />
                <Label htmlFor="medium" className="text-yellow-600">
                  Medium
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="High" id="high" />
                <Label htmlFor="high" className="text-red-600">
                  High
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
