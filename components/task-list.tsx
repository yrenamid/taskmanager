"use client"

import type { Task } from "@/app/page"
import { TaskCard } from "./task-card"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, FileText } from "lucide-react"

interface TaskListProps {
  tasks: Task[]
  loading: boolean
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
}

export function TaskList({ tasks, loading, onEditTask, onDeleteTask }: TaskListProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading tasks...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-card-foreground mb-2">No tasks found</h3>
          <p className="text-muted-foreground text-center text-pretty">
            Create your first task to get started with organizing your work.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard key={task._id} task={task} onEdit={() => onEditTask(task)} onDelete={() => onDeleteTask(task._id)} />
      ))}
    </div>
  )
}
