import { useEffect, useState } from "react";
import TaskItem from "./TaskItem";

function App() {

  const API_URL = import.meta.env.VITE_API_URL;
  
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [user, setUser] = useState(null);

  const [registerName, setRegisterName] = useState("");
const [registerEmail, setRegisterEmail] = useState("");
const [registerPassword, setRegisterPassword] = useState("");
const [authMode, setAuthMode] = useState("login");
  // =========================
  // GET ALL TASKS
  // =========================
  const getTasks = async () => {
    
    try {
      
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/tasks`,
         {   
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
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

      const token = localStorage.getItem("token");

const response = await fetch(
  `${API_URL}/api/tasks`,
  {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },

    body: JSON.stringify({
      title: title.trim(),
      priority: priority
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
        `${API_URL}/api/tasks/${task._id}`,
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
        `${API_URL}/api/tasks/${id}`,
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
        `${API_URL}/api/tasks/${id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            title: editTitle.trim(),
            priority: priority
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
  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  if (token && savedUser) {
    setUser(JSON.parse(savedUser));
    getTasks();
  } else {
    setLoading(false);
  }
}, []);

  const loginUser = async () => {
  try {
    setError("");

    const response = await fetch(
      `${API_URL}/api/auth/login`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  setUser(data.user);
  getTasks();

  console.log("Login response:", data);

  } catch (error) {
    console.error("Login error:", error);
    setError(error.message);
  }
};

const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  setUser(null);
  setTasks([]);
};

const registerUser = async () => {
  try {
    setError("");

    const response = await fetch(
      `${API_URL}/api/auth/register`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Registration failed");
    }

    console.log("Registration response:", data);

    setRegisterName("");
    setRegisterEmail("");
    setRegisterPassword("");

    setAuthMode("login");

  } catch (error) {
    console.error("Registration error:", error);
    setError(error.message);
  }
};

  // =========================
  // UI
  // =========================
  return (
    <div>

      <h1>Mini Task App</h1>


{!user ? (
  <>
    {authMode === "login" ? (
      <>
        <h2>Login</h2>

        <input
          type="email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          placeholder="Enter email"
        />

        <input
          type="password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          placeholder="Enter password"
        />

        <button onClick={loginUser}>
          Login
        </button>

        <p>
          Don't have an account?
          <button onClick={() => setAuthMode("register")}>
            Register
          </button>
        </p>
      </>
    ) : (
      <>
        <h2>Register</h2>

        <input
          type="text"
          value={registerName}
          onChange={(e) => setRegisterName(e.target.value)}
          placeholder="Enter name"
        />

        <input
          type="email"
          value={registerEmail}
          onChange={(e) => setRegisterEmail(e.target.value)}
          placeholder="Enter email"
        />

        <input
          type="password"
          value={registerPassword}
          onChange={(e) => setRegisterPassword(e.target.value)}
          placeholder="Enter password"
        />

        <button onClick={registerUser}>
          Register
        </button>

        <p>
          Already have an account?
          <button onClick={() => setAuthMode("login")}>
            Login
          </button>
        </p>
      </>
    )}
  </>
) : (
  <>
    <p>Welcome, {user.name}</p>

    <button onClick={logoutUser}>
      Logout
    </button>

    {/* task UI here */}
  </>
)}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter a task"
      />

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

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