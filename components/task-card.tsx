"use client"

import type { Task } from "@/components/app/page"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface TaskCardProps {
  task: Task
  onEdit: () => void
  onDelete: () => void
}

const statusConfig = {
  pending: {
    label: "Pending",
    icon: AlertCircle,
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  },
  "in-progress": {
    label: "In Progress",
    icon: Clock,
    className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    className: "bg-green-100 text-green-800 hover:bg-green-200",
  },
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const config = statusConfig[task.status]
  const StatusIcon = config.icon

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-card-foreground text-lg mb-2 text-balance">{task.title}</h3>
            {task.description && <p className="text-muted-foreground text-sm text-pretty">{task.description}</p>}
          </div>
          <Badge className={config.className}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">Created: {new Date(task.createdAt).toLocaleDateString()}</div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="hover:bg-accent hover:text-accent-foreground bg-transparent"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="hover:bg-destructive hover:text-destructive-foreground bg-transparent"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
