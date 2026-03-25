"use client";
import { useEffect, useState } from "react";

// ================= TEAM NAME MAP =================
const TEAM_NAME_MAP = {
  "CSK": "Chennai Super Kings",
  "MI": "Mumbai Indians",
  "RCB": "Royal Challengers Bengaluru",
  "KKR": "Kolkata Knight Riders",
  "DC": "Delhi Capitals",
  "PBKS": "Punjab Kings",
  "RR": "Rajasthan Royals",
  "SRH": "Sunrisers Hyderabad",
  "LSG": "Lucknow Super Giants",
  "GT": "Gujarat Titans"
};

// ================= TEAM CONFIG =================
const TEAM_CONFIG = {
  "Chennai Super Kings": { short: "CSK", color: "#FDB913", logo: "/teams/csk.png" },
  "Mumbai Indians": { short: "MI", color: "#004BA0", logo: "/teams/mi.png" },
  "Royal Challengers Bengaluru": { short: "RCB", color: "#DA1818", logo: "/teams/rcb.png" },
  "Kolkata Knight Riders": { short: "KKR", color: "#3A225D", logo: "/teams/kkr.png" },
  "Delhi Capitals": { short: "DC", color: "#17479E", logo: "/teams/dc.png" },
  "Punjab Kings": { short: "PBKS", color: "#ED1B24", logo: "/teams/pbks.png" },
  "Rajasthan Royals": { short: "RR", color: "#EA1A85", logo: "/teams/rr.png" },
  "Sunrisers Hyderabad": { short: "SRH", color: "#FF822A", logo: "/teams/srh.png" },
  "Lucknow Super Giants": { short: "LSG", color: "#00AEEF", logo: "/teams/lsg.png" },
  "Gujarat Titans": { short: "GT", color: "#1C1C1C", logo: "/teams/gt.png" }
};

