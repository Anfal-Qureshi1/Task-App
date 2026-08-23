const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

const client = new MongoClient(process.env.MONGODB_URI);

const db = client.db("test");
const tasksCollection = db.collection("tasks");

async function startServer() {
    try {
        await client.connect();

        await db.command({ ping: 1 });

        console.log("MongoDB connected successfully!");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("MongoDB connection failed:");
        console.error(error);
    }
}

startServer();

// GET tasks
app.get("/api/tasks", async (req, res) => {
    try {
        const tasks = await tasksCollection.find().toArray();

        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get tasks" });
    }
});

// POST a new task
app.post("/api/tasks", async (req, res) => {
    try {
        console.log("Received body:", req.body);

        const newTask = {
            title: req.body.title
        };

        const result = await tasksCollection.insertOne(newTask);

        res.status(201).json({
            _id: result.insertedId,
            ...newTask
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create task" });
    }
});