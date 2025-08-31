"use client"

import { useState, useEffect, useCallback } from "react"
import { TaskList } from "@/components/task-list"
import { TaskForm } from "@/components/task-form"
import { SearchAndFilter } from "@/components/search-and-filter"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, CheckSquare, AlertCircle } from "lucide-react"
import { taskApi, type Task } from "@/lib/api"

export type { Task }

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await taskApi.getTasks({
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      })

      if (response.success && response.data) {
        setTasks(response.data)
        setFilteredTasks(response.data)
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch tasks")
    } finally {
      setLoading(false)
    }
  }, [searchQuery, statusFilter]) // only changes when filters change

  // ✅ Runs whenever searchQuery or statusFilter changes
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])


  const handleCreateTask = () => {
    setEditingTask(null)
    setIsFormOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (taskData: Partial<Task>) => {
    try {
      setError(null)

      if (editingTask) {
        await taskApi.updateTask(editingTask._id, taskData)
      } else {
        await taskApi.createTask(taskData as Omit<Task, "_id" | "createdAt" | "updatedAt">)
      }

      await fetchTasks()
      setIsFormOpen(false)
      setEditingTask(null)
    } catch (error) {
      console.error("Error saving task:", error)
      setError(error instanceof Error ? error.message : "Failed to save task")
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      setError(null)

      await taskApi.deleteTask(taskId)
      await fetchTasks()
    } catch (error) {
      console.error("Error deleting task:", error)
      setError(error instanceof Error ? error.message : "Failed to delete task")
    }
  }

  const getTaskStats = () => {
    const pending = tasks.filter((task) => task.status === "pending").length
    const inProgress = tasks.filter((task) => task.status === "in-progress").length
    const completed = tasks.filter((task) => task.status === "completed").length

    return { pending, inProgress, completed, total: tasks.length }
  }

  const stats = getTaskStats()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">Task Manager</h1>
            <p className="text-muted-foreground text-pretty">Organize and track your tasks efficiently</p>
          </div>
          <Button onClick={handleCreateTask} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>

        {error && (
          <Alert className="mb-6 border-destructive/50 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-card-foreground">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <SearchAndFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {/* Task List */}
        <TaskList tasks={filteredTasks} loading={loading} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} />

        {/* Task Form Modal */}
        {isFormOpen && (
          <TaskForm
            task={editingTask}
            onSubmit={handleFormSubmit}
            onClose={() => {
              setIsFormOpen(false)
              setEditingTask(null)
            }}
          />
        )}
      </div>
    </div>
  )
}
