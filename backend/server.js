const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

app.use(express.json());

const PORT = 5000;

app.get("/", (req, res) => {
    res.send("Backend is running!");
});

app.get("/api/tasks", (req, res) => {
    res.json([
        { id: 1, title: "Learn frontend" },
        { id: 2, title: "Learn backend" },
        { id: 3, title: "Learn deployment" }
    ]);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});