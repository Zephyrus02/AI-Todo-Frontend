import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export const api = {
  baseUrl: BASE_URL,
  endpoints: {
    tasks: `${BASE_URL}api/tasks/`,
    categories: `${BASE_URL}api/categories/`,
    contextEntries: `${BASE_URL}api/context-entries/`,
    processContexts: `${BASE_URL}api/process-contexts/`,
  },
};

export interface CreateTaskRequest {
  title: string;
  description: string;
  category?: string; // UUID of category
  priority_label?: "Low" | "Medium" | "High";
  deadline?: string; // ISO datetime
  status?: "Pending" | "In Progress" | "Completed";
}

// --- Context Entry Interfaces ---

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

// --- End Context Entry Interfaces ---

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

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  category?: string;
  priority_label?: "Low" | "Medium" | "High";
  deadline?: string;
  status?: "Pending" | "In Progress" | "Completed";
}

export interface TasksResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Task[];
}

export const createContextEntry = async (contextData: CreateContextRequest) => {
  const supabase = createClientComponentClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(api.endpoints.contextEntries, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(contextData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", errorText);
    throw new Error(
      `Failed to create context entry: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
};

export const deleteContextEntry = async (contextId: string) => {
  const supabase = createClientComponentClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${api.endpoints.contextEntries}${contextId}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (response.status !== 204) {
    const errorText = await response.text();
    console.error("API Error:", errorText);
    throw new Error(
      `Failed to delete context entry: ${response.status} ${response.statusText}`
    );
  }
};

export const updateContextEntry = async (
  contextId: string,
  contextData: UpdateContextRequest
) => {
  const supabase = createClientComponentClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${api.endpoints.contextEntries}${contextId}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(contextData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", errorText);
    throw new Error(
      `Failed to update context entry: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
};

export const fetchContextEntries =
  async (): Promise<ContextEntriesResponse> => {
    const supabase = createClientComponentClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(api.endpoints.contextEntries, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Fetch context entries error:", errorText);
      throw new Error(
        `Failed to fetch context entries: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  };

export const processContextsForTaskCreation = async (userId: string) => {
  const supabase = createClientComponentClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${api.endpoints.processContexts}${userId}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", errorText);
    throw new Error(
      `Failed to process contexts: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
};

export const createTask = async (taskData: CreateTaskRequest) => {
  const supabase = createClientComponentClient();

  // Get the current session for authentication
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("No authentication token found");
  }

  console.log("Creating task with data:", taskData);
  console.log("API endpoint:", api.endpoints.tasks);

  const response = await fetch(api.endpoints.tasks, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(taskData),
  });

  console.log("API Response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", errorText);
    throw new Error(
      `Failed to create task: ${response.status} ${response.statusText}`
    );
  }

  const createdTask = await response.json();

  // --- NEW: Sync with Google Calendar ---
  try {
    // We don't need to await this; it can run in the background.
    fetch("/api/google-calendar/create-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: createdTask.title,
        description: createdTask.description,
        deadline: createdTask.deadline,
      }),
    });
  } catch (e) {
    // Log the error, but don't block the UI from showing success for the task creation itself.
    console.error("Could not sync task to Google Calendar:", e);
  }
  // --- END NEW ---

  return createdTask;
};

export const updateTask = async (
  taskId: string,
  taskData: UpdateTaskRequest
): Promise<Task> => {
  const supabase = createClientComponentClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${api.endpoints.tasks}${taskId}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", errorText);
    throw new Error(
      `Failed to update task: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
};

export const fetchTasks = async (): Promise<TasksResponse> => {
  const supabase = createClientComponentClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("No authentication token found");
  }

  console.log("Fetching tasks from:", api.endpoints.tasks);

  const response = await fetch(api.endpoints.tasks, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  console.log("Fetch tasks response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Fetch tasks error:", errorText);
    throw new Error(
      `Failed to fetch tasks: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();
  console.log("Fetched tasks:", result);
  return result;
};

export const updateTaskStatus = async (
  taskId: string,
  status: "Pending" | "In Progress" | "Completed"
) => {
  const supabase = createClientComponentClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${api.endpoints.tasks}${taskId}/update_status/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Update task status error:", errorText);
    throw new Error(
      `Failed to update task status: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
};

export const deleteTask = async (taskId: string) => {
  const supabase = createClientComponentClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${api.endpoints.tasks}${taskId}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Delete task error:", errorText);
    throw new Error(
      `Failed to delete task: ${response.status} ${response.statusText}`
    );
  }

  return true;
};
