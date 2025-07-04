export interface Task {
  id: string
  title: string
  description: string
  priority: "Low" | "Medium" | "High"
  status: "Pending" | "In Progress" | "Completed"
  category: string
  deadline: string
  createdAt?: string
  updatedAt?: string
}

export interface ContextEntry {
  id: string
  content: string
  timestamp: string
  type: "whatsapp" | "email" | "note"
  processed?: boolean
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}
