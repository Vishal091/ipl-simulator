"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const API = "https://ipl-simulator-tb8n.onrender.com";

  const [team, setTeam] = useState("");
  const [points, setPoints] = useState({});
  const [schedule, setSchedule] = useState([]);
  const [results, setResults] = useState([]);

  // ================= INIT + LOAD =================
  useEffect(() => {
    const init = async () => {
      try {
        // ✅ Initialize tournament ONLY ONCE
        if (!localStorage.getItem("tournamentInitialized")) {
          await fetch(API + "/init-tournament", { method: "POST" });
          localStorage.setItem("tournamentInitialized", "true");
        }

        const selected = localStorage.getItem("selectedTeam");

        if (!selected) {
          alert("No team selected");
          window.location.href = "/tournament";
          return;
        }

        setTeam(selected);

        await loadStatus();

      } catch (err) {
        console.error("Init error:", err);
      }
    };

    init();
  }, []);

  // ================= LOAD STATUS =================
  const loadStatus = async () => {
    try {
      const res = await fetch(API + "/tournament-status");
      const data = await res.json();

      setPoints(data.points || {});
      setSchedule(data.schedule || []);
      setResults(data.results || []);

    } catch (err) {
      console.error("Status load error", err);
    }
  };

  // ================= REDIRECT TO MATCH SETUP =================
  const playMatch = () => {
    window.location.href = "/match/setup";
  };

  // ================= SORT TABLE =================
  const sortedPoints = Object.entries(points)
    .map(([team, stats]) => ({ team, ...stats }))
    .sort((a, b) => b.points - a.points);

  // ================= USER MATCHES =================
  const userMatches = schedule.filter(
    m => m.team1 === team || m.team2 === team
  );

  return (
    <div style={{
      background: "#0B0F1A",
      color: "white",
      minHeight: "100vh",
      padding: "20px"
    }}>
      <h1>🏆 Tournament Dashboard</h1>
      <h2>Your Team: {team}</h2>

      {/* ================= PLAY BUTTON ================= */}
      <button
        onClick={playMatch}
        className="glow-btn"
        style={{
          marginTop: "20px",
          padding: "12px 20px",
          fontSize: "16px"
        }}
      >
        ▶ Play Next Match
      </button>

      {/* ================= POINTS TABLE ================= */}
      <h2 style={{ marginTop: "30px" }}>Points Table</h2>

      <table style={{
        width: "100%",
        marginTop: "10px",
        borderCollapse: "collapse"
      }}>
        <thead>
          <tr style={{ background: "#111" }}>
            <th>Team</th>
            <th>P</th>
            <th>W</th>
            <th>Pts</th>
          </tr>
        </thead>

        <tbody>
          {sortedPoints.map((t, i) => (
            <tr key={i} style={{
              textAlign: "center",
              borderBottom: "1px solid #222"
            }}>
              <td>{t.team}</td>
              <td>{t.played}</td>
              <td>{t.wins}</td>
              <td>{t.points}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= YOUR MATCHES ================= */}
      <h2 style={{ marginTop: "30px" }}>Your Matches</h2>

      {userMatches.length === 0 && (
        <p>No matches yet</p>
      )}

      {userMatches.map((m, i) => (
        <div key={i} style={{
          padding: "10px",
          marginTop: "8px",
          background: m.played ? "#1a1a1a" : "#111",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "space-between"
        }}>
          <span>{m.team1} vs {m.team2}</span>

          <span style={{
            color: m.played ? "#00E676" : "#FF5252"
          }}>
            {m.played ? "Played" : "Upcoming"}
          </span>
        </div>
      ))}

      {/* ================= RECENT RESULTS ================= */}
      <h2 style={{ marginTop: "30px" }}>Recent Results</h2>

      {results.length === 0 && (
        <p>No matches played yet</p>
      )}

      {results.slice(-5).map((r, i) => (
        <div key={i} style={{
          padding: "10px",
          marginTop: "8px",
          background: "#111",
          borderRadius: "8px"
        }}>
          <div>{r.team1} vs {r.team2}</div>

          <div style={{
            fontSize: "12px",
            opacity: 0.7
          }}>
            {r.result
              ? `${r.result.innings1} vs ${r.result.innings2}`
              : `Winner: ${r.winner}`}
          </div>
        </div>
      ))}
    </div>
  );
}
