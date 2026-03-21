"use client";
import { useState } from "react";

export default function Match() {
  const [log, setLog] = useState([]);
  const [index, setIndex] = useState(0);

  const sample = [
    "Kohli hits FOUR",
    "Dot ball",
    "SIX!",
    "WICKET!",
    "Single taken"
  ];

  const start = () => {
    setLog(sample);
    setIndex(0);
  };

  const next = () => {
    if (index < log.length) {
      setIndex(index + 1);
    }
  };

  return (
    <div style={{
      height: "100vh",
      background: "#05070d",
      color: "white",
      padding: "20px"
    }}>
      <h1>🏏 Live Match</h1>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "20px"
      }}>
        <h2>IND 120/3</h2>
        <h2>Target: 180</h2>
      </div>

      <div style={{
        height: "300px",
        overflowY: "auto",
        background: "rgba(255,255,255,0.05)",
        padding: "10px",
        borderRadius: "10px"
      }}>
        {log.slice(0, index).map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </div>

      <button className="glow-btn" onClick={start}>
        Start Match
      </button>

      <button className="glow-btn" onClick={next}>
        Next Ball
      </button>
    </div>
  );
}
