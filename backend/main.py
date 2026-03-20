from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

# ✅ CORS (required for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Teams with player attributes
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

# ✅ Venue impact
venues = {
    "Wankhede": {"batting": 1.2},
    "Chepauk": {"batting": 0.9}
}

@app.get("/")
def home():
    return {"message": "IPL Simulator API Running"}

# ✅ Core innings simulation
def play_innings(team, venue_factor, target=None):
    total_runs = 0
    wickets = 0
    balls = 0
    striker_index = 0

    while balls < 120:

        if striker_index >= len(team):
            break

        player = team[striker_index]

        balls += 1
        over = balls // 6

        # Phase weights
        if over < 6:
            weights = [25, 30, 10, 20, 10, 5]
        elif over < 16:
            weights = [35, 35, 10, 10, 3, 7]
        else:
            weights = [20, 25, 10, 20, 15, 10]

        # 🔥 CHASING PRESSURE
        if target:
            runs_needed = target - total_runs
            balls_left = 120 - balls

            if balls_left > 0:
                required_rr = (runs_needed * 6) / balls_left

                if required_rr > 10:
                    weights[4] *= 1.5  # more 6s
                    weights[5] *= 1.5  # more wickets
                elif required_rr < 6:
                    weights[0] *= 1.2  # more dots (safe play)

        # Player aggression
        aggression = player["agg"] / 100

        weights[3] *= aggression
        weights[4] *= aggression
        weights[5] *= (1.2 - aggression)

        outcome = random.choices(
            ["dot", "1", "2", "4", "6", "wicket"],
            weights=weights
        )[0]

        if outcome == "wicket":
            wickets += 1
            striker_index += 1
            continue

        elif outcome == "dot":
            continue

        else:
            runs = int(outcome)
            total_runs += int(runs * venue_factor)

        # ✅ WIN CONDITION (CHASE COMPLETE)
        if target and total_runs >= target:
            break

    return total_runs, wickets

# ✅ Match simulation
@app.post("/simulate")
def simulate_match():
    team1_name = "RCB"
    team2_name = "MI"
    venue_name = "Wankhede"

    venue_factor = venues[venue_name]["batting"]

    score1, wk1 = play_innings(teams[team1_name], venue_factor)
    target = score1 + 1
    score2, wk2 = play_innings(teams[team2_name], venue_factor, target)

    winner = team1_name if score1 > score2 else team2_name

    return {
        "team1": team1_name,
        "score1": f"{score1}/{wk1}",
        "team2": team2_name,
        "score2": f"{score2}/{wk2}",
        "winner": winner,
        "venue": venue_name
    }
