"use client";
import { useEffect, useState } from "react";

export default function MatchSetup() {
  const API = "https://ipl-simulator-tb8n.onrender.com";

  const [team, setTeam] = useState("");
  const [squad, setSquad] = useState([]);
  const [xi, setXi] = useState([]);

  useEffect(() => {
    const t = localStorage.getItem("selectedTeam");
    setTeam(t);

    loadSquad(t);
  }, []);

  const loadSquad = async (team) => {
    const res = await fetch(`${API}/team/${team}`);
    const data = await res.json();
    setSquad(data);
  };

  const toggle = (p) => {
    const exists = xi.find(x => x.name === p.name);

    if (exists) {
      setXi(xi.filter(x => x.name !== p.name));
    } else if (xi.length < 11) {
      setXi([...xi, p]);
    }
  };

  // ✅ VALIDATION
  const validateXI = () => {
    if (xi.length !== 11) {
      alert("Select exactly 11 players");
      return false;
    }

    const overseas = xi.filter(p => p.overseas).length;

    if (overseas > 4) {
      alert("Max 4 overseas players allowed");
      return false;
    }

    return true;
  };

  const proceed = () => {
    if (!validateXI()) return;

    localStorage.setItem("playingXI", JSON.stringify(xi));
    window.location.href = "/match/toss";
  };

  return (
    <div style={{ padding: "20px", color: "white", background: "#0B0F1A" }}>
      <h1>Select Playing XI</h1>
      <h3>{xi.length}/11</h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
        {squad.map((p, i) => (
          <div
            key={i}
            onClick={() => toggle(p)}
            style={{
              padding: "10px",
              border: xi.find(x => x.name === p.name)
                ? "2px solid #00E5FF"
                : "1px solid #333",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            <div>{p.name}</div>
            <div style={{ fontSize: "12px" }}>{p.role}</div>
          </div>
        ))}
      </div>

      <button onClick={proceed} style={{ marginTop: "20px" }}>
        Continue → Toss
      </button>
    </div>
  );
}
