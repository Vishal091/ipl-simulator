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
  const [bowlerOvers, setBowlerOvers] = useState({});

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
    if (bowlerOvers[p.name] >= 24) {
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

      if (res % 2 === 1) {
        [striker, nonStriker] = [nonStriker, striker];
        setStriker(striker);
        setNonStriker(nonStriker);
      }
    }

    setScore(newScore);
    setWickets(newWickets);
    setScorecard(sc);

    const newBalls = balls + 1;
    setBalls(newBalls);

    // update bowler overs (1 ball = 1)
    let bo = { ...bowlerOvers };
    bo[bowler.name] = (bo[bowler.name] || 0) + 1;
    setBowlerOvers(bo);

    // OVER COMPLETE
    if (newBalls % 6 === 0) {
      [striker, nonStriker] = [nonStriker, striker];
      setStriker(striker);
      setNonStriker(nonStriker);

      setSelectBowlerMode(true);
      setBowler(null);
    }
  };

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
      <p>Overs: {Math.floor(balls/6)}.{balls%6}</p>

      {/* STRIKERS */}
      <p>Striker: {striker?.name}</p>
      <p>Non-Striker: {nonStriker?.name}</p>

      {/* BOWLER */}
      <p>Bowler: {bowler?.name || "None"}</p>

      {/* SELECT BOWLER */}
      {selectBowlerMode && (
        <>
          <h3>Select Bowler</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {xi.map((p, i) => (
              <button key={i} onClick={() => selectBowler(p)}>
                {p.name} ({Math.floor((bowlerOvers[p.name] || 0)/6)} ov)
              </button>
            ))}
          </div>
        </>
      )}

      {/* PLAY BALL */}
      {!selectBowlerMode && (
        <button onClick={playBall} style={{ marginTop: "20px" }}>
          ▶ Next Ball
        </button>
      )}

      {/* BALL LOG */}
      <div style={{ marginTop: "20px" }}>
        <h3>Last Balls</h3>
        {log.slice(-12).map((l, i) => (
          <span key={i} style={{ marginRight: "8px" }}>{l}</span>
        ))}
      </div>

      {/* SCORECARD */}
      <div style={{ marginTop: "30px" }}>
        <h3>Scorecard</h3>

        <table style={{ width: "100%", marginTop: "10px" }}>
          <thead>
            <tr>
              <th>Player</th>
              <th>Runs</th>
              <th>Balls</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(scorecard).map(([name, stats], i) => (
              <tr key={i}>
                <td>{name}</td>
                <td>{stats.runs}</td>
                <td>{stats.balls}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
