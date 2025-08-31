
import "dotenv/config";
import express from "express"
import cors from "cors"
import clientPromise from "./lib/mongodb.js"
import { Task } from "./models/Task.js"

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Get database connection
let db
clientPromise.then((client) => {
  db = client.db("taskmanager")
  console.log("Connected to MongoDB")
})

// Routes

// Get all tasks with optional filtering and search
app.get("/api/tasks", async (req, res) => {
  try {
    const { status, search } = req.query
    const filters = {}

    if (status) filters.status = status
    if (search) filters.search = search

    const tasks = await Task.findAll(db, filters)
    res.json({ success: true, data: tasks })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    res.status(500).json({ success: false, error: "Failed to fetch tasks" })
  }
})

// Get a single task
app.get("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params
    const task = await Task.findById(db, id)

    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" })
    }

    res.json({ success: true, data: task })
  } catch (error) {
    console.error("Error fetching task:", error)
    res.status(500).json({ success: false, error: "Failed to fetch task" })
  }
})

// Create a new task
app.post("/api/tasks", async (req, res) => {
  try {
    const errors = Task.validate(req.body)
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors })
    }

    const task = new Task(req.body)
    const savedTask = await task.save(db)

    res.status(201).json({ success: true, data: savedTask })
  } catch (error) {
    console.error("Error creating task:", error)
    res.status(500).json({ success: false, error: "Failed to create task" })
  }
})

// Update a task
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params
    const existingTask = await Task.findById(db, id)

    if (!existingTask) {
      return res.status(404).json({ success: false, error: "Task not found" })
    }

    const errors = Task.validate(req.body)
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors })
    }

    const task = new Task({ ...existingTask, ...req.body, _id: id })
    const updatedTask = await task.save(db)

    res.json({ success: true, data: updatedTask })
  } catch (error) {
    console.error("Error updating task:", error)
    res.status(500).json({ success: false, error: "Failed to update task" })
  }
})

// Delete a task
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params
    const result = await Task.deleteById(db, id)

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: "Task not found" })
    }

    res.json({ success: true, message: "Task deleted successfully" })
  } catch (error) {
    console.error("Error deleting task:", error)
    res.status(500).json({ success: false, error: "Failed to delete task" })
  }
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
