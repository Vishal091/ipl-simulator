"use client";
import { useState } from "react";

export default function Toss() {
  const [result, setResult] = useState(null);

  const doToss = () => {
    const toss = Math.random() > 0.5 ? "You" : "Opponent";
    setResult(toss);
  };

  const choose = (choice) => {
    localStorage.setItem("tossDecision", choice);
    window.location.href = "/match/live";
  };

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h1>Toss</h1>

      {!result && (
        <button onClick={doToss}>Flip Coin</button>
      )}

      {result && (
        <>
          <h2>{result} won the toss</h2>

          {result === "You" && (
            <>
              <button onClick={() => choose("bat")}>Bat</button>
              <button onClick={() => choose("bowl")}>Bowl</button>
            </>
          )}

          {result === "Opponent" && <p>Opponent decides...</p>}
        </>
      )}
    </div>
  );
}
