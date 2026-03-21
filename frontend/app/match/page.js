"use client";
import { useEffect, useState } from "react";

export default function Match() {
  const [data, setData] = useState(null);
  const [index, setIndex] = useState(0);

  // 🔥 LIVE STATE
  const [score, setScore] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [balls, setBalls] = useState(0);

  // ================= LOAD MATCH =================
  useEffect(() => {
    try {
      const stored = localStorage.getItem("matchData");
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Error loading match data", err);
    }
  }, []);

  if (!data) {
    return (
      <div style={{ color: "white", padding: "20px" }}>
        Loading match...
      </div>
    );
  }

  const log = data.log || [];

  // ================= BALL PROCESS =================
  const processBall = (text) => {
    let runs = 0;
    let wicket = false;

    if (!text) return { runs: 0, wicket: false };

    const t = text.toUpperCase();

    if (t.includes("FOUR")) runs = 4;
    else if (t.includes("SIX")) runs = 6;
    else if (t.includes("OUT")) wicket = true;
    else if (t.includes(" 1")) runs = 1;
    else if (t.includes(" 2")) runs = 2;
    else if (t.includes(" 3")) runs = 3;

    return { runs, wicket };
  };

  // ================= NEXT BALL =================
  const nextBall = () => {
    if (index >= log.length) return;

    const ballText = log[index];
    const { runs, wicket } = processBall(ballText);

    setScore((prev) => prev + runs);
    setBalls((prev) => prev + 1);

    if (wicket) {
      setWickets((prev) => prev + 1);
    }

    setIndex((prev) => prev + 1);
  };

  // ================= AUTO PLAY =================
  const autoPlay = () => {
    let i = index;

    const interval = setInterval(() => {
      if (i >= log.length) {
        clearInterval(interval);
        return;
      }

      const ballText = log[i];
      const { runs, wicket } = processBall(ballText);

      setScore((prev) => prev + runs);
      setBalls((prev) => prev + 1);

      if (wicket) {
        setWickets((prev) => prev + 1);
      }

      i++;
      setIndex(i);
    }, 700);
  };

  // ================= CALCULATIONS =================
  const runsNeeded = Math.max(data.target - score, 0);
  const ballsLeft = Math.max(120 - balls, 0);

  const rrr =
    ballsLeft > 0
      ? (runsNeeded / (ballsLeft / 6)).toFixed(2)
      : 0;

  const currentOver = `${Math.floor(balls / 6)}.${balls % 6}`;

  // ================= UI =================
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#05070d",
        color: "white",
        padding: "20px",
      }}
    >
      <h1>🏏 Live Match</h1>

      {/* 🔥 SCOREBOARD */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h2>{score}/{wickets}</h2>
        <h2>Overs: {currentOver}</h2>
      </div>

      <h3>Target: {data.target}</h3>
      <h3>
        Need {runsNeeded} off {ballsLeft}
      </h3>
      <h3>RRR: {rrr}</h3>

      {/* 🔥 CONTROLS */}
      <div style={{ marginTop: "15px" }}>
        <button className="glow-btn" onClick={nextBall}>
          Next Ball
        </button>

        <button
          className="glow-btn"
          onClick={autoPlay}
          style={{ marginLeft: "10px" }}
        >
          Auto Play
        </button>
      </div>

      {/* 🔥 COMMENTARY */}
      <div
        style={{
          marginTop: "20px",
          height: "320px",
          overflowY: "auto",
          background: "rgba(255,255,255,0.05)",
          padding: "12px",
          borderRadius: "10px",
        }}
      >
        {log.slice(0, index).map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </div>

      {/* 🔥 MATCH RESULT */}
      {index >= log.length && (
        <h2 style={{ marginTop: "20px", color: "#00E5FF" }}>
          Winner: {data.winner}
        </h2>
      )}
    </div>
  );
}
