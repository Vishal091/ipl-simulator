"use client";
import { useState } from "react";

export default function LiveMatch() {
  const [score, setScore] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [balls, setBalls] = useState(0);
  const [log, setLog] = useState([]);

  const playBall = () => {
    const outcomes = [0,1,2,4,6,"W"];
    const res = outcomes[Math.floor(Math.random() * outcomes.length)];

    if (res === "W") {
      setWickets(wickets + 1);
      setLog([...log, "WICKET"]);
    } else {
      setScore(score + res);
      setLog([...log, res]);
    }

    setBalls(balls + 1);
  };

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h1>Live Match</h1>

      <h2>{score}/{wickets}</h2>
      <p>Overs: {Math.floor(balls/6)}.{balls%6}</p>

      <button onClick={playBall}>Next Ball</button>

      <div style={{ marginTop: "20px" }}>
        {log.slice(-10).map((l, i) => (
          <span key={i} style={{ marginRight: "8px" }}>{l}</span>
        ))}
      </div>
    </div>
  );
}
