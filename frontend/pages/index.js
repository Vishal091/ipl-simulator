import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const simulateMatch = async () => {
    try {
      setLoading(true);

      const res = await fetch("https://ipl-simulator-tb8n.onrender.com/simulate", {
        method: "POST"
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Error:", err);
      alert("Backend not reachable or error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>IPL Simulator 🏏</h1>

      <button onClick={simulateMatch} disabled={loading}>
        {loading ? "Simulating..." : "Simulate Match"}
      </button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <p>{result.team1}: {result.score1}</p>
          <p>{result.team2}: {result.score2}</p>
          <p><b>Winner: {result.winner}</b></p>
          <p>Venue: {result.venue}</p>
        </div>
      )}
    </div>
  );
}
