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

  const [shotStriker, setShotStriker] = useState("normal");
  const [shotNonStriker, setShotNonStriker] = useState("normal");

  const [scorecard, setScorecard] = useState({});
  const [log, setLog] = useState([]);

  const [freeHit, setFreeHit] = useState(false);

  // ================= INIT =================
  useEffect(() => {
    const match = JSON.parse(localStorage.getItem("matchData"));
    const tossWinner = localStorage.getItem("tossWinner");
    const decision = localStorage.getItem("tossDecision");

    if (!match) return;

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

    setStriker(team[0] || null);
    setNonStriker(team[1] || null);
    setAvailableBatters(team.slice(2));

    setBowler(null);
    setLastBowler(null);
    setBowlerBalls({});
    setSelectBowlerMode(true);

    let sc = {};
    team.forEach(p => {
      sc[p.name] = { runs: 0, balls: 0, out: false };
    });
    setScorecard(sc);
  };

  // ================= SELECT BOWLER =================
  const selectBowler = (p) => {
    if (p.name === keeper) return alert("Keeper cannot bowl");
    if (p.name === lastBowler) return alert("No consecutive overs");
    if ((bowlerBalls[p.name] || 0) >= 24) return alert("Max 4 overs");

    setBowler(p);
    setSelectBowlerMode(false);
  };

  // ================= AI BOWLER =================
  const getAIBowler = () => {
    const eligible = bowlingTeam.filter(p =>
      p.name !== keeper &&
      p.name !== lastBowler &&
      (bowlerBalls[p.name] || 0) < 24
    );
    return eligible[Math.floor(Math.random() * eligible.length)];
  };

  // ================= PLAY BALL =================
  const playBall = () => {
    if (result) return;

    if (!userBatting && !bowler) {
      alert("Select bowler first");
      return;
    }

    let currentBowler = bowler;

    if (userBatting && !bowler) {
      const ai = getAIBowler();
      setBowler(ai);
      currentBowler = ai;
    }

    const rand = Math.random();

    // WIDE
    if (rand < 0.05) {
      setScore(s => s + 1);
      setLog(l => [...l, "Wide"]);
      return;
    }

    // NO BALL
    if (rand < 0.10) {
      setScore(s => s + 1);
      setFreeHit(true);
      setLog(l => [...l, "No Ball"]);
      return;
    }

    const batSkill = striker?.bat || 50;
    const bowlSkill = currentBowler?.bowl || 50;

    let aggression =
      shotStriker === "aggressive" ? 1.3 :
      shotStriker === "defensive" ? 0.7 : 1;

    let wicketChance = (bowlSkill - batSkill) / 200 + 0.05;
    wicketChance *= aggression;

    let res;
    const r = Math.random();

    if (!freeHit && r < wicketChance) res = "W";
    else if (r < 0.3) res = 0;
    else if (r < 0.5) res = 1;
    else if (r < 0.65) res = 2;
    else if (r < 0.85) res = 4;
    else res = 6;

    let sc = { ...scorecard };

    if (res === "W") {
      const newW = wickets + 1;
      setWickets(newW);

      if (striker) sc[striker.name].out = true;

      if (newW >= 10) {
        setScorecard(sc);
        return endInnings();
      }

      if (userBatting) {
        setSelectBatterMode(true);
      } else {
        const next = availableBatters[0];
        if (next) {
          setStriker(next);
          setAvailableBatters(availableBatters.slice(1));
        }
      }

    } else {
      setScore(s => s + res);

      if (striker) {
        sc[striker.name].runs += res;
        sc[striker.name].balls += 1;
      }

      if (res % 2 === 1 && striker && nonStriker) {
        setStriker(nonStriker);
        setNonStriker(striker);
      }
    }

    setScorecard(sc);
    setFreeHit(false);

    const newBalls = balls + 1;
    setBalls(newBalls);

    if (newBalls >= 120) return endInnings();
    if (innings === 2 && score >= target) return endInnings();

    let bb = { ...bowlerBalls };
    bb[currentBowler.name] = (bb[currentBowler.name] || 0) + 1;
    setBowlerBalls(bb);

    if (newBalls % 6 === 0 && striker && nonStriker) {
      setLastBowler(currentBowler.name);
      setBowler(null);
      setSelectBowlerMode(true);

      setStriker(nonStriker);
      setNonStriker(striker);
    }
  };

  const endInnings = () => {
    if (innings === 1) {
      setTarget(score + 1);
      setInnings(2);

      setBattingTeam(bowlingTeam);
      setBowlingTeam(battingTeam);
      setUserBatting(!userBatting);

      initInnings(bowlingTeam);
    } else {
      if (score > target - 1) setResult("🏆 You Win!");
      else if (score === target - 1) setResult("🤝 Tie");
      else setResult("❌ You Lost");
    }
  };

  return (
    <div style={{ padding: 20, color: "white", background: "#0B0F1A" }}>
      <h2>{score}/{wickets}</h2>
      <p>Overs: {Math.floor(balls/6)}.{balls%6}</p>

      <h3>Striker: {striker?.name || "-"}</h3>
      <h3>Non-Striker: {nonStriker?.name || "-"}</h3>

      {!userBatting && selectBowlerMode && (
        <>
          <h3>Select Bowler</h3>
          {bowlingTeam.map((p,i)=>(
            <button key={i} onClick={()=>selectBowler(p)}>
              {p.name}
            </button>
          ))}
        </>
      )}

      <h3>Scorecard</h3>
      <table>
        <tbody>
          {Object.entries(scorecard).map(([n,s],i)=>(
            <tr key={i}>
              <td>{n}</td>
              <td>{s.runs}</td>
              <td>{s.balls}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {!result && <button onClick={playBall}>Next Ball</button>}

      {result && (
        <>
          <h2>{result}</h2>
          <button onClick={()=>window.location.href="/tournament/dashboard"}>
            Back to Tournament
          </button>
        </>
      )}
    </div>
  );
}
