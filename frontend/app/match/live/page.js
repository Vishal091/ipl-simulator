"use client";
import { useEffect, useState } from "react";

export default function LiveMatch() {
  const [battingTeam, setBattingTeam] = useState([]);
  const [bowlingTeam, setBowlingTeam] = useState([]);

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

  useEffect(() => {
    const match = JSON.parse(localStorage.getItem("matchData"));
    const tossWinner = localStorage.getItem("tossWinner");
    const decision = localStorage.getItem("tossDecision");

    const { myXI, oppXI } = match;

    let bat, bowl;

    if (
      (tossWinner === "You" && decision === "bat") ||
      (tossWinner === "Opponent" && decision === "bowl")
    ) {
      bat = myXI;
      bowl = oppXI;
    } else {
      bat = oppXI;
      bowl = myXI;
    }

    setBattingTeam(bat);
    setBowlingTeam(bowl);

    setStriker(bat[0]);
    setNonStriker(bat[1]);

    let sc = {};
    bat.forEach(p => {
      sc[p.name] = { runs: 0, balls: 0 };
    });

    setScorecard(sc);
  }, []);

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

  const playBall = () => {
    const outcomes = [0, 1, 2, 4, 6, "W"];
    const res = outcomes[Math.floor(Math.random() * outcomes.length)];

    let sc = { ...scorecard };

    if (res === "W") {
      setWickets(wickets + 1);

      if (nextIndex < battingTeam.length) {
        setStriker(battingTeam[nextIndex]);
        setNextIndex(nextIndex + 1);
      }
    } else {
      setScore(score + res);

      sc[striker.name].runs += res;
      sc[striker.name].balls += 1;

      if (res % 2 === 1) {
        const temp = striker;
        setStriker(nonStriker);
        setNonStriker(temp);
      }
    }

    setScorecard(sc);
    setBalls(balls + 1);

    let bb = { ...bowlerBalls };
    bb[bowler.name] = (bb[bowler.name] || 0) + 1;
    setBowlerBalls(bb);

    if ((balls + 1) % 6 === 0) {
      const temp = striker;
      setStriker(nonStriker);
      setNonStriker(temp);

      setSelectBowlerMode(true);
      setBowler(null);
    }
  };

  return (
    <div style={{ padding: 20, color: "white", background: "#0B0F1A" }}>
      <h2>{score}/{wickets}</h2>
      <p>{Math.floor(balls / 6)}.{balls % 6}</p>

      <p>Striker: {striker?.name}</p>
      <p>Bowler: {bowler?.name}</p>

      {selectBowlerMode && (
        <div>
          {bowlingTeam.map((p, i) => (
            <button key={i} onClick={() => selectBowler(p)}>
              {p.name}
            </button>
          ))}
        </div>
      )}

      {!selectBowlerMode && (
        <button onClick={playBall}>Next Ball</button>
      )}
    </div>
  );
}
