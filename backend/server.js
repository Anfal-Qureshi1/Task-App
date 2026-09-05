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

const jwt = require("jsonwebtoken");

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

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            error: "Access denied. No token provided."
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            error: "Access denied. Invalid token format."
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            error: "Invalid or expired token"
        });
    }
}


// =========================
// GET ALL TASKS
// =========================
app.get("/api/tasks", authenticateToken, async (req, res) => {
    try {
        const tasks = await tasksCollection.find({
        userId: new ObjectId(req.user.userId)
        }).toArray();

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
app.get("/api/tasks/:id", authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid task ID"
            });
        }

        const task = await tasksCollection.findOne({
        _id: new ObjectId(id),
         userId: new ObjectId(req.user.userId)
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
app.post("/api/tasks", authenticateToken, async (req, res) => {
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
            userId: new ObjectId(req.user.userId),
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
app.delete("/api/tasks/:id", authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid task ID"
            });
        }

       const result = await tasksCollection.deleteOne({
        _id: new ObjectId(id),
        userId: new ObjectId(req.user.userId)
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
app.patch("/api/tasks/:id", authenticateToken, async (req, res) => {
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
            _id: new ObjectId(id),
             userId: new ObjectId(req.user.userId)
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
        _id: new ObjectId(id),
        userId: new ObjectId(req.user.userId)
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

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required"
            });
        }

        const user = await usersCollection.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login successful",
            token: token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            error: "Failed to login"
        });
    }
});