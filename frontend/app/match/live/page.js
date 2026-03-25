"use client";
import { useEffect, useState } from "react";

export default function LiveMatch() {
  const [battingTeam, setBattingTeam] = useState([]);
  const [bowlingTeam, setBowlingTeam] = useState([]);

  const [keeper, setKeeper] = useState(null);

  const [innings, setInnings] = useState(1);
  const [target, setTarget] = useState(null);

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
  const [result, setResult] = useState(null);

  // ================= INIT =================
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

    initInnings(bat);
  }, []);

  const initInnings = (team) => {
    setScore(0);
    setWickets(0);
    setBalls(0);

    setStriker(team[0]);
    setNonStriker(team[1]);
    setAvailableBatters(team.slice(2));

    setBowler(null);
    setLastBowler(null);
    setBowlerBalls({});
    setSelectBowlerMode(true);
    setSelectBatterMode(false);
  };

  // ================= AUTO BOWLER (AI) =================
  const getAIBowler = () => {
    const eligible = bowlingTeam.filter(p =>
      p.name !== keeper &&
      p.name !== lastBowler &&
      (bowlerBalls[p.name] || 0) < 24
    );

    return eligible[Math.floor(Math.random() * eligible.length)];
  };

  // ================= INNINGS END =================
  const endInnings = () => {
    if (innings === 1) {
      setTarget(score + 1);
      setInnings(2);

      const newBat = bowlingTeam;
      const newBowl = battingTeam;

      setBattingTeam(newBat);
      setBowlingTeam(newBowl);
      setUserBatting(!userBatting);

      initInnings(newBat);
    } else {
      if (score > target - 1) {
        setResult("🏆 You Win!");
      } else if (score === target - 1) {
        setResult("🤝 Match Tied");
      } else {
        setResult("❌ You Lost");
      }
    }
  };

  // ================= SELECT BOWLER (USER) =================
  const selectBowler = (p) => {
    if (p.name === keeper) return alert("Keeper cannot bowl");
    if (p.name === lastBowler) return alert("No consecutive overs");
    if ((bowlerBalls[p.name] || 0) >= 24) return alert("Max 4 overs");

    setBowler(p);
    setSelectBowlerMode(false);
  };

  const selectNextBatter = (p) => {
    setStriker(p);
    setAvailableBatters(availableBatters.filter(b => b.name !== p.name));
    setSelectBatterMode(false);
  };

  // ================= PLAY BALL =================
  const playBall = () => {
    if (result) return;

    // 🔥 AUTO BOWLER FOR AI
    let currentBowler = bowler;

    if (userBatting) {
      if (!bowler) {
        const aiBowler = getAIBowler();
        setBowler(aiBowler);
        currentBowler = aiBowler;
      }
    } else {
      if (!bowler) {
        alert("Select bowler");
        return;
      }
    }

    const outcomes = [0,1,2,4,6,"W"];
    const res = outcomes[Math.floor(Math.random()*outcomes.length)];

    let newScore = score;
    let newWickets = wickets;

    if (res === "W") {
      newWickets++;
      setWickets(newWickets);

      if (newWickets >= 10) {
        endInnings();
        return;
      }

      if (userBatting) {
        setSelectBatterMode(true);
      } else {
        if (availableBatters.length > 0) {
          setStriker(availableBatters[0]);
          setAvailableBatters(availableBatters.slice(1));
        }
      }
    } else {
      newScore += res;
      setScore(newScore);

      if (res % 2 === 1) {
        const temp = striker;
        setStriker(nonStriker);
        setNonStriker(temp);
      }
    }

    const newBalls = balls + 1;
    setBalls(newBalls);

    // 🎯 CHASE END
    if (innings === 2 && newScore >= target) {
      endInnings();
      return;
    }

    // track bowler balls (HARD LIMIT)
    let bb = { ...bowlerBalls };
    bb[currentBowler.name] = (bb[currentBowler.name] || 0) + 1;
    setBowlerBalls(bb);

    // ⏱ OVER END
    if (newBalls % 6 === 0) {
      setLastBowler(currentBowler.name);
      setBowler(null);
      setSelectBowlerMode(true);

      const temp = striker;
      setStriker(nonStriker);
      setNonStriker(temp);
    }
  };

  // ================= UI =================
  return (
    <div style={{ padding: 20, background: "#0B0F1A", color: "white", minHeight: "100vh" }}>
      <h2>Innings {innings}</h2>
      {target && <p>Target: {target}</p>}

      <h2>{score}/{wickets}</h2>
      <p>Overs: {Math.floor(balls/6)}.{balls%6}</p>

      <p>Striker: {striker?.name}</p>
      <p>Bowler: {bowler ? bowler.name : "Auto / Select"}</p>

      {result && (
        <>
          <h2>{result}</h2>
          <button onClick={() => window.location.href="/tournament"}>
            Back to Tournament
          </button>
        </>
      )}

      {!result && (
        <>
          {!userBatting && selectBowlerMode && (
            <>
              <h3>Select Bowler</h3>
              {bowlingTeam.map((p,i)=>(
                <button key={i} onClick={()=>selectBowler(p)}>
                  {p.name} ({Math.floor((bowlerBalls[p.name]||0)/6)} ov)
                </button>
              ))}
            </>
          )}

          {selectBatterMode && (
            <>
              <h3>Select Batter</h3>
              {availableBatters.map((p,i)=>(
                <button key={i} onClick={()=>selectNextBatter(p)}>
                  {p.name}
                </button>
              ))}
            </>
          )}

          {(!selectBowlerMode || userBatting) && !selectBatterMode && (
            <button onClick={playBall}>Next Ball</button>
          )}
        </>
      )}
    </div>
  );
}
