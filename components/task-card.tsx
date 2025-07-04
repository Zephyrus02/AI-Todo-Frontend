"use client";

import { Calendar, Edit, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Task } from "@/lib/api";

interface TaskCardProps {
  task: Task;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

const priorityColors = {
  Low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  High: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusColors = {
  Pending: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300",
  "In Progress":
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Completed:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
};

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isOverdue =
    new Date(task.deadline) < new Date() && task.status !== "Completed";

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {task.title}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
            {task.description}
          </p>
        </div>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(task.id)}
            className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(task.id)}
            className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge
          className={cn(
            "text-xs font-medium",
            priorityColors[task.priority_label]
          )}
        >
          {task.priority_label}
        </Badge>
        <Badge className={cn("text-xs font-medium", statusColors[task.status])}>
          {task.status}
        </Badge>
        <Badge variant="outline" className="text-xs">
          <Tag className="h-3 w-3 mr-1" />
          {task.category_name || "No Category"}
        </Badge>
      </div>

      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
        <Calendar className="h-4 w-4 mr-2" />
        <span className={cn(isOverdue && "text-red-500 font-medium")}>
          {formatDate(task.deadline)}
          {isOverdue && " (Overdue)"}
        </span>
      </div>
    </div>
  );
}
