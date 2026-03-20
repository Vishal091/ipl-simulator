from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

# ✅ CORS (must be here)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sample teams
teams = {
    "RCB": [
        {"name": "Virat Kohli", "bat": 95},
        {"name": "Faf du Plessis", "bat": 88}
    ],
    "MI": [
        {"name": "Rohit Sharma", "bat": 90},
        {"name": "Suryakumar Yadav", "bat": 92}
    ]
}

@app.get("/")
def home():
    return {"message": "IPL Simulator API Running"}

@app.post("/simulate")
def simulate_match():
    team1 = "RCB"
    team2 = "MI"

    score1 = sum(random.randint(0, p["bat"]) for p in teams[team1]) // 10
    score2 = sum(random.randint(0, p["bat"]) for p in teams[team2]) // 10

    winner = team1 if score1 > score2 else team2

    return {
        "team1": team1,
        "score1": score1,
        "team2": team2,
        "score2": score2,
        "winner": winner
    }
