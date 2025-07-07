"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Users,
  Target,
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
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-2 mb-2">
              {task.title}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge
                className={cn(
                  "text-xs font-medium",
                  priorityColors[task.priority_label]
                )}
              >
                {task.priority_label}
              </Badge>
              <Badge
                className={cn("text-xs font-medium", statusColors[task.status])}
              >
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
        <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-4">
          {task.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="h-3 w-3 mr-1" />
            <span className={cn(isOverdue && "text-red-600 font-medium")}>
              {formatDate(task.deadline)}
            </span>
            {isOverdue && (
              <span className="ml-1 text-red-600 font-medium">(Overdue)</span>
            )}
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
                className="text-xs h-7 px-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-200/50"
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
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 group hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <FileText className="h-5 w-5 text-purple-500" />
              <span className="font-semibold">{entry.source_type}</span>
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
          <div className="mt-3 flex items-center text-xs text-emerald-600 dark:text-emerald-400">
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

  // Filter states for tasks
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Filter states for contexts
  const [contextSearchTerm, setContextSearchTerm] = useState("");
  const [sourceTypeFilter, setSourceTypeFilter] = useState("all");

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
      setTasks(response.results);
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
      setContexts(response.results);
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

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;

    const matchesPriority =
      priorityFilter === "all" || task.priority_label === priorityFilter;

    const matchesCategory =
      categoryFilter === "all" ||
      (categoryFilter === "none" && !task.category_name) ||
      task.category_name === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Filter contexts
  const filteredContexts = contexts.filter((context) => {
    const matchesSearch =
      context.content.toLowerCase().includes(contextSearchTerm.toLowerCase()) ||
      context.source_type
        .toLowerCase()
        .includes(contextSearchTerm.toLowerCase());

    const matchesSourceType =
      sourceTypeFilter === "all" || context.source_type === sourceTypeFilter;

    return matchesSearch && matchesSourceType;
  });

  // Get unique categories and source types for filters
  const uniqueCategories = Array.from(
    new Set(
      tasks
        .map((t) => t.category_name)
        .filter((category): category is string => Boolean(category))
    )
  );
  const uniqueSourceTypes = Array.from(
    new Set(contexts.map((c) => c.source_type))
  );

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
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900">
          {/* Floating shapes */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>

          {/* Grid pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
        </div>

        <div className="relative z-10 space-y-12 py-12">
          {/* Hero Section */}
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Smart Todo Dashboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Organize your tasks intelligently with our modern task management
              system. Create, prioritize, and track your todos with ease.
            </p>
            <div className="space-x-4">
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium px-8 py-3"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 bg-white/50 backdrop-blur-sm border-white/20"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  Task Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Create, edit, and organize your tasks with intuitive controls
                  and smart categorization.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  Smart Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Set due dates, priorities, and get intelligent reminders to
                  stay on track.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                  </div>
                  Progress Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Monitor your productivity with detailed analytics and progress
                  reports.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="max-w-4xl mx-auto px-6">
            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border-white/20 text-center p-12">
              <CardContent className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Ready to get organized?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Sign up now to start managing your tasks efficiently.
                </p>
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium px-8 py-3"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Account
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        <style jsx>{`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          .bg-grid-pattern {
            background-image: radial-gradient(
              circle at 1px 1px,
              rgba(0, 0, 0, 0.1) 1px,
              transparent 0
            );
            background-size: 20px 20px;
          }
        `}</style>
      </div>
    );
  }

  // Calculate stats from all tasks
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900">
        {/* Floating shapes */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400/5 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-400/5 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-400/5 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-3"></div>
      </div>

      <div className="relative z-10 space-y-8 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Performance Tracking
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg mt-2">
              Welcome back! Here's what's happening with your tasks.
            </p>
          </div>
          <Link href="/add-task">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="h-5 w-5 mr-2" />
              Add Task
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Tasks
              </CardTitle>
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Target className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {totalTasks}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Active tasks
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Completed
              </CardTitle>
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {completedTasks}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {totalTasks > 0
                  ? Math.round((completedTasks / totalTasks) * 100)
                  : 0}
                % completion rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                In Progress
              </CardTitle>
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {inProgressTasks}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Currently working on
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Overdue
              </CardTitle>
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {overdueTasks}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Task Priority Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold">
                High Priority
              </CardTitle>
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                {
                  tasks.filter(
                    (t) =>
                      t.priority_label === "High" && t.status !== "Completed"
                  ).length
                }{" "}
                tasks
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks
                  .filter(
                    (t) =>
                      t.priority_label === "High" && t.status !== "Completed"
                  )
                  .slice(0, 3)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center space-x-3 p-3 bg-red-50/50 dark:bg-red-900/10 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-900 dark:text-white">
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDate(task.deadline)}
                        </p>
                      </div>
                      <Badge
                        className={cn("text-xs", statusColors[task.status])}
                      >
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                {tasks.filter(
                  (t) => t.priority_label === "High" && t.status !== "Completed"
                ).length === 0 && (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                    No high priority tasks
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold">
                Medium Priority
              </CardTitle>
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                {
                  tasks.filter(
                    (t) =>
                      t.priority_label === "Medium" && t.status !== "Completed"
                  ).length
                }{" "}
                tasks
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks
                  .filter(
                    (t) =>
                      t.priority_label === "Medium" && t.status !== "Completed"
                  )
                  .slice(0, 3)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center space-x-3 p-3 bg-yellow-50/50 dark:bg-yellow-900/10 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-900 dark:text-white">
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDate(task.deadline)}
                        </p>
                      </div>
                      <Badge
                        className={cn("text-xs", statusColors[task.status])}
                      >
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                {tasks.filter(
                  (t) =>
                    t.priority_label === "Medium" && t.status !== "Completed"
                ).length === 0 && (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                    No medium priority tasks
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Tasks Section */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold">All Tasks</CardTitle>
            <Link href="/tasks">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/50 backdrop-blur-sm border-white/20"
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced View
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {/* Task Filters */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/50 backdrop-blur-sm border-white/20"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-white/50 backdrop-blur-sm border-white/20">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="w-full sm:w-[180px] bg-white/50 backdrop-blur-sm border-white/20">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full sm:w-[180px] bg-white/50 backdrop-blur-sm border-white/20">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="none">No Category</SelectItem>
                    {uniqueCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loadingTasks ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.map((task) => (
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
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <div className="text-slate-400 text-xl font-medium">
                  {searchTerm ||
                  statusFilter !== "all" ||
                  priorityFilter !== "all" ||
                  categoryFilter !== "all"
                    ? "No tasks match your filters"
                    : "No tasks yet"}
                </div>
                <p className="text-slate-500 mt-2">
                  {searchTerm ||
                  statusFilter !== "all" ||
                  priorityFilter !== "all" ||
                  categoryFilter !== "all" ? (
                    "Try adjusting your search criteria"
                  ) : (
                    <>
                      <Link
                        href="/add-task"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Create your first task
                      </Link>{" "}
                      to get started
                    </>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Context Entries Section */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              Recent Context Entries
            </CardTitle>
            <Link href="/context">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/50 backdrop-blur-sm border-white/20"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Context
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loadingContexts ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : contexts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contexts.slice(0, 4).map((context) => (
                  <ContextCard key={context.id} entry={context} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <div className="text-slate-400 text-xl font-medium">
                  No context entries yet
                </div>
                <p className="text-slate-500 mt-2">
                  <Link
                    href="/context"
                    className="text-purple-600 hover:underline font-medium"
                  >
                    Add context from your messages
                  </Link>{" "}
                  to help AI understand your tasks better
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .bg-grid-pattern {
          background-image: radial-gradient(
            circle at 1px 1px,
            rgba(0, 0, 0, 0.1) 1px,
            transparent 0
          );
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
}
