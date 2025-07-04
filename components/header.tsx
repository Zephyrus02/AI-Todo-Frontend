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
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">
            <Link href="/">Ergosphere Todo</Link>
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {!loading && (
            <>
              {user ? (
                // Authenticated user menu
                <>
                  <Link href="/add-task">
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </Link>

                  <Button variant="ghost" size="sm">
                    <Search className="h-4 w-4" />
                  </Button>

                  <Link href="/settings?tab=notifications">
                    <Button variant="ghost" size="sm">
                      <Bell className="h-4 w-4" />
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-1">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={getAvatarUrl(user)} alt="Profile" />
                          <AvatarFallback className="text-sm">
                            {getDisplayName(user)
                              ? getInitials(getDisplayName(user))
                              : "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">Get Started</Button>
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
