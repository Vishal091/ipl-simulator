"use client";
import { useState } from "react";

export default function Live() {
  const [score, setScore] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [balls, setBalls] = useState(0);

  const playBall = () => {
    const r = [0,1,2,4,6,"W"][Math.floor(Math.random()*6)];

    if (r === "W") setWickets(wickets+1);
    else setScore(score+r);

    setBalls(balls+1);
  };

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1>{score}/{wickets}</h1>
      <p>{Math.floor(balls/6)}.{balls%6}</p>

      <button onClick={playBall}>Next Ball</button>
    </div>
  );
}
