from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import random
app = FastAPI()

@app.get("/")
def home():
    return {"message": "IPL Simulator API is running 🚀"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= DATA =================
import os
PITCHES = [
    {"name": "Mumbai", "bat": 1.2, "spin": 0.8, "pace": 1.0},
    {"name": "Chennai", "bat": 0.9, "spin": 1.3, "pace": 0.9},
    {"name": "Bangalore", "bat": 1.4, "spin": 0.8, "pace": 1.0},
    {"name": "Kolkata", "bat": 1.1, "spin": 1.2, "pace": 0.9},
]
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(BASE_DIR, "data", "ipl_2026.csv")

df = pd.read_csv(csv_path)

teams = {}
for _, row in df.iterrows():
    teams.setdefault(row["team"], []).append({
        "name": row["name"],
        "role": row["role"],
        "bat": random.randint(50, 95),
        "bowl": random.randint(40, 90),
        "agg": random.randint(50, 95)
    })

TEAM_NAMES = list(teams.keys())

# ================= ENGINE =================
def toss(team1, team2):
    winner = random.choice([team1, team2])
    decision = random.choice(["bat", "bowl"])
    return winner, decision
def simulate_ball(p, pitch):
    base = p["bat"] * pitch["bat"]

    outcomes = ["dot","1","2","4","6","wicket"]

    weights = [
        25,
        30,
        10,
        base * 0.25,
        base * 0.15,
        20 - (p["bat"] * 0.1)
    ]

    return random.choices(outcomes, weights=weights)[0]

def play_match(xi, impact=None):
    pitch = random.choice(PITCHES)

    score, wk, log = 0, 0, []
    striker = 0

    for ball in range(120):

        if striker >= len(xi):
            break

        player = xi[striker]

        res = simulate_ball(player, pitch)

        if res == "wicket":
            wk += 1
            log.append(f"{player['name']} OUT")

            # IMPACT PLAYER
            if impact and wk == 3:
                xi.append(impact)
                log.append(f"Impact Player {impact['name']} IN")

            striker += 1

        elif res != "dot":
            runs = int(res)
            score += runs

            if runs == 4:
                log.append(f"{player['name']} hits FOUR")
            elif runs == 6:
                log.append(f"{player['name']} hits SIX")

    return score, wk, log, pitch["name"]

# ================= QUICK MATCH =================
@app.post("/quick-match")
def quick_match():
    t1, t2 = random.sample(TEAM_NAMES, 2)
    xi1 = teams[t1][:11]
    xi2 = teams[t2][:11]

    s1, _, _ = play_match(xi1)
    s2, _, _ = play_match(xi2)

    return {
        "team1": t1,
        "team2": t2,
        "score1": s1,
        "score2": s2,
        "winner": t1 if s1 > s2 else t2
    }

# ================= TOURNAMENT =================
@app.get("/teams")
def get_teams():
    return TEAM_NAMES

@app.get("/team/{team}")
def get_team(team: str):
    return teams.get(team, [])
@app.post("/real-match")
def real_match(data: dict):
    xi = data["xi"]
    impact = data.get("impact")

    score, wk, log, pitch = play_match(xi, impact)

    return {
        "score": f"{score}/{wk}",
        "pitch": pitch,
        "log": log[-10:]
    }
@app.post("/tournament-match")
def tournament_match(data: dict):
    xi_names = data["xi"]

    # convert names → player objects
    all_players = sum(teams.values(), [])

    xi = []
    for name in xi_names:
        player = next((p for p in all_players if p["name"] == name), None)
        if player:
            xi.append(player)

    score, wk, log = play_match(xi)

    return {
        "score": f"{score}/{wk}",
        "log": log[-5:]
    }

# ================= CAREER MODE =================
player = {
    "name": "",
    "runs": 0,
    "matches": 0,
    "agg": 75
}

@app.post("/create-player")
def create_player(name: str):
    player["name"] = name
    player["runs"] = 0
    player["matches"] = 0
    return {"msg": "created"}

@app.get("/career-match")
def career_match():
    runs = random.randint(10, player["agg"])
    player["runs"] += runs
    player["matches"] += 1

    return {
        "runs": runs,
        "stats": player
    }

@app.post("/press")
def press(choice: str):
    if choice == "confident":
        player["agg"] += 5
    else:
        player["agg"] -= 2

    return player
