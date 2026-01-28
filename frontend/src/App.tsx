import { useEffect, useState } from "react";

type Health = { status: string };

export default function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/health")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as Health;
      })
      .then(setHealth)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>TaskTrack</h1>
      <p>Backend health:</p>
      {error && <pre style={{ color: "crimson" }}>{error}</pre>}
      {health ? <pre>{JSON.stringify(health, null, 2)}</pre> : <p>Loading...</p>}
    </div>
  );
}
