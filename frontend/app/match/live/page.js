"use client";
import { useEffect, useState } from "react";

export default function LiveMatch() {
  const [battingTeam, setBattingTeam] = useState([]);
  const [bowlingTeam, setBowlingTeam] = useState([]);

  const [keeper, setKeeper] = useState(null);

  const [score, setScore] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [balls, setBalls] = useState(0);

  const [striker, setStriker] = useState(null);
  const [nonStriker, setNonStriker] = useState(null);
  const [availableBatters, setAvailableBatters] = useState([]);

  const [bowler, setBowler] = useState(null);
  const [lastBowler, setLastBowler] = useState(null);
  const [bowlerBalls, setBowlerBalls] = useState({});

  const [selectBowlerMode, setSelectBowlerMode] = useState(true);
  const [selectBatterMode, setSelectBatterMode] = useState(false);

  const [userBatting, setUserBatting] = useState(false);

  useEffect(() => {
    const match = JSON.parse(localStorage.getItem("matchData"));
    const tossWinner = localStorage.getItem("tossWinner");
    const decision = localStorage.getItem("tossDecision");

    const { myXI, oppXI, keeper } = match;

    setKeeper(keeper);

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

  const selectBowler = (p) => {
    if (p.name === keeper) {
      alert("Keeper cannot bowl");
      return;
    }

    if (p.name === lastBowler) {
      alert("Cannot bowl consecutive overs");
      return;
    }

    if ((bowlerBalls[p.name] || 0) >= 24) {
      alert("Max 4 overs reached");
      return;
    }

    setBowler(p);
    setSelectBowlerMode(false);
  };

  const selectNextBatter = (p) => {
    setStriker(p);
    setAvailableBatters(availableBatters.filter(b => b.name !== p.name));
    setSelectBatterMode(false);
  };

  const playBall = () => {
    const outcomes = [0,1,2,4,6,"W"];
    const res = outcomes[Math.floor(Math.random()*outcomes.length)];

    if (res === "W") {
      setWickets(wickets + 1);

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

      if (res % 2 === 1) {
        const temp = striker;
        setStriker(nonStriker);
        setNonStriker(temp);
      }
    }

    const newBalls = balls + 1;
    setBalls(newBalls);

    // track bowler balls
    let bb = { ...bowlerBalls };
    bb[bowler.name] = (bb[bowler.name] || 0) + 1;
    setBowlerBalls(bb);

    // end of over
    if (newBalls % 6 === 0) {
      setLastBowler(bowler?.name);
      setBowler(null);
      setSelectBowlerMode(true);

      const temp = striker;
      setStriker(nonStriker);
      setNonStriker(temp);
    }
  };

  return (
    <div style={{ padding: 20, color: "white", background: "#0B0F1A" }}>
      <h2>{score}/{wickets}</h2>
      <p>{Math.floor(balls/6)}.{balls%6}</p>

      <p>Bowler: {bowler ? bowler.name : "Select bowler"}</p>

      {/* Bowler selection */}
      {!userBatting && selectBowlerMode && (
        <>
          <h3>Select Bowler</h3>
          {bowlingTeam.map((p, i) => (
            <button key={i} onClick={() => selectBowler(p)}>
              {p.name} ({Math.floor((bowlerBalls[p.name]||0)/6)} ov)
            </button>
          ))}
        </>
      )}

      {/* Batter selection */}
      {selectBatterMode && (
        <>
          <h3>Select Batter</h3>
          {availableBatters.map((p, i) => (
            <button key={i} onClick={() => selectNextBatter(p)}>
              {p.name}
            </button>
          ))}
        </>
      )}

      {/* Play */}
      {(!selectBowlerMode || userBatting) && !selectBatterMode && (
        <button onClick={playBall}>Next Ball</button>
      )}
    </div>
  );
}
