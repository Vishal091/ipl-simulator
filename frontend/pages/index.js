import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const simulateMatch = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "https://ipl-simulator-tb8n.onrender.com/simulate",
        { method: "POST" }
      );

      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Backend error");
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (!result) return;

    const text = `
${result.team1}: ${result.score1}
${result.team2}: ${result.score2}

Winner: ${result.winner}
${result.match_type}
${result.tag}
    `;

    navigator.clipboard.writeText(text);
    alert("Copied! Share it 🔥");
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>🏏 IPL Simulator</h1>

      <button onClick={simulateMatch} disabled={loading}>
        {loading ? "Simulating..." : "Simulate Match"}
      </button>

      {result && (
        <div style={{ marginTop: 30 }}>
          <h2>Result</h2>

          <p>{result.team1}: <b>{result.score1}</b></p>
          <p>{result.team2}: <b>{result.score2}</b></p>

          <h3>🏆 Winner: {result.winner}</h3>

          <p><b>Venue:</b> {result.venue}</p>

          <h3>{result.summary}</h3>

          <h2>{result.match_type}</h2>
          <p>{result.tag}</p>

          <h3>🔥 Key Moments</h3>
          {result.commentary.map((line, i) => (
            <p key={i}>• {line}</p>
          ))}

          <button onClick={copyResult} style={{ marginTop: 20 }}>
            📋 Copy Result
          </button>
        </div>
      )}
    </div>
  );
}
