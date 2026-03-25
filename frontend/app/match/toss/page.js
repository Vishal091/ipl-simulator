"use client";
import { useState } from "react";

export default function Toss() {
  const [result, setResult] = useState(null);
  const [decision, setDecision] = useState(null);

  const flip = () => {
    const tossWinner = Math.random() > 0.5 ? "You" : "Opponent";
    setResult(tossWinner);

    // 🔥 AUTO DECISION IF OPPONENT WINS
    if (tossWinner === "Opponent") {
      setTimeout(() => {
        const oppDecision = Math.random() > 0.5 ? "bat" : "bowl";

        setDecision(oppDecision);

        localStorage.setItem("tossWinner", "Opponent");
        localStorage.setItem("tossDecision", oppDecision);

        // small delay for UX
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
    <div style={{
      padding: "20px",
      color: "white",
      background: "#0B0F1A",
      minHeight: "100vh"
    }}>
      <h1>🪙 Toss</h1>

      {!result && (
        <button onClick={flip} style={{ marginTop: "20px" }}>
          Flip Coin
        </button>
      )}

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h2>{result} won the toss</h2>

          {/* YOU WON */}
          {result === "You" && !decision && (
            <>
              <p>Choose:</p>

              <button onClick={() => choose("bat")} style={{ marginRight: "10px" }}>
                🏏 Bat
              </button>

              <button onClick={() => choose("bowl")}>
                🎯 Bowl
              </button>
            </>
          )}

          {/* OPPONENT WON */}
          {result === "Opponent" && (
            <>
              <p>Opponent is deciding...</p>

              {decision && (
                <p style={{ marginTop: "10px", color: "#00E5FF" }}>
                  Opponent chose to {decision.toUpperCase()}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
