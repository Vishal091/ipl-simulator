"use client";
import { useState } from "react";

export default function Home() {
  const API = "https://ipl-simulator-tb8n.onrender.com";

  // ================= STATES =================
  const [teams, setTeams] = useState([]);
  const [team, setTeam] = useState("");
  const [squad, setSquad] = useState([]);
  const [xi, setXi] = useState([]);
  const [result, setResult] = useState(null);
  const [liveLog, setLiveLog] = useState([]);
  const [ballIndex, setBallIndex] = useState(0);
  const [liveScore, setLiveScore] = useState("0/0");

  // Career
  const [playerName, setPlayerName] = useState("");
  const [career, setCareer] = useState(null);

  // ================= LOAD =================
  const loadTeams = async () => {
    const res = await fetch(API + "/teams");
    setTeams(await res.json());
  };

  const loadSquad = async () => {
    const res = await fetch(`${API}/team/${team}`);
    setSquad(await res.json());
    setXi([]);
    setResult(null);
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

  // ================= TOURNAMENT =================
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

  setResult(data);

  // 🔥 LIVE MODE INIT
  setLiveLog(data.log || []);
  setBallIndex(0);
};
const nextBall = () => {
  if (ballIndex >= liveLog.length) return;

  setBallIndex(ballIndex + 1);
};
const autoPlay = () => {
  let i = 0;

  const interval = setInterval(() => {
    i++;
    setBallIndex(i);

    if (i >= liveLog.length) {
      clearInterval(interval);
    }
  }, 800);
};
{liveLog.length > 0 && (
  <div>
    <h3>🎙 Live Commentary</h3>

    <button onClick={nextBall}>Next Ball</button>
    <button onClick={autoPlay}>Auto Play</button>

    {liveLog.slice(0, ballIndex).map((l, i) => (
      <p key={i}>{l}</p>
    ))}
  </div>
)}

  // ================= QUICK MATCH =================
  const quickMatch = async () => {
    const res = await fetch(API + "/quick-match", { method: "POST" });
    setResult(await res.json());
  };

  // ================= CAREER =================
  const createPlayer = async () => {
    const res = await fetch(API + "/create-player", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: playerName })
    });

    setCareer(await res.json());
  };

  const playCareer = async () => {
    const res = await fetch(API + "/career-match");
    const data = await res.json();
    setCareer(data.career);
  };

  const press = async (choice) => {
    const res = await fetch(API + "/press", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ choice })
    });

    setCareer(await res.json());
  };

  // ================= UI =================
  return (
    <div style={{ padding: 20 }}>
      <h1>🏏 IPL Simulator</h1>

      {/* ================= QUICK MATCH ================= */}
      <h2>⚡ Quick Match</h2>
      <button onClick={quickMatch}>Play Quick Match</button>

      {/* ================= TOURNAMENT ================= */}
      <h2>🏆 Tournament Mode</h2>

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

      {/* ================= CAREER ================= */}
      <h2>🎯 Career Mode</h2>

      <input
        placeholder="Enter player name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />

      <button onClick={createPlayer}>Create Player</button>
      <button onClick={playCareer}>Play Match</button>
      <button onClick={() => press("confident")}>Confident</button>
      <button onClick={() => press("aggressive")}>Aggressive</button>

      {career && (
        <div>
          <p>Name: {career.name}</p>
          <p>Runs: {career.runs}</p>
          <p>Matches: {career.matches}</p>
          <p>Form: {career.form}</p>
        </div>
      )}

      {/* ================= RESULT ================= */}
      {result && (
        <div>
          <h2>1st Innings: {result.innings1}</h2>
          <h2>Target: {result.target}</h2>
          <h2>2nd Innings: {result.innings2}</h2>
          <h2>Winner: {result.winner}</h2>

          <h3>Match Highlights</h3>
          {result.log?.map((l, i) => <p key={i}>{l}</p>)}

          {/* 🔥 SCORECARD */}
          {result.batting2 && (
            <div>
              <h3>Batting Scorecard</h3>
              {Object.entries(result.batting2).map(([name, stats]) => (
                <p key={name}>
                  {name}: {stats.runs} ({stats.balls}) | SR: {stats.balls > 0 ? ((stats.runs / stats.balls) * 100).toFixed(1) : 0}
                </p>
              ))}
            </div>
          )}

          {result.bowling1 && (
            <div>
              <h3>Bowling Figures</h3>
              {Object.entries(result.bowling1).map(([name, stats]) => (
                <p key={name}>
                  {name}: {stats.wickets}/{stats.runs} in {(stats.balls / 6).toFixed(1)} overs
                </p>
              ))}
            </div>
          )}

          {result.error && (
            <p style={{ color: "red" }}>{result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
