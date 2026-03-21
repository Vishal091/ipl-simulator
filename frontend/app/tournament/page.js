"use client";
import { useState } from "react";

export default function Tournament() {
  const API = "https://ipl-simulator-tb8n.onrender.com";

  const [teams, setTeams] = useState([]);
  const [team, setTeam] = useState("");
  const [squad, setSquad] = useState([]);
  const [xi, setXi] = useState([]);

  const loadTeams = async () => {
    const res = await fetch(API + "/teams");
    setTeams(await res.json());
  };

  const loadSquad = async () => {
    const res = await fetch(`${API}/team/${team}`);
    setSquad(await res.json());
  };
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

  // 🔥 NEW FLOW
  localStorage.setItem("matchData", JSON.stringify(data));
  window.location.href = "/match";
};
  const toggle = (p) => {
    const exists = xi.find(x => x.name === p.name);
    if (exists) {
      setXi(xi.filter(x => x.name !== p.name));
    } else if (xi.length < 11) {
      setXi([...xi, p]);
    }
  };

  return (
    <div style={page}>
      <h1>🏆 Tournament Mode</h1>

      <button onClick={loadTeams}>Load Teams</button>

      <select onChange={(e) => setTeam(e.target.value)}>
        <option>Select Team</option>
        {teams.map(t => <option key={t}>{t}</option>)}
      </select>

      <button onClick={loadSquad}>Load Squad</button>

      <div style={grid}>
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

      <h3>Playing XI: {xi.length}/11</h3>
    </div>
  );
}

const page = {
  background: "#0B0F1A",
  color: "white",
  minHeight: "100vh",
  padding: "20px"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
  gap: "10px"
};

const card = {
  padding: "10px",
  borderRadius: "10px",
  background: "#111827",
  cursor: "pointer"
};
