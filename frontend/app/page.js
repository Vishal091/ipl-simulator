"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center"
    }}>
      
      <h1 style={{
        fontSize: "4rem",
        background: "linear-gradient(90deg, #00E5FF, #FF3B3B)",
        WebkitBackgroundClip: "text",
        color: "transparent"
      }}>
        IPL SIMULATOR
      </h1>

      <p style={{ opacity: 0.6 }}>
        The most advanced cricket simulation engine
      </p>

      <div style={{
        display: "flex",
        gap: "20px",
        marginTop: "40px"
      }}>
        <button className="glow-btn" onClick={() => router.push("/tournament")}>
          🏆 Tournament
        </button>

        <button className="glow-btn" onClick={() => router.push("/quick-match")}>
          ⚡ Quick Match
        </button>

        <button className="glow-btn" onClick={() => router.push("/career")}>
          🎯 Career
        </button>
      </div>
    </div>
  );
}
