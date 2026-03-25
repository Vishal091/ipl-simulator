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

  const [log, setLog] = useState([]);
  const [scorecard, setScorecard] = useState({});

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

    if (team.length >= 2) {
      setStriker(team[0]);
      setNonStriker(team[1]);
    } else {
      setStriker(team[0] || null);
      setNonStriker(null);
    }

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

  // ================= AI BOWLER =================
  const getAIBowler = () => {
    const eligible = bowlingTeam.filter(p =>
      p.name !== keeper &&
      p.name !== lastBowler &&
      (bowlerBalls[p.name] || 0) < 24
    );

    return eligible[Math.floor(Math.random() * eligible.length)];
  };

  // ================= SELECT BOWLER =================
  const selectBowler = (p) => {
    if (p.name === keeper) return alert("Keeper cannot bowl");
    if (p.name === lastBowler) return alert("No consecutive overs");
    if ((bowlerBalls[p.name] || 0) >= 24) return alert("Max 4 overs");

    setBowler(p);
    setSelectBowlerMode(false);
  };

  // ================= END INNINGS =================
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
      if (score > target - 1) setResult("🏆 You Win!");
      else if (score === target - 1) setResult("🤝 Tie");
      else setResult("❌ You Lost");
    }
  };

  // ================= PLAY BALL =================
  const playBall = () => {
    if (result) return;

    // 🔴 FORCE BOWLER IF USER BOWLING
    if (!userBatting && !bowler) {
      alert("Select bowler first");
      return;
    }

    let currentBowler = bowler;

    // 🤖 AI BOWLING
    if (userBatting) {
      if (!bowler) {
        const ai = getAIBowler();
        setBowler(ai);
        currentBowler = ai;
      }
    }

    const rand = Math.random();

    // 🧠 EXTRAS
    if (rand < 0.05) {
      setScore(prev => prev + 1);
      setLog(prev => [...prev, "Wide"]);
      return;
    }

    if (rand < 0.10) {
      setScore(prev => prev + 1);
      setLog(prev => [...prev, "No Ball"]);
      return;
    }

    // 🎯 SKILLS
    const batSkill = striker?.bat || 50;
    const bowlSkill = currentBowler?.bowl || 50;

    let aggression =
      shotStriker === "aggressive" ? 1.3 :
      shotStriker === "defensive" ? 0.7 : 1;

    let wicketChance = (bowlSkill - batSkill) / 200 + 0.05;
    wicketChance *= aggression;

    const r = Math.random();
    let res;

    if (r < wicketChance) res = "W";
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
        endInnings();
        return;
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
      setScore(prev => prev + res);

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

    const newBalls = balls + 1;
    setBalls(newBalls);

    // 🛑 END AT 20 OVERS
    if (newBalls >= 120) {
      endInnings();
      return;
    }

    // 🎯 CHASE END
    if (innings === 2 && score >= target) {
      endInnings();
      return;
    }

    // 📊 TRACK BOWLER
    let bb = { ...bowlerBalls };
    bb[currentBowler.name] = (bb[currentBowler.name] || 0) + 1;
    setBowlerBalls(bb);

    // 🔁 OVER END
    if (newBalls % 6 === 0 && striker && nonStriker) {
      setLastBowler(currentBowler.name);
      setBowler(null);
      setSelectBowlerMode(true);

      setStriker(nonStriker);
      setNonStriker(striker);
    }
  };

  return (
    <div style={{ padding: 20, color: "white", background: "#0B0F1A" }}>

      <h2>{score}/{wickets}</h2>
      <p>Overs: {Math.floor(balls/6)}.{balls%6}</p>
      {target && <p>Target: {target}</p>}

      <h3>Striker: {striker?.name || "-"}</h3>
      <h3>Non-Striker: {nonStriker?.name || "-"}</h3>

      {/* 🎯 SHOT CONTROL */}
      {userBatting && (
        <>
          <p>Striker Shot</p>
          <button onClick={()=>setShotStriker("defensive")}>Def</button>
          <button onClick={()=>setShotStriker("normal")}>Normal</button>
          <button onClick={()=>setShotStriker("aggressive")}>Attack</button>
        </>
      )}

      {/* 🎯 BOWLER SELECTION */}
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

      {/* 🧾 SCORECARD */}
      <h3>Scorecard</h3>
      <table>
        <thead>
          <tr>
            <th>Player</th><th>Runs</th><th>Balls</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(scorecard).map(([name,s],i)=>(
            <tr key={i}>
              <td>{name}</td>
              <td>{s.runs}</td>
              <td>{s.balls}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {result && (
        <>
          <h2>{result}</h2>
          <button onClick={()=>window.location.href="/tournament/dashboard"}>
            Back to Tournament
          </button>
        </>
      )}

      {!result && (!selectBowlerMode || userBatting) && (
        <button onClick={playBall}>Next Ball</button>
      )}
    </div>
  );
}
