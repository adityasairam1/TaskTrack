import { FormEvent, useEffect, useMemo, useState } from "react";
import "./App.css";

type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
};

const API_BASE = "http://127.0.0.1:8000";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `HTTP ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`
    );
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const remaining = useMemo(
    () => tasks.filter((t) => !t.completed).length,
    [tasks]
  );

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const data = await api<Task[]>("/tasks");
      data.sort((a, b) => b.id - a.id);
      setTasks(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();

    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }

    setSaving(true);
    try {
      const created = await api<Task>("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: trimmedTitle,
          description: trimmedDesc,
        }),
      });
      setTasks((prev) => [created, ...prev]);
      setTitle("");
      setDescription("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function toggleCompleted(task: Task) {
    setError(null);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, completed: !t.completed } : t
      )
    );

    try {
      const updated = await api<Task>(
        `/tasks/${task.id}?completed=${!task.completed}`,
        { method: "PATCH" }
      );
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? updated : t))
      );
    } catch (e: unknown) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, completed: task.completed } : t
        )
      );
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function removeTask(task: Task) {
    setError(null);
    const before = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== task.id));

    try {
      await api<void>(`/tasks/${task.id}`, { method: "DELETE" });
    } catch (e: unknown) {
      setTasks(before);
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="app">
      <header>
        <h1>TaskTrack</h1>
        <span className="stats">
          {tasks.length} total • {remaining} remaining
        </span>
        <button onClick={refresh} disabled={loading}>
          Refresh
        </button>
      </header>

      <section>
        <h2>Create task</h2>
        <form onSubmit={onCreate}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (required)"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
          />
          <div className="actions">
            <button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              onClick={() => {
                setTitle("");
                setDescription("");
                setError(null);
              }}
              disabled={saving}
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      {error && <pre className="error">{error}</pre>}

      <section>
        <h2>Tasks</h2>

        {loading ? (
          <p>Loading…</p>
        ) : tasks.length === 0 ? (
          <p>No tasks yet. Create one.</p>
        ) : (
          <ul className="task-list">
            {tasks.map((t) => (
              <li key={t.id} className="task">
                <div className="task-header">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleCompleted(t)}
                  />
                  <strong
                    className={`task-title ${
                      t.completed ? "completed" : ""
                    }`}
                  >
                    {t.title}
                  </strong>
                  <span className="task-id">#{t.id}</span>
                </div>

                {t.description && (
                  <div className="task-desc">{t.description}</div>
                )}

                <div className="task-meta">
                  <small>
                    Created: {new Date(t.created_at).toLocaleString()}
                  </small>
                  <button onClick={() => removeTask(t)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
