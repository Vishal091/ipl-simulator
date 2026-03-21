import { useState } from "react";

export default function Home() {
  const [data, setData] = useState(null);

  const runIPL = async () => {
    const res = await fetch("https://ipl-simulator-tb8n.onrender.com/tournament");
    const d = await res.json();
    setData(d);
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>🏏 IPL Simulator</h1>

      <button onClick={runIPL}>Run Full IPL 🏆</button>

      {data && (
        <div style={{ marginTop: 30 }}>
          <h2>📊 Points Table</h2>
          {data.points_table.map(([team, stats], i) => (
            <p key={i}>
              {team} - {stats.pts} pts
            </p>
          ))}

          <h2>🔥 Top 4</h2>
          {data.top4.map((t, i) => (
            <p key={i}>{i + 1}. {t}</p>
          ))}

          <h2>🏆 Playoffs</h2>
          <p>Qualifier 1 Winner: {data.playoffs.qualifier1}</p>
          <p>Eliminator Winner: {data.playoffs.eliminator}</p>
          <p>Qualifier 2 Winner: {data.playoffs.qualifier2}</p>

          <h1>👑 Champion: {data.playoffs.champion}</h1>
        </div>
      )}
    </div>
  );
}
