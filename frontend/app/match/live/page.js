"use client";
import { useEffect, useState } from "react";

export default function LiveMatch() {
  const [xi, setXi] = useState([]);

  const [score, setScore] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [balls, setBalls] = useState(0);

  const [striker, setStriker] = useState(null);
  const [nonStriker, setNonStriker] = useState(null);
  const [nextIndex, setNextIndex] = useState(2);

  const [bowler, setBowler] = useState(null);
  const [bowlerBalls, setBowlerBalls] = useState({});

  const [log, setLog] = useState([]);
  const [scorecard, setScorecard] = useState({});

  const [selectBowlerMode, setSelectBowlerMode] = useState(true);

  // ================= INIT =================
  useEffect(() => {
    const storedXI = JSON.parse(localStorage.getItem("playingXI"));

    if (!storedXI) {
      alert("No XI found");
      return;
    }

    setXi(storedXI);

    setStriker(storedXI[0]);
    setNonStriker(storedXI[1]);

    // init scorecard
    let sc = {};
    storedXI.forEach(p => {
      sc[p.name] = { runs: 0, balls: 0 };
    });
    setScorecard(sc);

  }, []);

  // ================= SELECT BOWLER =================
  const selectBowler = (p) => {
    // allow only bowlers / allrounders
    if (!["BOWL", "AR"].includes(p.role)) {
      alert("Only bowlers/allrounders can bowl");
      return;
    }

    if ((bowlerBalls[p.name] || 0) >= 24) {
      alert("Max 4 overs reached");
      return;
    }

    setBowler(p);
    setSelectBowlerMode(false);
  };

  // ================= PLAY BALL =================
  const playBall = () => {
    if (!bowler) {
      alert("Select bowler first");
      return;
    }

    const outcomes = [0, 1, 2, 4, 6, "W"];
    const res = outcomes[Math.floor(Math.random() * outcomes.length)];

    let newScore = score;
    let newWickets = wickets;

    let sc = { ...scorecard };

    if (res === "W") {
      newWickets++;

      setLog(prev => [...prev, `${striker.name} OUT`]);

      if (nextIndex < xi.length) {
        setStriker(xi[nextIndex]);
        setNextIndex(nextIndex + 1);
      }
    } else {
      newScore += res;

      sc[striker.name].runs += res;
      sc[striker.name].balls += 1;

      setLog(prev => [...prev, `${striker.name} ${res}`]);

      // 🔥 FIXED STRIKE ROTATION
      if (res % 2 === 1) {
        const temp = striker;
        setStriker(nonStriker);
        setNonStriker(temp);
      }
    }

    setScore(newScore);
    setWickets(newWickets);
    setScorecard(sc);

    const newBalls = balls + 1;
    setBalls(newBalls);

    // update bowler balls
    let bb = { ...bowlerBalls };
    bb[bowler.name] = (bb[bowler.name] || 0) + 1;
    setBowlerBalls(bb);

    // ================= OVER COMPLETE =================
    if (newBalls % 6 === 0) {
      // strike swap
      const temp = striker;
      setStriker(nonStriker);
      setNonStriker(temp);

      setSelectBowlerMode(true);
      setBowler(null);
    }
  };

  // ================= HELPERS =================
  const overs = `${Math.floor(balls / 6)}.${balls % 6}`;

  // ================= UI =================
  return (
    <div style={{
      padding: "20px",
      background: "#0B0F1A",
      color: "white",
      minHeight: "100vh"
    }}>
      <h1>🏏 Live Match</h1>

      {/* SCORE */}
      <h2>{score}/{wickets}</h2>
      <p>Overs: {overs}</p>

      {/* CURRENT PLAYERS */}
      <div style={{ marginTop: "10px" }}>
        <p>Striker: <b>{striker?.name}</b></p>
        <p>Non-Striker: {nonStriker?.name}</p>
        <p>Bowler: {bowler?.name || "None"}</p>
      </div>

      {/* SELECT BOWLER */}
      {selectBowlerMode && (
        <>
          <h3 style={{ marginTop: "20px" }}>Select Bowler</h3>

          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px"
          }}>
            {xi.map((p, i) => (
              <button
                key={i}
                onClick={() => selectBowler(p)}
                style={{
                  padding: "6px 10px",
                  background: "#111",
                  border: "1px solid #333",
                  cursor: "pointer"
                }}
              >
                {p.name} ({Math.floor((bowlerBalls[p.name] || 0)/6)} ov)
              </button>
            ))}
          </div>
        </>
      )}

      {/* PLAY BALL */}
      {!selectBowlerMode && (
        <button
          onClick={playBall}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            fontSize: "16px"
          }}
        >
          ▶ Next Ball
        </button>
      )}

      {/* BALL LOG */}
      <div style={{ marginTop: "25px" }}>
        <h3>Last Balls</h3>

        {log.slice(-12).map((l, i) => (
          <span key={i} style={{
            marginRight: "8px",
            padding: "4px 6px",
            background: "#111",
            borderRadius: "4px"
          }}>
            {l}
          </span>
        ))}
      </div>

      {/* SCORECARD */}
      <div style={{ marginTop: "30px" }}>
        <h3>Scorecard</h3>

        <table style={{
          width: "100%",
          marginTop: "10px",
          borderCollapse: "collapse"
        }}>
          <thead>
            <tr style={{ background: "#111" }}>
              <th>Player</th>
              <th>Runs</th>
              <th>Balls</th>
              <th>SR</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(scorecard).map(([name, stats], i) => {
              const sr = stats.balls
                ? ((stats.runs / stats.balls) * 100).toFixed(1)
                : 0;

              return (
                <tr key={i} style={{ textAlign: "center" }}>
                  <td>{name}</td>
                  <td>{stats.runs}</td>
                  <td>{stats.balls}</td>
                  <td>{sr}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
