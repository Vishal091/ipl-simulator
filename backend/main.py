from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ipl-simulator-nine.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "IPL Simulator API Running"}

@app.post("/simulate")

    teams = {
    "RCB": [
        {"name": "Virat Kohli", "role": "batsman", "bat": 95, "bowl": 10},
        {"name": "Faf du Plessis", "role": "batsman", "bat": 88, "bowl": 5},
        {"name": "Glenn Maxwell", "role": "allrounder", "bat": 85, "bowl": 70}
    ],
    "MI": [
        {"name": "Rohit Sharma", "role": "batsman", "bat": 90, "bowl": 5},
        {"name": "Suryakumar Yadav", "role": "batsman", "bat": 92, "bowl": 5},
        {"name": "Hardik Pandya", "role": "allrounder", "bat": 88, "bowl": 80}
    ]
}
    venues = {
    "Wankhede": {"batting": 1.2, "spin": 0.9, "pace": 1.1},
    "Chepauk": {"batting": 0.9, "spin": 1.3, "pace": 0.8}
}

 @app.post("/simulate")
def simulate_match():
    team1 = "RCB"
    team2 = "MI"
    venue = "Wankhede"

    venue_factor = venues[venue]["batting"]

    def calculate_score(team):
        score = 0
        for player in team:
            base = player["bat"]
            performance = random.randint(0, base)
            score += int(performance * venue_factor / 10)
        return score

    score1 = calculate_score(teams[team1])
    score2 = calculate_score(teams[team2])

    winner = team1 if score1 > score2 else team2

    return {
        "team1": team1,
        "score1": score1,
        "team2": team2,
        "score2": score2,
        "winner": winner,
        "venue": venue
    }
