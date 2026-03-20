from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Teams
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

# ✅ Venues
venues = {
    "Wankhede": {"batting": 1.2},
    "Chepauk": {"batting": 0.9}
}

@app.get("/")
def home():
    return {"message": "IPL Simulator API Running"}

# ✅ Innings engine
def play_innings(team, venue_factor, target=None):
    total_runs = 0
    wickets = 0
    balls = 0
    striker_index = 0
    commentary = []

    while balls < 120:

        if striker_index >= len(team):
            break

        player = team[striker_index]
        balls += 1
        over = balls // 6

        # Phase logic
        if over < 6:
            weights = [25, 30, 10, 20, 10, 5]
        elif over < 16:
            weights = [35, 35, 10, 10, 3, 7]
        else:
            weights = [20, 25, 10, 20, 15, 10]

        # Pressure logic
        if target:
            runs_needed = target - total_runs
            balls_left = 120 - balls

            if balls_left > 0:
                required_rr = (runs_needed * 6) / balls_left

                if required_rr > 10:
                    weights[4] *= 1.5
                    weights[5] *= 1.5
                elif required_rr < 6:
                    weights[0] *= 1.2

        # Player aggression
        aggression = player["agg"] / 100
        weights[3] *= aggression
        weights[4] *= aggression
        weights[5] *= (1.2 - aggression)

        outcome = random.choices(
            ["dot", "1", "2", "4", "6", "wicket"],
            weights=weights
        )[0]

        # Commentary + scoring
        if outcome == "6":
            commentary.append(f"{player['name']} smashes a SIX!")
            total_runs += int(6 * venue_factor)

        elif outcome == "4":
            commentary.append(f"{player['name']} finds the boundary!")
            total_runs += int(4 * venue_factor)

        elif outcome == "wicket":
            commentary.append(f"WICKET! {player['name']} is gone!")
            wickets += 1
            striker_index += 1
            continue

        elif outcome != "dot":
            runs = int(outcome)
            total_runs += int(runs * venue_factor)

        # Chase complete
        if target and total_runs >= target:
            commentary.append("CHASE COMPLETED!")
            break

    return total_runs, wickets, commentary

# ✅ Match simulation
@app.post("/simulate")
def simulate_match():
    team1_name = "RCB"
    team2_name = "MI"
    venue_name = "Wankhede"

    venue_factor = venues[venue_name]["batting"]

    score1, wk1, comm1 = play_innings(teams[team1_name], venue_factor)

    target = score1 + 1

    score2, wk2, comm2 = play_innings(
        teams[team2_name], venue_factor, target
    )

    if score2 >= target:
        winner = team2_name
        summary = f"{team2_name} chased it down!"
    else:
        winner = team1_name
        summary = f"{team1_name} defended the total!"

    return {
        "team1": team1_name,
        "score1": f"{score1}/{wk1}",
        "team2": team2_name,
        "score2": f"{score2}/{wk2}",
        "winner": winner,
        "venue": venue_name,
        "summary": summary,
        "commentary": comm1[-3:] + comm2[-5:]
    }
