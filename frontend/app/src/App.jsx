import { useEffect, useState } from "react";

const API_BASE = "/api";

export default function App() {
    const [health, setHealth] = useState("loading...");

    useEffect(() => {
        fetch(`${API_BASE}/health`)
            .then((r) => r.json())
            .then((d) => setHealth(JSON.stringify(d)))
            .catch((e) => setHealth(`error: ${String(e)}`));
    }, []);

    return (
        <div style={{ padding: 16 }}>
            <h1>Coffee Menu</h1>
            <p>API health: {health}</p>
        </div>
    );
}
