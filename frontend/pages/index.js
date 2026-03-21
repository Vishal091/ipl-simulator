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

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>🏏 IPL Simulator</h1>

      <button onClick={simulateMatch} disabled={loading}>
        Simulate Match
      </button>

      <button onClick={runTournament} disabled={loading} style={{ marginLeft: 10 }}>
        Run Full IPL 🏆
      </button>

      {/* MATCH */}
      {result && (
        <div style={{ marginTop: 30 }}>
          <h2>{result.team1} vs {result.team2}</h2>

          <p>{result.team1}: <b>{result.score1}</b></p>
          <p>{result.team2}: <b>{result.score2}</b></p>

          <h3>🏆 {result.winner}</h3>
          <p>{result.summary}</p>

          <h2>{result.match_type}</h2>

          <h3>🔥 Moments</h3>
          {result.commentary.map((c, i) => (
            <p key={i}>• {c}</p>
          ))}
        </div>
      )}

      {/* TOURNAMENT */}
      {table && (
        <div style={{ marginTop: 30 }}>
          <h2>🏆 Points Table</h2>

          {Object.entries(table.points_table)
            .sort((a, b) => b[1].points - a[1].points)
            .map(([team, stats]) => (
              <p key={team}>
                {team} - {stats.points} pts (W: {stats.won}, L: {stats.lost})
              </p>
            ))}

          <h3>📅 Matches</h3>
          {table.matches.slice(0, 15).map((m, i) => (
            <p key={i}>{m.match} → {m.winner}</p>
          ))}
        </div>
      )}
    </div>
  );
}
