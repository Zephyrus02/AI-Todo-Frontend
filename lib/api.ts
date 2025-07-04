import axios from "axios";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

// Create an axios instance with default configuration
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  async (config) => {
    const supabase = createClientComponentClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error Details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
      },
    });
    return Promise.reject(error);
  }
);

export const api = {
  baseUrl: BASE_URL,
  endpoints: {
    tasks: "/api/tasks/",
    categories: "/api/categories/",
    contextEntries: "/api/context-entries/",
    processContexts: "/api/process-contexts/",
  },
};

export interface CreateTaskRequest {
  title: string;
  description: string;
  category?: string;
  priority_label?: "Low" | "Medium" | "High";
  deadline?: string;
  status?: "Pending" | "In Progress" | "Completed";
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  category?: string;
  priority_label?: "Low" | "Medium" | "High";
  deadline?: string;
  status?: "Pending" | "In Progress" | "Completed";
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string | null;
  category_name: string | null;
  priority_score: number;
  priority_label: "Low" | "Medium" | "High";
  deadline: string;
  status: "Pending" | "In Progress" | "Completed";
  created_at: string;
  updated_at: string;
}

export interface TasksResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Task[];
}

export interface CreateContextRequest {
  content: string;
  source_type: string;
  insights?: {
    summary?: string;
    key_entities?: string[];
    suggested_tasks?: {
      title: string;
      priority: "Low" | "Medium" | "High";
      deadline?: string;
    }[];
  };
}

export interface UpdateContextRequest {
  content?: string;
  source_type?: string;
}

export interface SuggestedTask {
  title: string;
  deadline: string;
  priority: "Low" | "Medium" | "High";
}

export interface Insights {
  summary: string;
  key_entities: string[];
  suggested_tasks: SuggestedTask[];
}

export interface ContextEntry {
  id: string;
  content: string;
  source_type: string;
  insights: Insights;
  created_at: string;
}

export interface ContextEntriesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ContextEntry[];
}

// Context API functions
export const createContextEntry = async (contextData: CreateContextRequest) => {
  try {
    const response = await apiClient.post(
      api.endpoints.contextEntries,
      contextData
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to create context entry"
    );
  }
};

export const deleteContextEntry = async (contextId: string) => {
  try {
    await apiClient.delete(`${api.endpoints.contextEntries}${contextId}/`);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to delete context entry"
    );
  }
};

export const updateContextEntry = async (
  contextId: string,
  contextData: UpdateContextRequest
) => {
  try {
    const response = await apiClient.patch(
      `${api.endpoints.contextEntries}${contextId}/`,
      contextData
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to update context entry"
    );
  }
};

export const fetchContextEntries =
  async (): Promise<ContextEntriesResponse> => {
    try {
      const response = await apiClient.get(api.endpoints.contextEntries);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch context entries"
      );
    }
  };

export const processContextsForTaskCreation = async (userId: string) => {
  try {
    const response = await apiClient.post(
      `${api.endpoints.processContexts}${userId}/`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to process contexts"
    );
  }
};

// Task API functions
export const createTask = async (taskData: CreateTaskRequest) => {
  try {
    console.log("Creating task with data:", taskData);
    console.log("API endpoint:", api.endpoints.tasks);

    const response = await apiClient.post(api.endpoints.tasks, taskData);
    const createdTask = response.data;

    // Sync with Google Calendar (non-blocking)
    try {
      await axios.post("/api/google-calendar/create-event", {
        title: createdTask.title,
        description: createdTask.description,
        deadline: createdTask.deadline,
      });
    } catch (calendarError) {
      console.error("Could not sync task to Google Calendar:", calendarError);
    }

    return createdTask;
  } catch (error: any) {
    console.error("Create task error:", error);
    throw new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to create task"
    );
  }
};

export const updateTask = async (
  taskId: string,
  taskData: UpdateTaskRequest
): Promise<Task> => {
  try {
    const response = await apiClient.patch(
      `${api.endpoints.tasks}${taskId}/`,
      taskData
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to update task"
    );
  }
};

export const fetchTasks = async (): Promise<TasksResponse> => {
  try {
    console.log("Fetching tasks from:", api.endpoints.tasks);
    const response = await apiClient.get(api.endpoints.tasks);
    console.log("Fetched tasks:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Fetch tasks error:", error);
    throw new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch tasks"
    );
  }
};

export const updateTaskStatus = async (
  taskId: string,
  status: "Pending" | "In Progress" | "Completed"
) => {
  try {
    const response = await apiClient.patch(
      `${api.endpoints.tasks}${taskId}/update_status/`,
      { status }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to update task status"
    );
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    await apiClient.delete(`${api.endpoints.tasks}${taskId}/`);
    return true;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to delete task"
    );
  }
};
