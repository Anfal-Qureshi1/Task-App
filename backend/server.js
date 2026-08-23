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

// Temporary tasks
// let tasks = [
//     { id: 1, title: "Learn frontend" },
//     { id: 2, title: "Learn backend" },
//     { id: 3, title: "Learn deployment" }
// ];

// GET tasks
app.get("/api/tasks", async (req, res) => {
    try {
        const tasks = await tasksCollection.find({}).toArray();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST a new task
app.post("/api/tasks", async (req, res) => {
    const newTask = {
        title: req.body.title
    };

    const result = await tasksCollection.insertOne(newTask);

    res.json({
        _id: result.insertedId,
        ...newTask
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});