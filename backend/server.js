const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const bcrypt = require("bcrypt");
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const client = new MongoClient(process.env.MONGODB_URI);

const db = client.db("test");
const tasksCollection = db.collection("tasks");
const usersCollection = db.collection("users");

// Start server
async function startServer() {
    try {
        await client.connect();

        await db.command({ ping: 1 });

        console.log("MongoDB connected successfully!");

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("MongoDB connection failed:");
        console.error(error);
    }
}

startServer();


// =========================
// GET ALL TASKS
// =========================
app.get("/api/tasks", async (req, res) => {
    try {
        const tasks = await tasksCollection.find().toArray();

        res.json(tasks);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to get tasks"
        });
    }
});


// =========================
// GET SINGLE TASK
// =========================
app.get("/api/tasks/:id", async (req, res) => {
    try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid task ID"
            });
        }

        const task = await tasksCollection.findOne({
            _id: new ObjectId(id)
        });

        if (!task) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        res.json(task);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to get task"
        });
    }
});


// =========================
// POST - CREATE TASK
// =========================
app.post("/api/tasks", async (req, res) => {
    try {
        const { title, priority } = req.body;

        // Validate title
        if (typeof title !== "string" || title.trim() === "") {
            return res.status(400).json({
                error: "Title is required"
            });
        }

        const allowedPriorities = ["low", "medium", "high"];

        if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({
        error: "Priority must be low, medium, or high"
        });
        }

        const newTask = {
            title: title.trim(),
            priority: priority,
            completed: false,
            createdAt: new Date()
        };

        const result = await tasksCollection.insertOne(newTask);

        res.status(201).json({
            _id: result.insertedId,
            ...newTask
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to create task"
        });
    }
});


// =========================
// DELETE TASK
// =========================
app.delete("/api/tasks/:id", async (req, res) => {
    try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid task ID"
            });
        }

        const result = await tasksCollection.deleteOne({
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to delete task"
        });
    }
});


// =========================
// UPDATE TASK
// =========================
app.patch("/api/tasks/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { title, completed } = req.body;

        // Check ID
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid task ID"
            });
        }

        // Check update data
        if (title === undefined && completed === undefined) {
            return res.status(400).json({
                error: "No update data provided"
            });
        }

        const updateFields = {};

        // Validate title
        if (title !== undefined) {
            if (
                typeof title !== "string" ||
                title.trim() === ""
            ) {
                return res.status(400).json({
                    error: "Title must be a non-empty string"
                });
            }

            updateFields.title = title.trim();
        }

        // Validate completed
        if (completed !== undefined) {
            if (typeof completed !== "boolean") {
                return res.status(400).json({
                    error: "Completed must be true or false"
                });
            }

            updateFields.completed = completed;
        }

        // Update task
        const result = await tasksCollection.updateOne(
            {
                _id: new ObjectId(id)
            },
            {
                $set: updateFields
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        // Get updated task
        const updatedTask = await tasksCollection.findOne({
            _id: new ObjectId(id)
        });

        res.json(updatedTask);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to update task"
        });
    }
});

app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: "Name, email, and password are required"
            });
        }

        const existingUser = await usersCollection.findOne({
            email: email.toLowerCase().trim()
        });

        if (existingUser) {
            return res.status(409).json({
                error: "User with this email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            createdAt: new Date()
        };

        const result = await usersCollection.insertOne(newUser);

        res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: result.insertedId,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            error: "Failed to register user"
        });
    }
});