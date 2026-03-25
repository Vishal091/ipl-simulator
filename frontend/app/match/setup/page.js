"use client";
import { useEffect, useState } from "react";

export default function MatchSetup() {
  const API = "https://ipl-simulator-tb8n.onrender.com";

  const [team, setTeam] = useState("");
  const [squad, setSquad] = useState([]);
  const [xi, setXi] = useState([]);

  useEffect(() => {
    const t = localStorage.getItem("selectedTeam");

    if (!t) {
      alert("No team selected");
      window.location.href = "/tournament";
      return;
    }

    setTeam(t);

    fetch(`${API}/team/${t}`)
      .then(res => res.json())
      .then(setSquad);
  }, []);

  const toggle = (p) => {
    if (xi.find(x => x.name === p.name)) {
      setXi(xi.filter(x => x.name !== p.name));
    } else if (xi.length < 11) {
      setXi([...xi, p]);
    }
  };

  const proceed = async () => {
    if (xi.length !== 11) {
      alert("Select 11 players");
      return;
    }

    // 🔥 get opponent
    const teamsRes = await fetch(API + "/teams");
    const teams = await teamsRes.json();

    const myTeam = localStorage.getItem("selectedTeam");

    const opponent = teams.find(t => t !== myTeam);

    const oppRes = await fetch(`${API}/team/${opponent}`);
    const oppSquad = await oppRes.json();

    const oppXI = oppSquad.sort((a, b) => b.agg - a.agg).slice(0, 11);

    localStorage.setItem("matchData", JSON.stringify({
      myXI: xi,
      oppXI: oppXI,
      myTeam,
      oppTeam: opponent
    }));

    window.location.href = "/match/toss";
  };

  return (
    <div style={{ padding: 20, color: "white", background: "#0B0F1A" }}>
      <h1>Select Playing XI ({xi.length}/11)</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        {squad.map((p, i) => (
          <div
            key={i}
            onClick={() => toggle(p)}
            style={{
              padding: 10,
              border: xi.find(x => x.name === p.name)
                ? "2px solid cyan"
                : "1px solid #333",
              cursor: "pointer"
            }}
          >
            <div>{p.name}</div>
            <div style={{ fontSize: "12px" }}>{p.role}</div>
          </div>
        ))}
      </div>

      <button onClick={proceed} style={{ marginTop: 20 }}>
        Continue → Toss
      </button>
    </div>
  );
}
