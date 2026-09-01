import { useEffect, useState } from "react";
import TaskItem from "./TaskItem";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // GET ALL TASKS
  // =========================
  const getTasks = async () => {
    try {
      setLoading(true);
      setError("");

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
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
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
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/tasks",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            title: title.trim()
          })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const newTask = await response.json();

      setTasks((currentTasks) => [
        ...currentTasks,
        newTask
      ]);

      setTitle("");

    } catch (error) {
      console.error("Error adding task:", error);
      setError("Failed to add task.");
    }
  };


  // =========================
  // COMPLETE / UNCOMPLETE
  // =========================
  const toggleTask = async (task) => {
    try {
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/tasks/${task._id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            completed: !task.completed
          })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await response.json();

      setTasks((currentTasks) =>
        currentTasks.map((t) =>
          t._id === updatedTask._id
            ? updatedTask
            : t
        )
      );

    } catch (error) {
      console.error("Error updating task:", error);
      setError("Failed to update task.");
    }
  };


  // =========================
  // DELETE TASK
  // =========================
  const deleteTask = async (id) => {
    try {
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/tasks/${id}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks((currentTasks) =>
        currentTasks.filter(
          (task) => task._id !== id
        )
      );

    } catch (error) {
      console.error("Error deleting task:", error);
      setError("Failed to delete task.");
    }
  };


  // =========================
  // START EDITING
  // =========================
  const editTask = (task) => {
    setEditingId(task._id);
    setEditTitle(task.title);
  };


  // =========================
  // SAVE EDIT
  // =========================
  const saveEdit = async (id) => {
    if (!editTitle.trim()) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/tasks/${id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            title: editTitle.trim()
          })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await response.json();

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task._id === updatedTask._id
            ? updatedTask
            : task
        )
      );

      setEditingId(null);
      setEditTitle("");

    } catch (error) {
      console.error("Error editing task:", error);
      setError("Failed to edit task.");
    }
  };


  // =========================
  // CANCEL EDIT
  // =========================
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };


  // =========================
  // LOAD WHEN APP OPENS
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


      {error && (
        <p>{error}</p>
      )}


      {loading ? (
        <p>Loading tasks...</p>

      ) : tasks.length === 0 ? (

        <p>No tasks yet.</p>

      ) : (

        tasks.map((task) => (
          <TaskItem
            key={task._id}
            task={task}

            onToggle={toggleTask}
            onDelete={deleteTask}
            onEdit={editTask}

            editingId={editingId}
            editTitle={editTitle}
            setEditTitle={setEditTitle}

            onSaveEdit={saveEdit}
            onCancelEdit={cancelEdit}
          />
        ))

      )}

    </div>
  );
}

export default App;