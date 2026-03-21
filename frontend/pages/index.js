import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState(null);
  const [table, setTable] = useState(null);
  const [loading, setLoading] = useState(false);

  const simulateMatch = async () => {
    setLoading(true);
    const res = await fetch("https://ipl-simulator-tb8n.onrender.com/simulate", { method: "POST" });
    const data = await res.json();
    setResult(data);
    setTable(null);
    setLoading(false);
  };

  const runTournament = async () => {
    setLoading(true);
    const res = await fetch("https://ipl-simulator-tb8n.onrender.com/tournament");
    const data = await res.json();
    setTable(data);
    setResult(null);
    setLoading(false);
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
    alert("Copied! 🔥");
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>🏏 IPL Simulator</h1>

      <button onClick={simulateMatch} disabled={loading}>
        Simulate Match
      </button>

      <button onClick={runTournament} disabled={loading} style={{ marginLeft: 10 }}>
        Run Tournament 🏆
      </button>

      {/* MATCH RESULT */}
      {result && (
        <div style={{ marginTop: 30 }}>
          <h2>{result.team1} vs {result.team2}</h2>

          <p>{result.team1}: <b>{result.score1}</b></p>
          <p>{result.team2}: <b>{result.score2}</b></p>

          <h3>🏆 {result.winner}</h3>
          <p>{result.summary}</p>

          <h2>{result.match_type}</h2>
          <p>{result.tag}</p>

          <h3>🔥 Key Moments</h3>
          {result.commentary.map((c, i) => (
            <p key={i}>• {c}</p>
          ))}

          <button onClick={copyResult}>📋 Copy Result</button>
        </div>
      )}

      {/* TOURNAMENT TABLE */}
      {table && (
        <div style={{ marginTop: 30 }}>
          <h2>🏆 Points Table</h2>

          {Object.entries(table).map(([team, stats]) => (
            <p key={team}>
              {team} - {stats.points} pts (W: {stats.won}, L: {stats.lost})
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
