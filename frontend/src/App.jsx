import { useEffect, useState } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  // =========================
  // GET ALL TASKS
  // =========================
  const getTasks = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/tasks"
      );

      if (!response.ok) {
        throw new Error("Failed to get tasks");
      }

      const data = await response.json();

      setTasks(data);

    } catch (error) {
      console.error("Error getting tasks:", error);
    }
  };


  // =========================
  // ADD TASK
  // =========================
  const addTask = async () => {
    if (!title.trim()) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/tasks",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            title: title
          })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const newTask = await response.json();

      setTasks([...tasks, newTask]);

      setTitle("");

    } catch (error) {
      console.error("Error adding task:", error);
    }
  };


  // =========================
  // LOAD TASKS WHEN APP OPENS
  // =========================
  useEffect(() => {
    getTasks();
  }, []);


  // =========================
  // UI
  // =========================
  return (
    <div>
      <h1>Mini Task App</h1>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter a task"
      />

      <button onClick={addTask}>
        Add Task
      </button>


      <div>
        {tasks.length === 0 ? (
          <p>No tasks yet.</p>
        ) : (
          tasks.map((task) => (
            <p key={task._id}>
              {task.title}
            </p>
          ))
        )}
      </div>

    </div>
  );
}

export default App;