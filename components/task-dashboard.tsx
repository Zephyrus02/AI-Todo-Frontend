"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  Tag,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  fetchTasks,
  fetchContextEntries,
  deleteTask,
  updateTaskStatus,
  type Task,
  type ContextEntry,
} from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const priorityColors = {
  Low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  High: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusColors = {
  Pending: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  "In Progress":
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Completed:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
};

function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  task: Task;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (
    taskId: string,
    status: "Pending" | "In Progress" | "Completed"
  ) => void;
}) {
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
    <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-medium text-slate-900 dark:text-white line-clamp-2">
              {task.title}
            </CardTitle>
            <div className="flex items-center space-x-2 mt-2">
              <Badge
                className={cn("text-xs", priorityColors[task.priority_label])}
              >
                {task.priority_label}
              </Badge>
              <Badge className={cn("text-xs", statusColors[task.status])}>
                {task.status}
              </Badge>
              {task.category_name && (
                <Badge variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {task.category_name}
                </Badge>
              )}
            </div>
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
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-3">
          {task.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="h-3 w-3 mr-1" />
            <span className={cn(isOverdue && "text-red-600 font-medium")}>
              {formatDate(task.deadline)}
            </span>
            {isOverdue && <span className="ml-1 text-red-600">(Overdue)</span>}
          </div>
          <div className="flex space-x-1">
            {task.status !== "Completed" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  onStatusChange(
                    task.id,
                    task.status === "Pending" ? "In Progress" : "Completed"
                  )
                }
                className="text-xs h-6 px-2"
              >
                {task.status === "Pending" ? "Start" : "Complete"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ContextCard({ entry }: { entry: ContextEntry }) {
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
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <FileText className="h-5 w-5 text-blue-500" />
              <span>{entry.source_type}</span>
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              <Clock className="h-3 w-3 mr-1 inline" />
              {formatTimestamp(entry.created_at)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed line-clamp-3">
          {entry.content}
        </p>
        {entry.insights && (
          <div className="mt-3 flex items-center text-xs text-slate-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Has AI insights
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TaskDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contexts, setContexts] = useState<ContextEntry[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingContexts, setLoadingContexts] = useState(true);

  useEffect(() => {
    if (user) {
      loadTasks();
      loadContexts();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      setLoadingTasks(true);
      const response = await fetchTasks();
      setTasks(response.results.slice(0, 6)); // Show only 6 recent tasks
    } catch (error) {
      console.error("Failed to load tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoadingTasks(false);
    }
  };

  const loadContexts = async () => {
    try {
      setLoadingContexts(true);
      const response = await fetchContextEntries();
      setContexts(response.results.slice(0, 4)); // Show only 4 recent contexts
    } catch (error) {
      console.error("Failed to load contexts:", error);
      toast.error("Failed to load contexts");
    } finally {
      setLoadingContexts(false);
    }
  };

  const handleEditTask = (taskId: string) => {
    router.push(`/add-task/${taskId}`);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleStatusChange = async (
    taskId: string,
    status: "Pending" | "In Progress" | "Completed"
  ) => {
    try {
      await updateTaskStatus(taskId, status);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status } : t))
      );
      toast.success(`Task marked as ${status.toLowerCase()}`);
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast.error("Failed to update task status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show public homepage for non-authenticated users
  if (!user) {
    return (
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Smart Todo Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Organize your tasks intelligently with our modern task management
            system. Create, prioritize, and track your todos with ease.
          </p>
          <div className="space-x-4">
            <Link href="/login">
              <Button size="lg">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" size="lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Task Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Create, edit, and organize your tasks with intuitive controls
                and smart categorization.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Smart Scheduling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Set due dates, priorities, and get intelligent reminders to stay
                on track.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Progress Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Monitor your productivity with detailed analytics and progress
                reports.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Ready to get organized?
          </h2>
          <p className="text-gray-600 mb-6">
            Sign up now to start managing your tasks efficiently.
          </p>
          <Link href="/signup">
            <Button size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "In Progress"
  ).length;
  const overdueTasks = tasks.filter(
    (t) => new Date(t.deadline) < new Date() && t.status !== "Completed"
  ).length;

  // Show authenticated dashboard
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Welcome back! Here's what's happening with your tasks.
          </p>
        </div>
        <Link href="/add-task">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">Active tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {totalTasks > 0
                ? Math.round((completedTasks / totalTasks) * 100)
                : 0}
              % completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">
              Currently working on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueTasks}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Tasks</CardTitle>
          <Link href="/tasks">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loadingTasks ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : tasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <div className="text-slate-400 text-lg">No tasks yet</div>
              <p className="text-slate-500 mt-2">
                <Link
                  href="/add-task"
                  className="text-blue-600 hover:underline"
                >
                  Create your first task
                </Link>{" "}
                to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Contexts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Context Entries</CardTitle>
          <Link href="/context">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loadingContexts ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : contexts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contexts.map((context) => (
                <ContextCard key={context.id} entry={context} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <div className="text-slate-400 text-lg">
                No context entries yet
              </div>
              <p className="text-slate-500 mt-2">
                <Link href="/context" className="text-blue-600 hover:underline">
                  Add context from your messages
                </Link>{" "}
                to help AI understand your tasks better
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
