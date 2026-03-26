"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [team, setTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ NEW STATES (added only)
  const [pointsTable, setPointsTable] = useState({});
  const [playerStats, setPlayerStats] = useState({});

  useEffect(() => {
    try {
      const savedTeam = JSON.parse(localStorage.getItem("selectedTeam"));
      const savedMatches = JSON.parse(localStorage.getItem("matches")) || [];

      setTeam(savedTeam);
      setMatches(savedMatches);
      setRecentMatches(savedMatches.slice(-5));

      // ✅ NEW (safe addition)
      const table = JSON.parse(localStorage.getItem("pointsTable")) || {};
      const stats = JSON.parse(localStorage.getItem("playerStats")) || {};

      setPointsTable(table);
      setPlayerStats(stats);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ SORTING (added only)
  const sortedTeams = Object.entries(pointsTable || {}).sort(
    (a, b) => (b[1]?.points || 0) - (a[1]?.points || 0)
  );

  const orangeCap = Object.entries(playerStats || {}).sort(
    (a, b) => (b[1]?.runs || 0) - (a[1]?.runs || 0)
  )[0];

  const purpleCap = Object.entries(playerStats || {}).sort(
    (a, b) => (b[1]?.wickets || 0) - (a[1]?.wickets || 0)
  )[0];

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20, color: "white", background: "#0B0F1A" }}>
      
      <h1>🏆 Tournament Dashboard</h1>

      <button onClick={() => window.location.href = "/match"}>
        ▶ Play Match
      </button>

      <h2>Your Team</h2>
      {team ? <p>{team.name}</p> : <p>No team selected</p>}

      <h2>Your Matches</h2>
      {matches.length === 0 ? (
        <p>No matches yet</p>
      ) : (
        matches.map((m, i) => (
          <div key={i}>
            {m.team1} vs {m.team2} - {m.result}
          </div>
        ))
      )}

      {/* ================= RECENT RESULTS ================= */}
      <h2 style={{ marginTop: "30px" }}>Recent Results</h2>

      {/* ✅ FIXED BUG HERE (map properly closed) */}
      {recentMatches.map((match, i) => (
        <div key={i}>
          {match.team1} vs {match.team2}
        </div>
      ))}

      {/* ================= POINTS TABLE ================= */}
      <h2>Points Table</h2>

      {sortedTeams.length === 0 ? (
        <p>No matches played yet</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Team</th>
              <th>P</th>
              <th>W</th>
              <th>L</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map(([team, t], i) => (
              <tr key={i}>
                <td>{team}</td>
                <td>{t.played}</td>
                <td>{t.won}</td>
                <td>{t.lost}</td>
                <td>{t.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ================= CAPS ================= */}
      <h2>🟠 Orange Cap</h2>
      {orangeCap ? (
        <p>{orangeCap[0]} — {orangeCap[1].runs} runs</p>
      ) : (
        <p>No data yet</p>
      )}

      <h2>🟣 Purple Cap</h2>
      {purpleCap ? (
        <p>{purpleCap[0]} — {purpleCap[1].wickets} wickets</p>
      ) : (
        <p>No data yet</p>
      )}

    </div>
  );
}
