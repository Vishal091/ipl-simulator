from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
venues = {
    "Wankhede": {"batting": 1.2},
    "Chepauk": {"batting": 0.9}
}

@app.get("/")
def home():
    return {"message": "IPL Simulator API Running"}

@app.post("/simulate")
def simulate_match():
    import random

    def play_innings(venue_factor):
    import random

    total_runs = 0
    wickets = 0
    balls = 0

    while balls < 120 and wickets < 10:
        balls += 1
        over = balls // 6

        if over < 6:
            weights = [25, 30, 10, 20, 10, 5]
        elif over < 16:
            weights = [35, 35, 10, 10, 3, 7]
        else:
            weights = [20, 25, 10, 20, 15, 10]

        outcome = random.choices(
            ["dot", "1", "2", "4", "6", "wicket"],
            weights=weights
        )[0]

        if outcome == "wicket":
            wickets += 1
        elif outcome == "dot":
            continue
        else:
            runs = int(outcome)
            total_runs += int(runs * venue_factor)

    return total_runs, wickets

    venue = "Wankhede"
    factor = venues[venue]["batting"]
    score1, wk1 = play_innings(factor)
    score2, wk2 = play_innings(factor)

    winner = "RCB" if score1 > score2 else "MI"

    return {
        "team1": "RCB",
        "score1": f"{score1}/{wk1}",
        "team2": "MI",
        "score2": f"{score2}/{wk2}",
        "winner": winner
    }
