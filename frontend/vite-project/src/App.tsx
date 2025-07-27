
import React, { useEffect, useState, useRef } from "react";
import "./index.css";




interface Project {
  id: string;
  name: string;
  description?: string;
  created_by?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  assignee_id: string;
  assignee_name?: string;
  project_id: string;
}

const App: React.FC = () => {
  const statusOptions = ["To do", "In Progress", "Done"];
  //PROJECTS STATE
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState<{
    name: string;
    description: string;
    created_by: string;
  }>({ name: "", description: "", created_by: "" });
  const editingProjectRef = useRef<string | null>(null);

  // TASKS STATE
  const [tasks, setTasks] = useState<Task[]>([]);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    status: string;
    assignee_id: string;
  }>({ title: "", description: "", status: "To do", assignee_id: "" });
  const [assignees, setAssignees] = useState<{ id: string; name: string }[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const editingTaskRef = useRef<string | null>(null);

  // LOAD PROJECTS & ASSIGNEES
  const fetchProjects = async () => {
    const res = await fetch("http://localhost:8000/projects/");
    const data = await res.json();
    setProjects(data);
    if (!selectedProjectId && data.length) {
      setSelectedProjectId(data[0].id);
    }
  };
  const fetchAssignees = async () => {
    const res = await fetch("http://localhost:8000/users/");
    setAssignees(await res.json());
  };

  useEffect(() => {
    fetchProjects();
    fetchAssignees();
  }, []);

  // PROJECTS CRUD
  const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProjectForm(f => ({ ...f, [name]: value }));
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingProjectRef.current;
    //const url = editingProjectRef.current
    const url = isEdit
      ? `http://localhost:8000/projects/projects/${editingProjectRef.current}`
      : "http://localhost:8000/projects/projects/";
    //const method = editingProjectRef.current ? "PUT" : "POST";
    const method = isEdit ? "PUT" : "POST";
    const payload = isEdit
    ? { name: projectForm.name, description: projectForm.description }
    : projectForm;
    const res = await fetch(url, {
    method,
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(projectForm)
  });
    if (!res.ok) {
    console.error(await res.text());
    return;
  }

    const project = await res.json();
    await fetchProjects();
    setSelectedProjectId(project.id);
    editingProjectRef.current = null;
    setProjectForm({ name: "", description: "", created_by: "" });
//     await fetch("http://localhost:8000/tasks/tasks/", {
//         method: editingTaskRef.current ? "PUT" : "POST",
//         headers: { "Content‑Type": "application/json" },
//         body: JSON.stringify({
//     ...formData,
//     project_id: selectedProjectId,     // ← use the CURRENTLY selected project
//     }
//     )
//     });
};
//   await fetch(url, {
//       method,
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(projectForm),
//     });
//
//     editingProjectRef.current = null;
//     setProjectForm({ name: "", description: "", created_by: "" });
//     await fetchProjects();
  //};
  useEffect(() => {
   if (selectedProjectId) fetchTasks();
}, [selectedProjectId]);

  const handleProjectEdit = (p: Project) => {
    setProjectForm({
      name: p.name,
      description: p.description || ""
//       ,
//       created_by: p.created_by || "",
    });
    editingProjectRef.current = p.id;
  };

  const handleProjectDelete = async (id: string) => {
    await fetch(`http://localhost:8000/projects/${id}`, { method: "DELETE" });
    if (id === selectedProjectId) setSelectedProjectId("");
    await fetchProjects();
  };

  // LOAD TASKS
  const fetchTasks = async () => {
    if (!selectedProjectId) return;
    const res = await fetch(`http://localhost:8000/tasks/${selectedProjectId}`);
    setTasks(await res.json());
  };
  useEffect(() => {
    fetchTasks();
    setSelectedProject(null);
  }, [selectedProjectId, projects]);

  // TASKS CRUD
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    const url = editingTaskRef.current
      ? `http://localhost:8000/tasks/tasks/${editingTaskRef.current}`
      : "http://localhost:8000/tasks/tasks/";
    const method = editingTaskRef.current ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, project_id: selectedProjectId }),
    });

    editingTaskRef.current = null;
    setFormData({ title: "", description: "", status: "To‑do", assignee_id: "" });
    await fetchTasks();
  };

  const handleEdit = (task: Task) => {
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      assignee_id: task.assignee_id,
    });
    editingTaskRef.current = task.id;
  };

  const handleDelete = async (taskId: string) => {
    await fetch(`http://localhost:8000/tasks/tasks/${taskId}`, { method: "DELETE" });
    await fetchTasks();
  };


  return (
  //<div style={{ padding: 20, fontFamily: "Arial" }}>
  <div
    style={{
      display: "flex",
      margin: "0 auto",
      maxWidth: 800,
      width:"100%",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      padding: 20,
      fontFamily: "Arial",
    }}
  >
    <h1>Task Board</h1>

    {/* PROJECT LIST & CONTROLS */}
    <label>Choose Project:</label>
    <select
      value={selectedProjectId}
      onChange={e => setSelectedProjectId(e.target.value)}
    >
      <option value="">— none —</option>
      {projects.map(p => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>

    <ul>
      {projects.map(p => (
        <li key={p.id}>
          {p.name}
          <button onClick={() => setSelectedProject(p)}>📖 Read</button>
          <button onClick={() => handleProjectEdit(p)}>✏️ Edit</button>
          <button onClick={() => handleProjectDelete(p.id)}>🗑️ Delete</button>
        </li>
      ))}
    </ul>

    {selectedProject && (
      <div style={{ borderTop: "1px solid #ccc", paddingTop: 10 }}>
        <h3>Project Details</h3>
        <p><strong>ID:</strong> {selectedProject.id}</p>
        <p><strong>Name:</strong> {selectedProject.name}</p>
        <p><strong>Description:</strong> {selectedProject.description}</p>
        <p><strong>Created by:</strong> {selectedProject.created_by}</p>
        <button onClick={() => setSelectedProject(null)}>Close</button>
      </div>
    )}

    {/* PROJECT CREATE / EDIT FORM */}
    <h2>
      {editingProjectRef.current ? "Edit Project" : "Create Project"}
    </h2>
    <form
      onSubmit={handleProjectSubmit}
      style={{
    width: "100%",
    maxWidth: 400,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 8,
     }}
    >
      <input
        name="name"
        placeholder="Project Name"
        value={projectForm.name}
        onChange={handleProjectChange}
        required
      />
      <br/>

      <textarea
        name="description"
        placeholder="Project Description"
        value={projectForm.description}
        onChange={handleProjectChange}
      />
      <br/>

      {/* only show Created By on new */}
      {!editingProjectRef.current && (
        <>
          <label>Created By:</label>
          <select
            name="created_by"
            value={projectForm.created_by}
            onChange={handleProjectChange}
            required
          >
            <option value="">— Select Creator —</option>
            {assignees.map(u => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <br/>
        </>
      )}

      <button type="submit">
        {editingProjectRef.current ? "Update Project" : "Create Project"}
      </button>
    </form>

    {/* TASKS SECTION */}
    {selectedProjectId ? (
      <>
        <h2>Create or Edit Task</h2>
        <form onSubmit={handleSubmit}
              style={{
    width: "100%",
    maxWidth: 400,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 8,
     }}
    >
          <input
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <br/>

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          />
          <br/>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="To do">To do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
          <br/>

          <select
            name="assignee_id"
            value={formData.assignee_id}
            onChange={handleChange}
          >
            <option value="">— Select Assignee —</option>
            {assignees.map(u => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <br/>

          <button type="submit">
            {editingTaskRef.current ? "Update Task" : "Create Task"}
          </button>
        </form>

        <h2>All Tasks</h2>
        <div
          style={{
            display: "flex",
            gap: 20,

            alignItems: "flex-start",
            justifyContent: "center",
            marginTop: 10,
          }}
        >
          {statusOptions.map(status => (
            <div
              key={status}
              style={{
                flex: 1,
                border: "1px solid #ccc",
                borderRadius: 4,
                padding: 10,
                background: "#fafafa",
              }}
            >
              <h3 style={{ textAlign: "center" }}>{status}</h3>
              {tasks
                .filter(task => task.status === status)
                .map(task => (
                  <div
                    key={task.id}
                    style={{
                      background: "#fff",
                      margin: "8px 0",
                      padding: 8,
                      borderRadius: 4,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    <strong>{task.title}</strong>
                    <p style={{ fontSize: 12, color: "#555" }}>
                      {task.description}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <button onClick={() => setSelectedTask(task)}>
                        📖 Read
                      </button>
                      <button onClick={() => handleEdit(task)}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDelete(task.id)}>
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>

        {selectedTask && (
          <div style={{ borderTop: "1px solid #ccc", paddingTop: 10 }}>
            <h3>Task Details</h3>
            <p><strong>Title:</strong> {selectedTask.title}</p>
            <p><strong>Description:</strong> {selectedTask.description}</p>
            <p><strong>Status:</strong> {selectedTask.status}</p>
            <p><strong>Assignee:</strong> {selectedTask.assignee_id}</p>
            <p><strong>Project:</strong> {selectedTask.project_id}</p>
            <button onClick={() => setSelectedTask(null)}>Close</button>
          </div>
        )}
      </>
    ) : (
      <p>Loading project list…</p>
    )}
  </div>
  );
};


export default App;
