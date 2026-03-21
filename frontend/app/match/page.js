"use client";
import { useEffect, useState } from "react";

export default function Match() {
  const [data, setData] = useState(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("matchData");
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, []);

  if (!data) return <p>Loading match...</p>;

  const log = data.log || [];

  const nextBall = () => {
    if (index < log.length) {
      setIndex(index + 1);
    }
  };

  const autoPlay = () => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setIndex(i);
      if (i >= log.length) clearInterval(interval);
    }, 800);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#05070d",
      color: "white",
      padding: "20px"
    }}>
      <h1>🏏 Live Match</h1>

      {/* SCOREBOARD */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "20px"
      }}>
        <h2>1st Innings: {data.innings1}</h2>
        <h2>Target: {data.target}</h2>
        <h2>2nd Innings: {data.innings2}</h2>
      </div>

      <h2>Winner: {data.winner}</h2>

      {/* CONTROLS */}
      <button className="glow-btn" onClick={nextBall}>
        Next Ball
      </button>

      <button className="glow-btn" onClick={autoPlay}>
        Auto Play
      </button>

      {/* COMMENTARY */}
      <div style={{
        marginTop: "20px",
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
    </div>
  );
}
