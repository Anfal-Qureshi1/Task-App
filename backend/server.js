const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

// Temporary tasks
let tasks = [
    { id: 1, title: "Learn frontend" },
    { id: 2, title: "Learn backend" },
    { id: 3, title: "Learn deployment" }
];

// GET tasks
app.get("/api/tasks", (req, res) => {
    res.json(tasks);
});

// POST a new task
app.post("/api/tasks", (req, res) => {
    const newTask = {
        id: tasks.length + 1,
        title: req.body.title
    };

    tasks.push(newTask);

    res.json(newTask);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});