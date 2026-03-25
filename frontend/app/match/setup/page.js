"use client";
import { useEffect, useState } from "react";

export default function Setup() {
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
      .then(setSquad)
      .catch(() => alert("Failed to load squad"));
  }, []);

  const toggle = (p) => {
    if (xi.find(x => x.name === p.name)) {
      setXi(xi.filter(x => x.name !== p.name));
    } else if (xi.length < 11) {
      setXi([...xi, p]);
    }
  };

  const proceed = () => {
    if (xi.length !== 11) {
      alert("Select 11 players");
      return;
    }

    localStorage.setItem("playingXI", JSON.stringify(xi));
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
            {p.name}
          </div>
        ))}
      </div>

      <button onClick={proceed} style={{ marginTop: 20 }}>
        Continue
      </button>
    </div>
  );
}
