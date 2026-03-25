"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const API = "https://ipl-simulator-tb8n.onrender.com";

  const [team, setTeam] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [points, setPoints] = useState([]);
  const [orangeCap, setOrangeCap] = useState(null);
  const [purpleCap, setPurpleCap] = useState(null);

  useEffect(() => {
    const selected = localStorage.getItem("selectedTeam");
    setTeam(selected);

    generateMockData(); // temp (we upgrade backend later)
  }, []);

  // ================= MOCK DATA (TEMP) =================
  const generateMockData = () => {
    const teams = ["CSK","MI","RCB","KKR","DC","PBKS","RR","SRH","LSG","GT"];

    // schedule
    let sched = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        sched.push({
          team1: teams[i],
          team2: teams[j],
          played: false
        });
      }
    }

    // points
    let pts = teams.map(t => ({
      team: t,
      played: 0,
      wins: 0,
      points: 0
    }));

    // caps
    setOrangeCap({ name: "Virat Kohli", runs: 450 });
    setPurpleCap({ name: "Bumrah", wickets: 18 });

    setSchedule(sched.slice(0, 10)); // show first 10 matches
    setPoints(pts);
  };

  return (
    <div style={{
      background: "#0B0F1A",
      color: "white",
      minHeight: "100vh",
      padding: "20px"
    }}>
      <h1>🏆 Tournament Dashboard</h1>
      <h2>Your Team: {team}</h2>

      {/* ================= CAPS ================= */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>

        <div style={{
          padding: "15px",
          background: "#222",
          borderRadius: "10px"
        }}>
          <h3>🟠 Orange Cap</h3>
          <p>{orangeCap?.name}</p>
          <p>{orangeCap?.runs} runs</p>
        </div>

        <div style={{
          padding: "15px",
          background: "#222",
          borderRadius: "10px"
        }}>
          <h3>🟣 Purple Cap</h3>
          <p>{purpleCap?.name}</p>
          <p>{purpleCap?.wickets} wickets</p>
        </div>

      </div>

      {/* ================= POINTS TABLE ================= */}
      <h2 style={{ marginTop: "30px" }}>Points Table</h2>

      <table style={{ width: "100%", marginTop: "10px" }}>
        <thead>
          <tr>
            <th>Team</th>
            <th>P</th>
            <th>W</th>
            <th>Pts</th>
          </tr>
        </thead>

        <tbody>
          {points.map((t, i) => (
            <tr key={i}>
              <td>{t.team}</td>
              <td>{t.played}</td>
              <td>{t.wins}</td>
              <td>{t.points}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= SCHEDULE ================= */}
      <h2 style={{ marginTop: "30px" }}>Schedule</h2>

      {schedule.map((m, i) => (
        <div key={i} style={{
          padding: "10px",
          marginTop: "8px",
          background: "#111",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "space-between"
        }}>
          <span>{m.team1} vs {m.team2}</span>

          <button
            onClick={async () => {
  try {
    const team = localStorage.getItem("selectedTeam");

    if (!team) {
      alert("No team selected");
      return;
    }

    // 🔥 get your squad first
    const squadRes = await fetch(`${API}/team/${team}`);
    const squad = await squadRes.json();

    // pick best XI (simple auto for now)
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

    // store match
    localStorage.setItem("matchData", JSON.stringify(data.match));

    // redirect
    window.location.href = "/match";

  } catch (err) {
    console.error(err);
    alert("Match failed");
  }
}}
          >
            ▶ Play
          </button>
        </div>
      ))}
    </div>
  );
}
