"use client";

import { Button } from "@/components/ui/button";
import { Bell, Search, Settings, User, LogOut, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";

export default function Header() {
  const { user, signOut, loading } = useAuth();

  // Helper function to get avatar URL from user data
  const getAvatarUrl = (user: any) => {
    return (
      user?.raw_user_meta_data?.avatar_url ||
      user?.user_metadata?.avatar_url ||
      ""
    );
  };

  // Helper function to get display name
  const getDisplayName = (user: any) => {
    return (
      user?.raw_user_meta_data?.full_name ||
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      ""
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-b border-white/20 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <Link href="/">Todo Dashboard</Link>
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {!loading && (
            <>
              {user ? (
                // Authenticated user menu
                <>
                  <Link href="/add-task">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/50 backdrop-blur-sm border-white/20 hover:bg-white/70"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-white/20"
                  >
                    <Search className="h-4 w-4" />
                  </Button>

                  <Link href="/settings?tab=notifications">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-white/20"
                    >
                      <Bell className="h-4 w-4" />
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 hover:bg-white/20"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={getAvatarUrl(user)} alt="Profile" />
                          <AvatarFallback className="text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            {getDisplayName(user)
                              ? getInitials(getDisplayName(user))
                              : "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-white/80 backdrop-blur-sm border-white/20"
                    >
                      <div className="px-2 py-1.5 text-sm text-gray-700">
                        {user.email}
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/settings">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={signOut}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                // Non-authenticated user options
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-white/20"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
