"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  User,
  Bell,
  Link as LinkIcon,
  Calendar,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import GoogleIcon from "@/components/ui/google-icon";
import { fetchTasks } from "@/lib/api";

export default function SettingsPage() {
  const { user, updateProfile, signInWithGoogle } = useAuth();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: "",
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleSyncStatus, setGoogleSyncStatus] = useState({
    connected: false,
    canSync: false,
    message: "",
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingTasksCount, setPendingTasksCount] = useState(0);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setProfile({
        name: getFullName(user),
        email: user.email || "",
        avatar: getAvatarUrl(user),
      });

      // Check Google Calendar sync status via API
      checkGoogleSyncStatus();

      // Get pending tasks count
      getPendingTasksCount();
    }
  }, [user]);

  const checkGoogleSyncStatus = async () => {
    try {
      console.log("Checking Google sync status...");
      const response = await fetch("/api/google-calendar/status");
      const status = await response.json();
      console.log("Google sync status response:", status);
      setGoogleSyncStatus(status);
    } catch (error) {
      console.error("Failed to check Google sync status:", error);
      setGoogleSyncStatus({
        connected: false,
        canSync: false,
        message: "Failed to check status",
      });
    }
  };

  const getPendingTasksCount = async () => {
    try {
      const response = await fetchTasks();
      const pending = response.results.filter(
        (task) => task.status === "Pending" || task.status === "In Progress"
      );
      setPendingTasksCount(pending.length);
    } catch (error) {
      console.error("Failed to get pending tasks count:", error);
    }
  };

  const handleSyncTasks = async () => {
    if (!googleSyncStatus.canSync) {
      toast.error(
        "Google Calendar sync is not available. Please reconnect your account."
      );
      return;
    }

    setIsSyncing(true);
    try {
      console.log("Starting task sync...");
      const response = await fetch("/api/google-calendar/sync-tasks", {
        method: "POST",
      });

      const result = await response.json();
      console.log("Sync result:", result);

      if (response.ok) {
        toast.success(result.message);
        if (result.results.errors.length > 0) {
          console.warn("Sync errors:", result.results.errors);
          // Show detailed errors in a more user-friendly way
          result.results.errors.forEach((error: string) => {
            toast.error(error, { duration: 5000 });
          });
        }
      } else {
        throw new Error(result.error || "Failed to sync tasks");
      }
    } catch (error) {
      console.error("Sync failed:", error);
      toast.error(
        `Sync failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSyncing(false);
    }
  };

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
    toast.info("Notification settings are saved automatically.");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleConnectGoogle = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(`Failed to connect Google Account: ${error.message}`);
    }
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

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
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

        {/* Integrations Settings */}
        <TabsContent value="integrations">
          <div className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LinkIcon className="h-5 w-5 text-green-500" />
                  <span>App Integrations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <h4 className="font-medium">Google Calendar</h4>
                      {googleSyncStatus.connected && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mb-3">
                      {googleSyncStatus.connected
                        ? googleSyncStatus.canSync
                          ? "Your account is connected. Sync your pending tasks to Google Calendar."
                          : googleSyncStatus.message
                        : "Connect your Google account to sync tasks to your calendar."}
                    </p>

                    {googleSyncStatus.connected &&
                      googleSyncStatus.canSync &&
                      pendingTasksCount > 0 && (
                        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            📅 You have <strong>{pendingTasksCount}</strong>{" "}
                            pending tasks that can be synced to your Google
                            Calendar.
                          </p>
                        </div>
                      )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    {googleSyncStatus.connected ? (
                      googleSyncStatus.canSync ? (
                        <Button
                          onClick={handleSyncTasks}
                          disabled={isSyncing || pendingTasksCount === 0}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          {isSyncing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Syncing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Sync Tasks ({pendingTasksCount})
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button onClick={handleConnectGoogle} variant="outline">
                          <GoogleIcon className="h-4 w-4 mr-2" />
                          Reconnect
                        </Button>
                      )
                    ) : (
                      <Button onClick={handleConnectGoogle}>
                        <GoogleIcon className="h-4 w-4 mr-2" />
                        Connect Google Account
                      </Button>
                    )}
                  </div>
                </div>

                {googleSyncStatus.connected && (
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-sm mb-2">
                      Sync Information
                    </h5>
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>• Tasks will be synced as calendar events</p>
                      <p>
                        • High priority tasks appear in red, Medium in orange,
                        Low in green
                      </p>
                      <p>• Only pending and in-progress tasks are synced</p>
                      <p>
                        • Each task gets a 1-hour time slot based on its
                        deadline
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
