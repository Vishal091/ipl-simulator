"use client";
import { useState } from "react";

export default function Toss() {
  const [result, setResult] = useState(null);
  const [decision, setDecision] = useState(null);

  const flip = () => {
    const tossWinner = Math.random() > 0.5 ? "You" : "Opponent";
    setResult(tossWinner);

    if (tossWinner === "Opponent") {
      setTimeout(() => {
        const oppDecision = Math.random() > 0.5 ? "bat" : "bowl";

        setDecision(oppDecision);

        localStorage.setItem("tossWinner", "Opponent");
        localStorage.setItem("tossDecision", oppDecision);

        setTimeout(() => {
          window.location.href = "/match/live";
        }, 1000);
      }, 1000);
    }
  };

  const choose = (choice) => {
    setDecision(choice);

    localStorage.setItem("tossWinner", "You");
    localStorage.setItem("tossDecision", choice);

    window.location.href = "/match/live";
  };

  return (
    <div style={{ padding: 20, color: "white", background: "#0B0F1A" }}>
      <h1>🪙 Toss</h1>

      {!result && <button onClick={flip}>Flip Coin</button>}

      {result && (
        <>
          <h2>{result} won the toss</h2>

          {result === "You" && !decision && (
            <>
              <button onClick={() => choose("bat")}>Bat</button>
              <button onClick={() => choose("bowl")}>Bowl</button>
            </>
          )}

          {result === "Opponent" && (
            <>
              <p>Opponent deciding...</p>
              {decision && <p>Opponent chose to {decision}</p>}
            </>
          )}
        </>
      )}
    </div>
  );
}
