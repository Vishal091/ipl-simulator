import { useState } from "react";

export default function Home() {
  const API = "https://ipl-simulator-tb8n.onrender.com";

  const [teams, setTeams] = useState([]);
  const [team, setTeam] = useState("");
  const [squad, setSquad] = useState([]);
  const [xi, setXi] = useState([]);
  const [result, setResult] = useState(null);

  const loadTeams = async () => {
    const res = await fetch(API + "/teams");
    setTeams(await res.json());
  };

  const loadSquad = async () => {
    const res = await fetch(`${API}/team/${team}`);
    setSquad(await res.json());
  };

  const toggle = (p) => {
    if (xi.includes(p)) {
      setXi(xi.filter(x => x !== p));
    } else if (xi.length < 11) {
      setXi([...xi, p]);
    }
  };

  const play = async () => {
    const res = await fetch(API + "/play", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ xi })
    });

    setResult(await res.json());
  };

  return (
    <div style={{padding:20}}>
      <h1>🏏 IPL Tournament</h1>

      <button onClick={loadTeams}>Load Teams</button>

      <select onChange={(e)=>setTeam(e.target.value)}>
        <option>Select Team</option>
        {teams.map(t=><option key={t}>{t}</option>)}
      </select>

      <button onClick={loadSquad}>Load Squad</button>

      <h3>Squad</h3>
      {squad.map((p,i)=>(
        <p key={i} onClick={()=>toggle(p)}>
          {p.name} ({p.role})
        </p>
      ))}

      <h3>Playing XI ({xi.length}/11)</h3>

      <button onClick={play}>Play Match</button>

      {result && (
        <div>
          <h2>{result.score}</h2>
          {result.log.map((l,i)=><p key={i}>{l}</p>)}
        </div>
      )}
    </div>
  );
}
