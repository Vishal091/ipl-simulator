"use client";
import { useState } from "react";

export default function Career() {
  const API = "https://ipl-simulator-tb8n.onrender.com";

  const [name, setName] = useState("");
  const [career, setCareer] = useState(null);

  const create = async () => {
    const res = await fetch(API + "/create-player", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ name })
    });
    setCareer(await res.json());
  };

  const play = async () => {
    const res = await fetch(API + "/career-match");
    const data = await res.json();
    setCareer(data.career);
  };

  return (
    <div style={{ padding: 20, background:"#0B0F1A", color:"white", minHeight:"100vh" }}>
      <h1>🎯 Career Mode</h1>

      <input value={name} onChange={e=>setName(e.target.value)} />
      <button onClick={create}>Create</button>
      <button onClick={play}>Play Match</button>

      {career && (
        <div>
          <p>Runs: {career.runs}</p>
          <p>Matches: {career.matches}</p>
          <p>Form: {career.form}</p>
        </div>
      )}
    </div>
  );
}
