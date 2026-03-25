"use client";
import { useEffect, useState } from "react";

export default function LiveMatch() {
  const [battingTeam, setBattingTeam] = useState([]);
  const [bowlingTeam, setBowlingTeam] = useState([]);

  const [userBatting, setUserBatting] = useState(false);

  const [score, setScore] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [balls, setBalls] = useState(0);

  const [striker, setStriker] = useState(null);
  const [nonStriker, setNonStriker] = useState(null);

  const [availableBatters, setAvailableBatters] = useState([]);

  const [bowler, setBowler] = useState(null);
  const [bowlerBalls, setBowlerBalls] = useState({});

  const [log, setLog] = useState([]);
  const [selectBowlerMode, setSelectBowlerMode] = useState(true);
  const [selectBatterMode, setSelectBatterMode] = useState(false);

  // ================= INIT =================
  useEffect(() => {
    const match = JSON.parse(localStorage.getItem("matchData"));
    const tossWinner = localStorage.getItem("tossWinner");
    const decision = localStorage.getItem("tossDecision");

    const { myXI, oppXI } = match;

    let bat, bowl, isUserBatting;

    if (
      (tossWinner === "You" && decision === "bat") ||
      (tossWinner === "Opponent" && decision === "bowl")
    ) {
      bat = myXI;
      bowl = oppXI;
      isUserBatting = true;
    } else {
      bat = oppXI;
      bowl = myXI;
      isUserBatting = false;
    }

    setBattingTeam(bat);
    setBowlingTeam(bowl);
    setUserBatting(isUserBatting);

    setStriker(bat[0]);
    setNonStriker(bat[1]);

    setAvailableBatters(bat.slice(2));
  }, []);

  // ================= SELECT BOWLER =================
  const selectBowler = (p) => {
    if (!["BOWL", "AR"].includes(p.role)) {
      alert("Only bowlers/allrounders allowed");
      return;
    }

    if ((bowlerBalls[p.name] || 0) >= 24) {
      alert("Max 4 overs reached");
      return;
    }

    setBowler(p);
    setSelectBowlerMode(false);
  };

  // ================= SELECT NEXT BATTER =================
  const selectNextBatter = (p) => {
    setStriker(p);
    setAvailableBatters(availableBatters.filter(b => b.name !== p.name));
    setSelectBatterMode(false);
  };

  // ================= PLAY BALL =================
  const playBall = () => {
    if (!userBatting && !bowler) {
      alert("Select bowler first");
      return;
    }

    const outcomes = [0, 1, 2, 4, 6, "W"];
    const res = outcomes[Math.floor(Math.random() * outcomes.length)];

    if (res === "W") {
      setWickets(wickets + 1);
      setLog(prev => [...prev, `${striker.name} OUT`]);

      if (userBatting) {
        setSelectBatterMode(true);
      } else {
        if (availableBatters.length > 0) {
          setStriker(availableBatters[0]);
          setAvailableBatters(availableBatters.slice(1));
        }
      }
    } else {
      setScore(score + res);
      setLog(prev => [...prev, `${striker.name} ${res}`]);

      if (res % 2 === 1) {
        const temp = striker;
        setStriker(nonStriker);
        setNonStriker(temp);
      }
    }

    setBalls(balls + 1);

    // bowler tracking
    if (!userBatting) {
      let bb = { ...bowlerBalls };
      bb[bowler.name] = (bb[bowler.name] || 0) + 1;
      setBowlerBalls(bb);
    }

    // over complete
    if ((balls + 1) % 6 === 0) {
      const temp = striker;
      setStriker(nonStriker);
      setNonStriker(temp);

      if (!userBatting) {
        setSelectBowlerMode(true);
        setBowler(null);
      }
    }
  };

  // ================= UI =================
  return (
    <div style={{ padding: 20, color: "white", background: "#0B0F1A" }}>
      <h1>🏏 Live Match</h1>

      <h2>{score}/{wickets}</h2>
      <p>Overs: {Math.floor(balls/6)}.{balls%6}</p>

      <p>Striker: {striker?.name}</p>
      <p>Non-Striker: {nonStriker?.name}</p>

      {/* ================= BOWLING MODE ================= */}
      {!userBatting && selectBowlerMode && (
        <>
          <h3>Select Bowler</h3>
          {bowlingTeam.map((p, i) => (
            <button key={i} onClick={() => selectBowler(p)}>
              {p.name}
            </button>
          ))}
        </>
      )}

      {/* ================= BATTER SELECTION ================= */}
      {selectBatterMode && (
        <>
          <h3>Select Next Batter</h3>
          {availableBatters.map((p, i) => (
            <button key={i} onClick={() => selectNextBatter(p)}>
              {p.name}
            </button>
          ))}
        </>
      )}

      {/* ================= PLAY BALL ================= */}
      {(!selectBowlerMode || userBatting) && !selectBatterMode && (
        <button onClick={playBall} style={{ marginTop: 20 }}>
          ▶ Next Ball
        </button>
      )}

      {/* ================= LOG ================= */}
      <div style={{ marginTop: 20 }}>
        {log.slice(-10).map((l, i) => (
          <span key={i} style={{ marginRight: 8 }}>{l}</span>
        ))}
      </div>
    </div>
  );
}
