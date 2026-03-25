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

  // ================= SAVE SYSTEM =================
  const saveMatchData = () => {
    let table = JSON.parse(localStorage.getItem("pointsTable")) || {};

    const match = JSON.parse(localStorage.getItem("matchData"));
    const myTeam = match.myTeam;
    const oppTeam = match.oppTeam;

    if (!table[myTeam]) table[myTeam] = { played: 0, won: 0, lost: 0, points: 0 };
    if (!table[oppTeam]) table[oppTeam] = { played: 0, won: 0, lost: 0, points: 0 };

    table[myTeam].played++;
    table[oppTeam].played++;

    if (result.includes("Win")) {
      table[myTeam].won++;
      table[myTeam].points += 2;
      table[oppTeam].lost++;
    } else if (result.includes("Lost")) {
      table[oppTeam].won++;
      table[oppTeam].points += 2;
      table[myTeam].lost++;
    }

    localStorage.setItem("pointsTable", JSON.stringify(table));
  };

  const savePlayerStats = () => {
    let stats = JSON.parse(localStorage.getItem("playerStats")) || {};

    Object.entries(scorecard).forEach(([name, s]) => {
      if (!stats[name]) stats[name] = { runs: 0, wickets: 0 };
      stats[name].runs += s.runs;
    });

    Object.keys(bowlerBalls).forEach(name => {
      if (!stats[name]) stats[name] = { runs: 0, wickets: 0 };
      stats[name].wickets += Math.floor(Math.random() * 3);
    });

    localStorage.setItem("playerStats", JSON.stringify(stats));
  };

  useEffect(() => {
    if (result) {
      saveMatchData();
      savePlayerStats();
    }
  }, [result]);

  // ================= PLAY BALL =================
  const playBall = () => {
    if (result) return;

    if (!userBatting && !bowler) {
      alert("Select bowler first");
      return;
    }

    let currentBowler = bowler;

    if (userBatting && !bowler) {
      const eligible = bowlingTeam.filter(p =>
        p.name !== keeper &&
        p.name !== lastBowler &&
        (bowlerBalls[p.name] || 0) < 24
      );

      currentBowler = eligible[Math.floor(Math.random() * eligible.length)];
      setBowler(currentBowler);
    }

    const rand = Math.random();

    // 🔥 EXTRAS
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

    const outcomes = [0,1,2,4,6,"W"];
    const res = outcomes[Math.floor(Math.random()*outcomes.length)];

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

      setLog(prev => [...prev, `${striker?.name} OUT`]);

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

      setLog(prev => [...prev, res]);
    }

    setScorecard(sc);

    const newBalls = balls + 1;
    setBalls(newBalls);

    if (newBalls >= 120) {
      endInnings();
      return;
    }

    if (innings === 2 && score >= target) {
      endInnings();
      return;
    }

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
    <div style={{ padding:20, color:"white", background:"#0B0F1A" }}>
      <h2>{score}/{wickets}</h2>
      <p>Overs: {Math.floor(balls/6)}.{balls%6}</p>

      <h3>Striker: {striker?.name}</h3>
      <h3>Non-Striker: {nonStriker?.name}</h3>

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
          {Object.entries(scorecard).map(([name,s],i)=>(
            <tr key={i}>
              <td>{name}</td>
              <td>{s.runs}</td>
              <td>{s.balls}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {!result && (
        <button onClick={playBall}>Next Ball</button>
      )}

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
