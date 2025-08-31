const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  errors?: string[]
}

export interface Task {
  _id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed"
  createdAt: string
  updatedAt: string
}

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(data.error || "An error occurred", response.status)
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // Network or other errors
    throw new ApiError("Failed to connect to server. Please check if the API server is running.")
  }
}

export const taskApi = {
  // Get all tasks with optional filters
  getTasks: async (filters?: { search?: string; status?: string }) => {
    const params = new URLSearchParams()
    if (filters?.search) params.append("search", filters.search)
    if (filters?.status && filters.status !== "all") params.append("status", filters.status)

    const queryString = params.toString()
    return apiRequest<Task[]>(`/api/tasks${queryString ? `?${queryString}` : ""}`)
  },

  // Get a single task by ID
  getTask: async (id: string) => {
    return apiRequest<Task>(`/api/tasks/${id}`)
  },

  // Create a new task
  createTask: async (taskData: Omit<Task, "_id" | "createdAt" | "updatedAt">) => {
    return apiRequest<Task>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    })
  },

  // Update an existing task
  updateTask: async (id: string, taskData: Partial<Omit<Task, "_id" | "createdAt" | "updatedAt">>) => {
    return apiRequest<Task>(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    })
  },

  // Delete a task
  deleteTask: async (id: string) => {
    return apiRequest<{ message: string }>(`/api/tasks/${id}`, {
      method: "DELETE",
    })
  },

  // Health check
  healthCheck: async () => {
    return apiRequest<{ status: string; timestamp: string }>("/health")
  },
}
