import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState(null);

  const simulateMatch = async () => {
    const res = await fetch("https://ipl-simulator-tb8n.onrender.com/simulate", {
      method: "POST"
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>IPL Simulator 🏏</h1>

      <button onClick={simulateMatch}>
        Simulate Match
      </button>

      {result && (
        <div>
          <p>{result.team1}: {result.score1}</p>
          <p>{result.team2}: {result.score2}</p>
          <p>Winner: {result.winner}</p>
        </div>
      )}
    </div>
  );
}
