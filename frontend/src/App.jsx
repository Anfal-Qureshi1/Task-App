import { useState } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const getTasks = async () => {
  const response = await fetch("http://localhost:5000/api/tasks");

  const data = await response.json();

  setTasks(data);
  };

  const addTask = async () => {
  const response = await fetch("http://localhost:5000/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: title
    })
  });

  const newTask = await response.json();

  setTasks([...tasks, newTask]);

  setTitle("");
};

  return (
    <div>
      <h1>Mini Task App</h1>

      <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="Enter a task"
     />

      <button onClick={addTask}>Add Task</button>

      <button onClick={getTasks}>Get Tasks</button>

      <div>
        {tasks.length === 0 ? (
          <p>No tasks loaded yet.</p>
        ) : (
          tasks.map((task) => (
            <p key={task.id}>{task.title}</p>
          ))
        )}
      </div>
    </div>
  );
}

export default App;