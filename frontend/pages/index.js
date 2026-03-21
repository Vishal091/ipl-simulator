"use client";
import { useState } from "react";

export default function Home() {
  const API = "https://ipl-simulator-tb8n.onrender.com";

  const [teams, setTeams] = useState([]);
  const [team, setTeam] = useState("");
  const [squad, setSquad] = useState([]);
  const [xi, setXi] = useState([]);
  const [result, setResult] = useState(null);

  // ================= LOAD =================
  const loadTeams = async () => {
    const res = await fetch(API + "/teams");
    setTeams(await res.json());
  };

  const loadSquad = async () => {
    const res = await fetch(`${API}/team/${team}`);
    setSquad(await res.json());
    setXi([]);
  };

  // ================= XI =================
  const toggle = (player) => {
    const exists = xi.find(p => p.name === player.name);

    if (exists) {
      setXi(xi.filter(p => p.name !== player.name));
    } else if (xi.length < 11) {
      setXi([...xi, player]);
    }
  };

  // ================= PLAY =================
  const playMatch = async () => {
    if (xi.length !== 11) {
      alert("Select 11 players");
      return;
    }

    const res = await fetch(API + "/tournament-match", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ xi })
    });

    setResult(await res.json());
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🏏 IPL Simulator</h1>

      <button onClick={loadTeams}>Load Teams</button>

      <br /><br />

      <select onChange={(e) => setTeam(e.target.value)}>
        <option>Select Team</option>
        {teams.map(t => <option key={t}>{t}</option>)}
      </select>

      <button onClick={loadSquad}>Load Squad</button>

      <h3>Squad</h3>

      {squad.map((p, i) => (
        <p
          key={i}
          onClick={() => toggle(p)}
          style={{
            cursor: "pointer",
            color: xi.find(x => x.name === p.name) ? "green" : "black"
          }}
        >
          {p.name} ({p.role})
        </p>
      ))}

      <h3>Playing XI ({xi.length}/11)</h3>

      <button onClick={playMatch}>Play Match</button>

      {result && (
        <div>
          <h2>{result.score}</h2>
          {result.log?.map((l, i) => <p key={i}>{l}</p>)}
        </div>
      )}
    </div>
  );
}
