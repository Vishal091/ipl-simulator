"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div style={{
      height: "100vh",
      background: "linear-gradient(135deg, #0B0F1A, #111827)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center"
    }}>
      
      <h1 style={{
        fontSize: "3rem",
        fontWeight: "bold",
        background: "linear-gradient(90deg, #00E5FF, #FF3B3B)",
        WebkitBackgroundClip: "text",
        color: "transparent"
      }}>
        IPL SIMULATOR
      </h1>

      <p style={{ opacity: 0.7 }}>
        Build your squad. Control the game. Dominate the league.
      </p>

      <div style={{
        display: "flex",
        gap: "20px",
        marginTop: "40px"
      }}>
        <button onClick={() => router.push("/tournament")} style={btn}>
          🏆 Tournament
        </button>

        <button onClick={() => router.push("/quick-match")} style={btn}>
          ⚡ Quick Match
        </button>

        <button onClick={() => router.push("/career")} style={btn}>
          🎯 Career Mode
        </button>
      </div>
    </div>
  );
}

const btn = {
  padding: "15px 25px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(135deg, #00E5FF, #0099cc)",
  color: "black",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "0.3s"
};
