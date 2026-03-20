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

@app.get("/")
def home():
    return {"message": "IPL Simulator API Running"}

@app.post("/simulate")
def simulate_match():
    import random

    def play_innings():
        total_runs = 0
        wickets = 0
        balls = 0

        while balls < 120 and wickets < 10:
            balls += 1

            outcome = random.choices(
                ["dot", "1", "2", "4", "6", "wicket"],
                weights=[30, 30, 10, 15, 5, 10]
            )[0]

            if outcome == "wicket":
                wickets += 1
            elif outcome == "dot":
                continue
            else:
                total_runs += int(outcome)

        return total_runs, wickets

    score1, wk1 = play_innings()
    score2, wk2 = play_innings()

    winner = "RCB" if score1 > score2 else "MI"

    return {
        "team1": "RCB",
        "score1": f"{score1}/{wk1}",
        "team2": "MI",
        "score2": f"{score2}/{wk2}",
        "winner": winner
    }
