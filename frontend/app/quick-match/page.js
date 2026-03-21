"use client";
import { useState } from "react";

export default function QuickMatch() {
  const API = "https://ipl-simulator-tb8n.onrender.com";
  const [result, setResult] = useState(null);

  const play = async () => {
    const res = await fetch(API + "/quick-match", { method: "POST" });
    setResult(await res.json());
  };

  return (
    <div style={{ padding: 20, color: "white", background: "#0B0F1A", minHeight: "100vh" }}>
      <h1>⚡ Quick Match</h1>
      <button onClick={play}>Simulate Match</button>

      {result && (
        <div>
          <h2>{result.team1} vs {result.team2}</h2>
          <h3>{result.innings1} / {result.innings2}</h3>
          <h2>Winner: {result.winner}</h2>
        </div>
      )}
    </div>
  );
}
