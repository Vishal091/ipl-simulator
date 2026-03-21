"use client";
import { useEffect, useState } from "react";

export default function Tournament() {
  const API = "https://ipl-simulator-tb8n.onrender.com";

  const [teams, setTeams] = useState([]);
  const [team, setTeam] = useState("");
  const [squad, setSquad] = useState([]);
  const [xi, setXi] = useState([]);

  // 🔥 AUTO LOAD TEAMS
  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const res = await fetch(API + "/teams");
      const data = await res.json();
      setTeams(data);
    } catch (err) {
      console.error("Error loading teams", err);
    }
  };

  const loadSquad = async () => {
    if (!team) return;

    const res = await fetch(`${API}/team/${team}`);
    const data = await res.json();

    setSquad(data);
    setXi([]);
  };

  const toggle = (p) => {
    const exists = xi.find(x => x.name === p.name);

    if (exists) {
      setXi(xi.filter(x => x.name !== p.name));
    } else if (xi.length < 11) {
      setXi([...xi, p]);
    }
  };

  // 🔥 PLAY MATCH (CONNECTED)
  const playMatch = async () => {
    if (xi.length !== 11) {
      alert("Select 11 players");
      return;
    }

    const res = await fetch(API + "/tournament-match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xi })
    });

    const data = await res.json();

    localStorage.setItem("matchData", JSON.stringify(data));
    window.location.href = "/match";
  };

  return (
    <div style={{
      background: "#0B0F1A",
      color: "white",
      minHeight: "100vh",
      padding: "20px"
    }}>
      <h1>🏆 Tournament Mode</h1>

      {/* TEAM SELECT */}
      <select onChange={(e) => setTeam(e.target.value)}>
        <option value="">Select Team</option>
        {teams.map(t => (
          <option key={t}>{t}</option>
        ))}
      </select>

      <button className="glow-btn" onClick={loadSquad} style={{ marginLeft: "10px" }}>
        Load Squad
      </button>

      {/* SQUAD */}
      <h3 style={{ marginTop: "20px" }}>Squad</h3>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: "10px"
      }}>
        {squad.map((p, i) => (
          <div
            key={i}
            onClick={() => toggle(p)}
            className="card"
            style={{
              border: xi.find(x => x.name === p.name)
                ? "2px solid #00E5FF"
                : "1px solid rgba(255,255,255,0.1)"
            }}
          >
            <h4>{p.name}</h4>
            <p>{p.role}</p>
          </div>
        ))}
      </div>

      {/* XI */}
      <h3 style={{ marginTop: "20px" }}>
        Playing XI: {xi.length}/11
      </h3>

      <button
        className="glow-btn"
        onClick={playMatch}
        style={{ marginTop: "20px" }}
      >
        ▶ Play Match
      </button>
    </div>
  );
}
