"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function TaskDashboard() {
  const { user, loading } = useAuth();

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

  // Show authenticated dashboard
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
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
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+4 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">-1 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Same as last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Complete project proposal</p>
                <p className="text-xs text-muted-foreground">Due today</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Clock className="h-4 w-4 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Review design mockups</p>
                <p className="text-xs text-muted-foreground">Due tomorrow</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Team meeting preparation</p>
                <p className="text-xs text-muted-foreground">Due in 2 days</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
