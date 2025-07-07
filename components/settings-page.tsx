"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { User, Bell, Link as LinkIcon } from "lucide-react";
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

      // Check if the user has a Google provider token
      const isConnected =
        user.app_metadata.provider === "google" &&
        user.app_metadata.providers?.includes("google");
      setIsGoogleConnected(!!isConnected);
    }
  }, [user]);

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
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LinkIcon className="h-5 w-5 text-green-500" />
                <span>App Integrations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Google Calendar</h4>
                  <p className="text-sm text-slate-500">
                    {isGoogleConnected
                      ? "Your account is connected. Tasks will be synced automatically."
                      : "Connect your Google account to sync tasks to your calendar."}
                  </p>
                </div>
                {isGoogleConnected ? (
                  <Button variant="outline" disabled>
                    Connected
                  </Button>
                ) : (
                  <Button onClick={handleConnectGoogle}>
                    <GoogleIcon className="h-4 w-4 mr-2" />
                    Connect Google Account
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
