"use client";

import { useState, useEffect } from "react";
import {
  User,
  Bell,
  Palette,
  Shield,
  Database,
  Download,
  Trash2,
  Moon,
  Sun,
  Info,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, updateProfile } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: "",
  });

  const [isUpdating, setIsUpdating] = useState(false);

  // Helper function to get avatar URL from user data
  const getAvatarUrl = (user: any) => {
    // Check both raw_user_meta_data and user_metadata for avatar_url
    return (
      user?.raw_user_meta_data?.avatar_url ||
      user?.user_metadata?.avatar_url ||
      ""
    );
  };

  // Helper function to get full name from user data
  const getFullName = (user: any) => {
    // Check both raw_user_meta_data and user_metadata for full_name
    return (
      user?.raw_user_meta_data?.full_name ||
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      ""
    );
  };

  // Initialize profile data when user is loaded
  useEffect(() => {
    if (user) {
      setProfile({
        name: getFullName(user),
        email: user.email || "",
        avatar: getAvatarUrl(user),
      });
    }
  }, [user]);

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    taskReminders: true,
    weeklyDigest: true,
    deadlineAlerts: true,
  });

  const [preferences, setPreferences] = useState({
    defaultView: "dashboard",
    tasksPerPage: "12",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    autoSave: true,
    compactMode: false,
  });

  const handleProfileUpdate = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsUpdating(true);
    try {
      const { error } = await updateProfile({
        full_name: profile.name,
        avatar_url: profile.avatar,
      });

      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile. Please try again.");
      } else {
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNotificationToggle = (setting: string) => {
    setNotifications((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }));
  };

  const handlePreferenceChange = (setting: string, value: string | boolean) => {
    setPreferences((prev) => ({ ...prev, [setting]: value }));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your account and application preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <div className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-500" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={
                        profile.avatar || "/placeholder.svg?height=80&width=80"
                      }
                      alt="Profile"
                    />
                    <AvatarFallback className="text-lg">
                      {profile.name ? getInitials(profile.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline">Change Avatar</Button>
                    <p className="text-sm text-slate-500">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) =>
                        handleProfileUpdate("name", e.target.value)
                      }
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-slate-50 dark:bg-slate-800"
                    />
                    <p className="text-xs text-slate-500">
                      Email cannot be changed here. Contact support if needed.
                    </p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="avatar">Avatar URL (Optional)</Label>
                    <Input
                      id="avatar"
                      value={profile.avatar}
                      onChange={(e) =>
                        handleProfileUpdate("avatar", e.target.value)
                      }
                      placeholder="https://example.com/your-avatar.jpg"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isUpdating}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* User Account Info */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-5 w-5 text-green-500" />
                  <span>Account Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Account Created:</span>
                    <p className="font-medium">
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "Not available"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Last Sign In:</span>
                    <p className="font-medium">
                      {user?.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleDateString()
                        : "Not available"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">User ID:</span>
                    <p className="font-mono text-xs break-all">{user?.id}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Email Verified:</span>
                    <Badge
                      variant={
                        user?.email_confirmed_at ? "default" : "secondary"
                      }
                    >
                      {user?.email_confirmed_at ? "Verified" : "Not Verified"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Raw User Metadata */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-purple-500" />
                  <span>Raw User Metadata</span>
                </CardTitle>
                <p className="text-sm text-slate-500">
                  All data stored in raw_user_meta_data field
                </p>
              </CardHeader>
              <CardContent>
                {(user as any)?.raw_user_meta_data ? (
                  <div className="space-y-4">
                    {Object.entries((user as any).raw_user_meta_data).map(
                      ([key, value]) => (
                        <div key={key} className="flex flex-col space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {key}:
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {typeof value}
                            </Badge>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3">
                            {key === "avatar_url" &&
                            typeof value === "string" ? (
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={value}
                                    alt="Avatar preview"
                                  />
                                  <AvatarFallback>IMG</AvatarFallback>
                                </Avatar>
                                <code className="text-xs break-all">
                                  {value}
                                </code>
                              </div>
                            ) : (
                              <code className="text-xs break-all">
                                {typeof value === "object"
                                  ? JSON.stringify(value, null, 2)
                                  : String(value)}
                              </code>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    No metadata available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Metadata (for comparison) */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-orange-500" />
                  <span>User Metadata</span>
                </CardTitle>
                <p className="text-sm text-slate-500">
                  All data stored in user_metadata field
                </p>
              </CardHeader>
              <CardContent>
                {user?.user_metadata &&
                Object.keys(user.user_metadata).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(user.user_metadata).map(([key, value]) => (
                      <div key={key} className="flex flex-col space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {key}:
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {typeof value}
                          </Badge>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3">
                          {key === "avatar_url" && typeof value === "string" ? (
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={value} alt="Avatar preview" />
                                <AvatarFallback>IMG</AvatarFallback>
                              </Avatar>
                              <code className="text-xs break-all">{value}</code>
                            </div>
                          ) : (
                            <code className="text-xs break-all">
                              {typeof value === "object"
                                ? JSON.stringify(value, null, 2)
                                : String(value)}
                            </code>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    No metadata available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-yellow-500" />
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-slate-500">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={() =>
                      handleNotificationToggle("emailNotifications")
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-slate-500">
                      Receive browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={() =>
                      handleNotificationToggle("pushNotifications")
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Task Reminders</h4>
                    <p className="text-sm text-slate-500">
                      Get reminded about upcoming tasks
                    </p>
                  </div>
                  <Switch
                    checked={notifications.taskReminders}
                    onCheckedChange={() =>
                      handleNotificationToggle("taskReminders")
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Weekly Digest</h4>
                    <p className="text-sm text-slate-500">
                      Weekly summary of your productivity
                    </p>
                  </div>
                  <Switch
                    checked={notifications.weeklyDigest}
                    onCheckedChange={() =>
                      handleNotificationToggle("weeklyDigest")
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Deadline Alerts</h4>
                    <p className="text-sm text-slate-500">
                      Alerts for approaching deadlines
                    </p>
                  </div>
                  <Switch
                    checked={notifications.deadlineAlerts}
                    onCheckedChange={() =>
                      handleNotificationToggle("deadlineAlerts")
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5 text-purple-500" />
                <span>Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Theme</Label>
                  <p className="text-sm text-slate-500 mb-3">
                    Choose your preferred theme
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      onClick={() => setTheme("light")}
                      className="flex flex-col items-center p-4 h-auto"
                    >
                      <Sun className="h-6 w-6 mb-2" />
                      Light
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      onClick={() => setTheme("dark")}
                      className="flex flex-col items-center p-4 h-auto"
                    >
                      <Moon className="h-6 w-6 mb-2" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      onClick={() => setTheme("system")}
                      className="flex flex-col items-center p-4 h-auto"
                    >
                      <div className="h-6 w-6 mb-2 rounded-full bg-gradient-to-r from-slate-400 to-slate-600" />
                      System
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Compact Mode</h4>
                    <p className="text-sm text-slate-500">
                      Reduce spacing for more content
                    </p>
                  </div>
                  <Switch
                    checked={preferences.compactMode}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("compactMode", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span>Application Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default View</Label>
                  <Select
                    value={preferences.defaultView}
                    onValueChange={(value) =>
                      handlePreferenceChange("defaultView", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                      <SelectItem value="tasks">All Tasks</SelectItem>
                      <SelectItem value="calendar">Calendar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tasks Per Page</Label>
                  <Select
                    value={preferences.tasksPerPage}
                    onValueChange={(value) =>
                      handlePreferenceChange("tasksPerPage", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 tasks</SelectItem>
                      <SelectItem value="12">12 tasks</SelectItem>
                      <SelectItem value="24">24 tasks</SelectItem>
                      <SelectItem value="48">48 tasks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select
                    value={preferences.dateFormat}
                    onValueChange={(value) =>
                      handlePreferenceChange("dateFormat", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Time Format</Label>
                  <Select
                    value={preferences.timeFormat}
                    onValueChange={(value) =>
                      handlePreferenceChange("timeFormat", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 Hour</SelectItem>
                      <SelectItem value="24h">24 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto Save</h4>
                  <p className="text-sm text-slate-500">
                    Automatically save changes as you type
                  </p>
                </div>
                <Switch
                  checked={preferences.autoSave}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange("autoSave", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data">
          <div className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  <span>Data Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div>
                    <h4 className="font-medium">Export Data</h4>
                    <p className="text-sm text-slate-500">
                      Download all your tasks and data
                    </p>
                  </div>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div>
                    <h4 className="font-medium">Storage Usage</h4>
                    <p className="text-sm text-slate-500">
                      You're using 2.3 MB of storage
                    </p>
                  </div>
                  <Badge variant="secondary">2.3 MB / 100 MB</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-700 dark:text-red-400">
                  <Trash2 className="h-5 w-5" />
                  <span>Danger Zone</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-700 dark:text-red-400">
                      Delete All Tasks
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-500">
                      Permanently delete all your tasks
                    </p>
                  </div>
                  <Button variant="destructive">Delete All Tasks</Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-700 dark:text-red-400">
                      Delete Account
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-500">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
