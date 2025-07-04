"use client"

import type React from "react"

import { useState } from "react"
import Header from "./header"
import Sidebar from "./sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64 transition-all duration-300">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
