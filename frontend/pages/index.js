import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const simulateMatch = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "https://ipl-simulator-tb8n.onrender.com/simulate",
        {
          method: "POST"
        }
      );

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>🏏 IPL Simulator</h1>

      <button
        onClick={simulateMatch}
        disabled={loading}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer"
        }}
      >
        {loading ? "Simulating..." : "Simulate Match"}
      </button>

      {result && (
        <div style={{ marginTop: 30 }}>
          <h2>Result</h2>

          <p>
            {result.team1}: <b>{result.score1}</b>
          </p>
          <p>
            {result.team2}: <b>{result.score2}</b>
          </p>

          <h3>🏆 Winner: {result.winner}</h3>

          <p>
            <b>Venue:</b> {result.venue}
          </p>

          <h3>{result.summary}</h3>

          <h3>🔥 Key Moments</h3>
          {result.commentary &&
            result.commentary.map((line, index) => (
              <p key={index}>• {line}</p>
            ))}
        </div>
      )}
    </div>
  );
}
