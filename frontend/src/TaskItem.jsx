function TaskItem({
  task,
  onToggle,
  onDelete,
  onEdit,
  editingId,
  editTitle,
  setEditTitle,
  onSaveEdit,
  onCancelEdit
}) {
  const isEditing = editingId === task._id;

  return (
    <div>

      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task)}
      />

      {isEditing ? (
        <>
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />

          <button onClick={() => onSaveEdit(task._id)}>
            Save
          </button>

          <button onClick={onCancelEdit}>
            Cancel
          </button>
        </>
      ) : (
        <>
          <span>
            {task.title}
          </span>

          <button onClick={() => onEdit(task)}>
            Edit
          </button>

          <button onClick={() => onDelete(task._id)}>
            Delete
          </button>
        </>
      )}

    </div>
  );
}

export default TaskItem;