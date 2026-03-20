from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ipl-simulator-nine.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

teams = {
    "RCB": [
        {"name": "Kohli", "bat": 95, "agg": 70},
        {"name": "Faf", "bat": 88, "agg": 75},
        {"name": "Maxwell", "bat": 85, "agg": 95},
        {"name": "DK", "bat": 80, "agg": 90},
        {"name": "Tailender", "bat": 30, "agg": 40}
    ],
    "MI": [
        {"name": "Rohit", "bat": 90, "agg": 70},
        {"name": "Sky", "bat": 92, "agg": 90},
        {"name": "Hardik", "bat": 88, "agg": 85},
        {"name": "Tim David", "bat": 85, "agg": 95},
        {"name": "Tailender", "bat": 30, "agg": 40}
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
    total_runs = 0
    wickets = 0
    balls = 0
    striker_index = 0

    while balls < 120 and wickets < len(team):
        player = team[striker_index]

        balls += 1
        over = balls // 6

        # Base weights
        if over < 6:
            weights = [25, 30, 10, 20, 10, 5]
        elif over < 16:
            weights = [35, 35, 10, 10, 3, 7]
        else:
            weights = [20, 25, 10, 20, 15, 10]

        # 🔥 MODIFY BASED ON PLAYER
        aggression_boost = player["agg"] / 100

        weights[3] *= aggression_boost   # 4s
        weights[4] *= aggression_boost   # 6s
        weights[5] *= (1.2 - aggression_boost)  # wickets

        outcome = random.choices(
            ["dot", "1", "2", "4", "6", "wicket"],
            weights=weights
        )[0]

        if outcome == "wicket":
            wickets += 1
            striker_index += 1
            if striker_index >= len(team):
                break
            

        elif outcome == "dot":
            continue

        else:
            runs = int(outcome)
            total_runs += int(runs * venue_factor)

            # strike rotation
            if runs % 2 == 1:
                pass  # change striker later (optional logic)

    return total_runs, wickets

    venue = "Wankhede"
    factor = venues[venue]["batting"]
    score1, wk1 = play_innings(teams["RCB"], factor)
    score2, wk2 = play_innings(teams["MI"], factor)

    winner = "RCB" if score1 > score2 else "MI"

    return {
        "team1": "RCB",
        "score1": f"{score1}/{wk1}",
        "team2": "MI",
        "score2": f"{score2}/{wk2}",
        "winner": winner
    }
