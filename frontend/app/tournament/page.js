"use client";
import { useEffect, useState } from "react";

export default function Tournament() {
  const API = "https://ipl-simulator-tb8n.onrender.com";

  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [squad, setSquad] = useState([]);
  const [xi, setXi] = useState([]);
const TEAM_CONFIG = {
  "Chennai Super Kings": {
    short: "CSK",
    color: "#FDB913",
    logo: "https://upload.wikimedia.org/wikipedia/en/2/2e/Chennai_Super_Kings_Logo.svg"
  },
  "Mumbai Indians": {
    short: "MI",
    color: "#004BA0",
    logo: "https://upload.wikimedia.org/wikipedia/en/c/cd/Mumbai_Indians_Logo.svg"
  },
  "Royal Challengers Bengaluru": {
    short: "RCB",
    color: "#DA1818",
    logo: "https://upload.wikimedia.org/wikipedia/en/4/4e/Royal_Challengers_Bangalore_Logo.svg"
  },
  "Kolkata Knight Riders": {
    short: "KKR",
    color: "#3A225D",
    logo: "https://upload.wikimedia.org/wikipedia/en/4/4c/Kolkata_Knight_Riders_Logo.svg"
  },
  "Delhi Capitals": {
    short: "DC",
    color: "#17479E",
    logo: "https://upload.wikimedia.org/wikipedia/en/2/2f/Delhi_Capitals.svg"
  },
  "Punjab Kings": {
    short: "PBKS",
    color: "#ED1B24",
    logo: "https://upload.wikimedia.org/wikipedia/en/d/d4/Punjab_Kings_Logo.svg"
  },
  "Rajasthan Royals": {
    short: "RR",
    color: "#EA1A85",
    logo: "https://upload.wikimedia.org/wikipedia/en/6/60/Rajasthan_Royals_Logo.svg"
  },
  "Sunrisers Hyderabad": {
    short: "SRH",
    color: "#FF822A",
    logo: "https://upload.wikimedia.org/wikipedia/en/8/81/Sunrisers_Hyderabad.svg"
  },
  "Lucknow Super Giants": {
    short: "LSG",
    color: "#00AEEF",
    logo: "https://upload.wikimedia.org/wikipedia/en/2/2e/Lucknow_Super_Giants_IPL_Logo.svg"
  },
  "Gujarat Titans": {
    short: "GT",
    color: "#1C1C1C",
    logo: "https://upload.wikimedia.org/wikipedia/en/0/09/Gujarat_Titans_Logo.svg"
  }
};
  // ================= LOAD TEAMS =================
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

  // ================= LOAD SQUAD =================
  const loadSquad = async (teamName) => {
    setSelectedTeam(teamName);

    try {
      const res = await fetch(`${API}/team/${teamName}`);
      const data = await res.json();
      setSquad(data);
      setXi([]);
    } catch (err) {
      console.error("Error loading squad", err);
    }
  };

  // ================= SELECT XI =================
  const toggle = (p) => {
    const exists = xi.find(x => x.name === p.name);

    if (exists) {
      setXi(xi.filter(x => x.name !== p.name));
    } else if (xi.length < 11) {
      setXi([...xi, p]);
    }
  };

  // ================= PLAY MATCH =================
  const playMatch = async () => {
    if (xi.length !== 11) {
      alert(`Select 11 players (current: ${xi.length})`);
      return;
    }

    const res = await fetch(API + "/tournament-match", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ xi }),
    });

    const data = await res.json();

    localStorage.setItem("matchData", JSON.stringify(data));
    window.location.href = "/match";
  };

  return (
    <div
      style={{
        background: "#0B0F1A",
        color: "white",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h1>🏆 Tournament Mode</h1>

      {/* ================= TEAM SELECTION ================= */}
      {!selectedTeam && (
        <>
          <h2>Select Your Team</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "15px",
              marginTop: "20px",
            }}
          >
            {teams.map((team, i) => (
              <div
                key={i}
                className="card"
                onClick={() => loadSquad(team)}
                style={{
                  cursor: "pointer",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                <h3>{team}</h3>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ================= SQUAD ================= */}
      {selectedTeam && (
        <>
          <h2 style={{ marginTop: "20px" }}>
            {selectedTeam} Squad
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "10px",
              marginTop: "15px",
            }}
          >
            {squad.map((p, i) => (
              <div
                key={i}
                className="card"
                onClick={() => toggle(p)}
                style={{
                  border: xi.find((x) => x.name === p.name)
                    ? "2px solid #00E5FF"
                    : "1px solid rgba(255,255,255,0.1)",
                  cursor: "pointer",
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
        </>
      )}
    </div>
  );
}
