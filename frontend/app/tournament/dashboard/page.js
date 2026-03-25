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
        // init tournament only once
        if (!localStorage.getItem("tournamentInitialized")) {
          await fetch(API + "/init-tournament", { method: "POST" });
          localStorage.setItem("tournamentInitialized", "true");
        }

        const selected = localStorage.getItem("selectedTeam");
        setTeam(selected);

        loadStatus();
      } catch (err) {
        console.error(err);
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

  // ================= PLAY MATCH =================
  const playMatch = async () => {
    try {
      const squadRes = await fetch(`${API}/team/${team}`);
      const squad = await squadRes.json();

      const xi = squad.sort((a, b) => b.agg - a.agg).slice(0, 11);

      const res = await fetch(API + "/tournament-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          team: team,
          xi: xi
        })
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      localStorage.setItem("matchData", JSON.stringify(data.match));

      // reload updated table
      await loadStatus();

      // redirect
      window.location.href = "/match";

    } catch (err) {
      console.error(err);
      alert("Match failed");
    }
  };

  // ================= SORT POINTS =================
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

      {/* ================= PLAY NEXT MATCH ================= */}
      <button
        onClick={playMatch}
        className="glow-btn"
        style={{ marginTop: "20px" }}
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

      {results.slice(-5).map((r, i) => (
        <div key={i} style={{
          padding: "10px",
          marginTop: "8px",
          background: "#111",
          borderRadius: "8px"
        }}>
          <div>{r.team1} vs {r.team2}</div>
          <div style={{ fontSize: "12px", opacity: 0.7 }}>
            {r.winner ? `Winner: ${r.winner}` : "Match Played"}
          </div>
        </div>
      ))}
    </div>
  );
}
