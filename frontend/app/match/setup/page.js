"use client";
import { useEffect, useState } from "react";

export default function MatchSetup() {
  const API = "https://ipl-simulator-tb8n.onrender.com";

  const [team, setTeam] = useState("");
  const [squad, setSquad] = useState([]);
  const [xi, setXi] = useState([]);

  const [captain, setCaptain] = useState(null);
  const [keeper, setKeeper] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem("selectedTeam");

    if (!t) {
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
    if (xi.length !== 11) return alert("Select 11 players");
    if (!captain) return alert("Select captain");
    if (!keeper) return alert("Select keeper");

    const teamsRes = await fetch(API + "/teams");
    const teams = await teamsRes.json();

    const myTeam = localStorage.getItem("selectedTeam");
    const opponent = teams.find(t => t !== myTeam);

    const oppRes = await fetch(`${API}/team/${opponent}`);
    const oppXI = (await oppRes.json()).slice(0, 11);

    localStorage.setItem("matchData", JSON.stringify({
      myXI: xi,
      oppXI,
      captain,
      keeper,
      myTeam,
      oppTeam: opponent
    }));

    window.location.href = "/match/toss";
  };

  return (
    <div style={{
      padding: "20px",
      color: "white",
      background: "#0B0F1A",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column"
    }}>
      
      {/* SCROLLABLE CONTENT */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: "100px" }}>
        
        <h1>Select XI ({xi.length}/11)</h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {squad.map((p, i) => (
            <div
              key={i}
              onClick={() => toggle(p)}
              style={{
                padding: 10,
                border: xi.find(x => x.name === p.name)
                  ? "2px solid cyan"
                  : "1px solid #333"
              }}
            >
              {p.name}
            </div>
          ))}
        </div>

        <h3>Select Captain</h3>
        {xi.map((p, i) => (
          <button key={i} onClick={() => setCaptain(p.name)}>
            {p.name}
          </button>
        ))}

        <h3>Select Wicketkeeper</h3>
        {xi.map((p, i) => (
          <button key={i} onClick={() => setKeeper(p.name)}>
            {p.name}
          </button>
        ))}

      </div>

      {/* 🔥 STICKY BUTTON */}
      <div style={{
        position: "sticky",
        bottom: 0,
        background: "#0B0F1A",
        padding: "15px",
        borderTop: "1px solid #222"
      }}>
        <button
          onClick={proceed}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px"
          }}
        >
          Continue → Toss
        </button>
      </div>

    </div>
  );
}
