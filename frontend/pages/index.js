import { useState } from "react";

export default function Home() {
  const [match, setMatch] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [career, setCareer] = useState(null);
  const [name, setName] = useState("");

  const API = "https://ipl-simulator-tb8n.onrender.com";

  const simulateMatch = async () => {
    const res = await fetch(API + "/simulate", { method: "POST" });
    setMatch(await res.json());
    setTournament(null);
    setCareer(null);
  };

  const runTournament = async () => {
    const res = await fetch(API + "/tournament");
    setTournament(await res.json());
    setMatch(null);
    setCareer(null);
  };

  const createPlayer = async () => {
    await fetch(`${API}/create-player?name=${name}&team=RCB`, {
      method: "POST"
    });
    alert("Player created!");
  };

  const playCareer = async () => {
    const res = await fetch(API + "/career-match");
    setCareer(await res.json());
    setMatch(null);
    setTournament(null);
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>🏏 IPL Simulator</h1>

      <button onClick={simulateMatch}>Match Mode</button>
      <button onClick={runTournament}>Tournament</button>
      <button onClick={playCareer}>Career Mode</button>

      {/* MATCH */}
      {match && (
        <div>
          <h2>{match.team1} vs {match.team2}</h2>
          <p>{match.score1}</p>
          <p>{match.score2}</p>
          <h3>Winner: {match.winner}</h3>
          {match.commentary.map((c, i) => <p key={i}>{c}</p>)}
        </div>
      )}

      {/* TOURNAMENT */}
      {tournament && (
        <div>
          <h2>Points Table</h2>
          {tournament.points_table.map(([t, s], i) => (
            <p key={i}>{t} - {s.pts}</p>
          ))}

          <h2>Champion: {tournament.playoffs.champion}</h2>
        </div>
      )}

      {/* CAREER */}
      <div>
        <h2>Career Mode</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <button onClick={createPlayer}>Create Player</button>
      </div>

      {career && (
        <div>
          <p>{career.team}: {career.score}</p>
          <p>{career.opponent}: {career.opponent_score}</p>
          <h3>You scored: {career.player_runs}</h3>
          <h2>{career.result}</h2>
          <p>{career.question}</p>
        </div>
      )}
    </div>
  );
}
