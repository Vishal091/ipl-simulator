useEffect(() => {
  const storedTable = JSON.parse(localStorage.getItem("pointsTable")) || {};
  const storedStats = JSON.parse(localStorage.getItem("playerStats")) || {};

  console.log("TABLE:", storedTable);
  console.log("STATS:", storedStats);

  setTable(storedTable);
  setStats(storedStats);
}, []);

  // ================= INIT + LOAD =================
  useEffect(() => {
    const init = async () => {
      try {
        // ✅ Initialize tournament ONLY ONCE
        if (!localStorage.getItem("tournamentInitialized")) {
          await fetch(API + "/init-tournament", { method: "POST" });
          localStorage.setItem("tournamentInitialized", "true");
        }

        const selected = localStorage.getItem("selectedTeam");

        if (!selected) {
          alert("No team selected");
          window.location.href = "/tournament";
          return;
        }

        setTeam(selected);

        await loadStatus();

      } catch (err) {
        console.error("Init error:", err);
      }
    };

    init();
  }, []);

  // ================= LOAD STATUS =================
  const loadStatus = async () => {
    try {
      const res = await fetch(API + "/tournament-status");
      const data = await res.json();

      setPoints(data.points || {});
      setSchedule(data.schedule || []);
      setResults(data.results || []);

    } catch (err) {
      console.error("Status load error", err);
    }
  };

  // ================= REDIRECT TO MATCH SETUP =================
  const playMatch = () => {
    window.location.href = "/match/setup";
  };

  // ================= SORT TABLE =================
  const sortedPoints = Object.entries(points)
    .map(([team, stats]) => ({ team, ...stats }))
    .sort((a, b) => b.points - a.points);
const sortedTeams = Object.entries(table || {}).sort(
  (a, b) => b[1].points - a[1].points
);

const orangeCap = Object.entries(stats || {}).sort(
  (a, b) => b[1].runs - a[1].runs
)[0];

const purpleCap = Object.entries(stats || {}).sort(
  (a, b) => b[1].wickets - a[1].wickets
)[0];
  // ================= USER MATCHES =================
  const userMatches = schedule.filter(
    m => m.team1 === team || m.team2 === team
  );

  return (
    <div style={{
      background: "#0B0F1A",
      color: "white",
      minHeight: "100vh",
      padding: "20px"
    }}>
      <h1>🏆 Tournament Dashboard</h1>
      <h2>Your Team: {team}</h2>

      {/* ================= PLAY BUTTON ================= */}
      <button
        onClick={playMatch}
        className="glow-btn"
        style={{
          marginTop: "20px",
          padding: "12px 20px",
          fontSize: "16px"
        }}
      >
        ▶ Play Next Match
      </button>

      {/* ================= POINTS TABLE ================= */}




  // 🔥 SORT TEAMS BY POINTS
  const sortedTeams = Object.entries(table).sort(
    (a, b) => b[1].points - a[1].points
  );

  // 🟠 ORANGE CAP
  const orangeCap = Object.entries(stats).sort(
    (a, b) => b[1].runs - a[1].runs
  )[0];

  // 🟣 PURPLE CAP
  const purpleCap = Object.entries(stats).sort(
    (a, b) => b[1].wickets - a[1].wickets
  )[0];

  return (
    <div style={{
      padding: 30,
      color: "white",
      background: "#0B0F1A",
      minHeight: "100vh"
    }}>

      <h1 style={{ fontSize: 32, marginBottom: 20 }}>🏆 Tournament Dashboard</h1>

      {/* ================= POINTS TABLE ================= */}
      <h2>Points Table</h2>

      {sortedTeams.length === 0 ? (
        <p>No matches played yet</p>
      ) : (
        <table style={{ width: "100%", marginBottom: 30 }}>
          <thead>
            <tr>
              <th>Team</th>
              <th>P</th>
              <th>W</th>
              <th>L</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map(([team, t], i) => (
              <tr key={i}>
                <td>{team}</td>
                <td>{t.played}</td>
                <td>{t.won}</td>
                <td>{t.lost}</td>
                <td>{t.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ================= ORANGE CAP ================= */}
      <h2>🟠 Orange Cap</h2>

      {orangeCap ? (
        <p>
          {orangeCap[0]} — {orangeCap[1].runs} runs
        </p>
      ) : (
        <p>No data yet</p>
      )}

      {/* ================= PURPLE CAP ================= */}
      <h2>🟣 Purple Cap</h2>

      {purpleCap ? (
        <p>
          {purpleCap[0]} — {purpleCap[1].wickets} wickets
        </p>
      ) : (
        <p>No data yet</p>
      )}

    </div>
  );
}
      {/* ================= YOUR MATCHES ================= */}
      <h2 style={{ marginTop: "30px" }}>Your Matches</h2>

      {userMatches.length === 0 && (
        <p>No matches yet</p>
      )}

      {userMatches.map((m, i) => (
        <div key={i} style={{
          padding: "10px",
          marginTop: "8px",
          background: m.played ? "#1a1a1a" : "#111",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "space-between"
        }}>
          <span>{m.team1} vs {m.team2}</span>

          <span style={{
            color: m.played ? "#00E676" : "#FF5252"
          }}>
            {m.played ? "Played" : "Upcoming"}
          </span>
        </div>
      ))}

      {/* ================= RECENT RESULTS ================= */}
      <h2 style={{ marginTop: "30px" }}>Recent Results</h2>

      {results.length === 0 && (
        <p>No matches played yet</p>
      )}

      {results.slice(-5).map((r, i) => (
        <div key={i} style={{
          padding: "10px",
          marginTop: "8px",
          background: "#111",
          borderRadius: "8px"
        }}>
          <div>{r.team1} vs {r.team2}</div>

          <div style={{
            fontSize: "12px",
            opacity: 0.7
          }}>
            {r.result
              ? `${r.result.innings1} vs ${r.result.innings2}`
              : `Winner: ${r.winner}`}
          </div>
        </div>
      ))}
    </div>
  );

