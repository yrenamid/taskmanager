import { ObjectId } from "mongodb"

export class Task {
constructor(data) {
  if (data._id) {
    if (typeof data._id === "string") {
      this._id = new ObjectId(data._id)
    } else {
      this._id = data._id
    }
  } else {
    this._id = undefined
  }
  this.title = data.title
  this.description = data.description || ""
  this.status = data.status || "pending"
  this.createdAt = data.createdAt || new Date()
  this.updatedAt = data.updatedAt || new Date()
}


  static validate(data) {
    const errors = []

    if (!data.title || data.title.trim().length === 0) {
      errors.push("Title is required")
    }

    if (data.title && data.title.length > 100) {
      errors.push("Title must be less than 100 characters")
    }

    if (data.description && data.description.length > 500) {
      errors.push("Description must be less than 500 characters")
    }

    const validStatuses = ["pending", "in-progress", "completed"]
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push("Status must be one of: pending, in-progress, completed")
    }

    return errors
  }

  static async findAll(db, filters = {}) {
    const collection = db.collection("tasks")
    const query = {}

    // Filter by status
    if (filters.status) {
      query.status = filters.status
    }

    // Search by keyword in title or description
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ]
    }

    return await collection.find(query).sort({ createdAt: -1 }).toArray()
  }

  static async findById(db, id) {
    const collection = db.collection("tasks")
    return await collection.findOne({ _id: new ObjectId(id) })
  }

  async save(db) {
    const collection = db.collection("tasks")
    this.updatedAt = new Date()

    if (this._id) {
  this.updatedAt = new Date()
  const { _id, ...updateData } = this
  await collection.updateOne(
    { _id: new ObjectId(_id) },
    { $set: updateData }
  )
  return { _id, ...updateData }
} else {
      // Create new task
      const result = await collection.insertOne(this)
      return { _id: result.insertedId, ...this }
    }
  }

  static async deleteById(db, id) {
    const collection = db.collection("tasks")
    return await collection.deleteOne({ _id: new ObjectId(id) })
  }
}
