"use client";
import { useEffect, useState } from "react";

export default function Match() {
  const [data, setData] = useState(null);
  const [index, setIndex] = useState(0);

  // 🔥 LIVE STATE
  const [score, setScore] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [balls, setBalls] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("matchData");
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, []);

  if (!data) return <p>Loading match...</p>;

  const log = data.log || [];

  // 🔥 PROCESS BALL
  const processBall = (text) => {
    let runs = 0;
    let wicket = false;

    if (text.includes("FOUR")) runs = 4;
    else if (text.includes("SIX")) runs = 6;
    else if (text.includes("OUT")) wicket = true;
    else if (text.includes("1")) runs = 1;
    else if (text.includes("2")) runs = 2;
    else if (text.includes("3")) runs = 3;

    return { runs, wicket };
  };

  // 🔥 NEXT BALL
  const nextBall = () => {
    if (index >= log.length) return;

    const ballText = log[index];
    const { runs, wicket } = processBall(ballText);

    setScore(prev => prev + runs);
    setBalls(prev => prev + 1);

    if (wicket) {
      setWickets(prev => prev + 1);
    }

    setIndex(index + 1);
  };

  // 🔥 AUTO PLAY
  const autoPlay = () => {
    let i = index;

    const interval = setInterval(() => {
      if (i >= log.length) {
        clearInterval(interval);
        return;
      }

      const ballText = log[i];
      const { runs, wicket } = processBall(ballText);

      setScore(prev => prev + runs);
      setBalls(prev => prev + 1);

      if (wicket) {
        setWickets(prev => prev + 1);
      }

      i++;
      setIndex(i);
    }, 800);
  };

  // 🔥 CALCULATIONS
  const runsNeeded = data.target - score;
  const ballsLeft = 120 - balls;

  const rrr =
    ballsLeft > 0
      ? (runsNeeded / (ballsLeft / 6)).toFixed(2)
      : 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#05070d",
      color: "white",
      padding: "20px"
    }}>
      <h1>🏏 Live Match</h1>

      {/* 🔥 LIVE SCOREBOARD */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "20px"
      }}>
        <h2>{score}/{wickets}</h2>
        <h2>
          Over: {Math.floor(balls / 6)}.{balls % 6}
        </h2>
      </div>

      <h3>
        Need {runsNeeded > 0 ? runsNeeded : 0} off {ballsLeft}
      </h3>

      <h3>RRR: {rrr}</h3>

      <h2>Target: {data.target}</h2>

      {/* 🔥 CONTROLS */}
      <button className="glow-btn" onClick={nextBall}>
        Next Ball
      </button>

      <button className="glow-btn" onClick={autoPlay} style={{ marginLeft: "10px" }}>
        Auto Play
      </button>

      {/* 🔥 COMMENTARY */}
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

      {/* 🔥 FINAL RESULT */}
      {index >= log.length && (
        <h2 style={{ marginTop: "20px" }}>
          Winner: {data.winner}
        </h2>
      )}
    </div>
  );
}
