"use client";
import { useState } from "react";

export default function Toss() {
  const [result, setResult] = useState(null);

  const flip = () => {
    setResult(Math.random() > 0.5 ? "You" : "Opponent");
  };

  const choose = (choice) => {
    localStorage.setItem("decision", choice);
    window.location.href = "/match/live";
  };

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1>Toss</h1>

      {!result && <button onClick={flip}>Flip</button>}

      {result && (
        <>
          <h2>{result} won</h2>

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
