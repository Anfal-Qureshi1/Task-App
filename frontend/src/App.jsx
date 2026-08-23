import { useState } from "react";

function App() {
  const [tasks, setTasks] = useState([]);

  const getTasks = async () => {
  const response = await fetch("http://localhost:5000/api/tasks");

  const data = await response.json();

  setTasks(data);
  };

  return (
    <div>
      <h1>Mini Task App</h1>

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