export default function Tournament() {
  const API = "https://ipl-simulator-tb8n.onrender.com";

  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [squad, setSquad] = useState([]);
  const [xi, setXi] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= LOAD TEAMS =================
  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const res = await fetch(API + "/teams");
      const data = await res.json();

      if (Array.isArray(data)) setTeams(data);
      else if (data.teams) setTeams(data.teams);
      else setTeams([]);

    } catch (err) {
      console.error("Error loading teams", err);
    }
  };

  // ================= LOAD SQUAD =================
  const loadSquad = async (teamCode) => {
    setSelectedTeam(teamCode);

    try {
      const res = await fetch(`${API}/team/${teamCode}`);
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

  // ================= AUTO XI =================
  const autoSelectXI = () => {
    let sorted = [...squad].sort((a, b) => b.agg - a.agg);

    let selected = [];
    let roles = { BAT: 0, BOWL: 0, AR: 0, WK: 0 };

    for (let p of sorted) {
      if (selected.length >= 11) break;

      if (p.role === "WK" && roles.WK < 1) {
        selected.push(p); roles.WK++;
      } else if (p.role === "BAT" && roles.BAT < 4) {
        selected.push(p); roles.BAT++;
      } else if (p.role === "BOWL" && roles.BOWL < 4) {
        selected.push(p); roles.BOWL++;
      } else if (p.role === "AR" && roles.AR < 3) {
        selected.push(p); roles.AR++;
      }
    }

    // fill remaining
    for (let p of sorted) {
      if (selected.length >= 11) break;
      if (!selected.find(x => x.name === p.name)) {
        selected.push(p);
      }
    }

    setXi(selected);
  };

  // ================= TEAM STRENGTH =================
  const teamStrength = xi.length
    ? Math.round(xi.reduce((sum, p) => sum + p.agg, 0) / xi.length)
    : 0;

  // ================= PLAY MATCH =================
  const playMatch = async () => {
    if (xi.length !== 11) {
      alert(`Select 11 players (current: ${xi.length})`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(API + "/tournament-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xi })
      });

      const data = await res.json();

      if (data.error) {
        alert("Error: " + data.error);
        setLoading(false);
        return;
      }

      localStorage.setItem("matchData", JSON.stringify(data));
      window.location.href = "/match";

    } catch (err) {
      console.error("Match error:", err);
      alert("Failed to start match");
    }

    setLoading(false);
  };

  return (
    <div style={{
      background: "#0B0F1A",
      color: "white",
      minHeight: "100vh",
      padding: "20px"
    }}>
      <h1>🏆 Tournament Mode</h1>

      {/* ================= TEAM CARDS ================= */}
      {!selectedTeam && (
        <>
          <h2>Select Your Team</h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "20px",
            marginTop: "20px"
          }}>
            {teams.map((team, i) => {
              const fullName = TEAM_NAME_MAP[team] || team;
              const config = TEAM_CONFIG[fullName] || {};

              return (
                <div
                  key={i}
                  onClick={() => loadSquad(team)}
                  style={{
                    cursor: "pointer",
                    borderRadius: "16px",
                    padding: "20px",
                    textAlign: "center",
                    background: `linear-gradient(135deg, ${config.color || "#111"}, #000)`,
                    transition: "0.3s",
                    boxShadow: "0 0 10px rgba(0,0,0,0.5)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = `0 0 25px ${config.color}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
                  }}
                >
                  <img
                    src={config.logo}
                    alt={team}
                    style={{ width: "70px", height: "70px", objectFit: "contain", marginBottom: "10px" }}
                  />

                  <h3>{team}</h3>
                  <p style={{ fontSize: "12px", opacity: 0.7 }}>{fullName}</p>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ================= SQUAD ================= */}
      {selectedTeam && (
        <>
          <h2 style={{ marginTop: "20px" }}>
            {TEAM_NAME_MAP[selectedTeam] || selectedTeam} Squad
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "12px",
            marginTop: "15px"
          }}>
            {squad.map((p, i) => (
              <div
                key={i}
                onClick={() => toggle(p)}
                style={{
                  cursor: "pointer",
                  borderRadius: "14px",
                  padding: "12px",
                  background: "linear-gradient(145deg, #111, #1a1a1a)",
                  border: xi.find(x => x.name === p.name)
                    ? "2px solid #00E5FF"
                    : "1px solid rgba(255,255,255,0.1)",
                  transition: "0.3s",
                  position: "relative"
                }}
              >
                <div style={{
                  position: "absolute",
                  top: "8px",
                  right: "10px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#00E5FF"
                }}>
                  {p.agg}
                </div>

                <h4 style={{ marginTop: "20px" }}>{p.name}</h4>

                <div style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: "8px",
                  fontSize: "10px",
                  background: "#222",
                  marginTop: "4px"
                }}>
                  {p.role}
                </div>

                <div style={{
                  marginTop: "10px",
                  fontSize: "12px",
                  opacity: 0.8
                }}>
                  <div>Bat: {p.bat}</div>
                  <div>Bowl: {p.bowl}</div>
                </div>
              </div>
            ))}
          </div>

          {/* XI + AUTO */}
          <h3 style={{ marginTop: "20px" }}>
            Playing XI: {xi.length}/11
          </h3>

          <button className="glow-btn" onClick={autoSelectXI} style={{ marginTop: "10px" }}>
            ⚡ Auto Select Best XI
          </button>

          {/* TEAM STRENGTH */}
          <div style={{ marginTop: "15px" }}>
            <p>Team Strength: {teamStrength}</p>

            <div style={{
              height: "10px",
              background: "#222",
              borderRadius: "5px",
              overflow: "hidden"
            }}>
              <div style={{
                width: `${teamStrength}%`,
                height: "100%",
                background: "#00E5FF"
              }} />
            </div>
          </div>

          {/* PLAY */}
          <button
            className="glow-btn"
            onClick={playMatch}
            style={{ marginTop: "20px", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Starting Match..." : "▶ Play Match"}
          </button>
        </>
      )}
    </div>
  );
}
