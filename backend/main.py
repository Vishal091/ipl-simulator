from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import random
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= LOAD CSV =================
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
def simulate_ball(p):
    outcomes = ["dot","1","2","4","6","wicket"]
    weights = [
        30,
        30,
        10,
        p["bat"] * 0.25,
        p["bat"] * 0.15,
        20
    ]
    return random.choices(outcomes, weights=weights)[0]

def play_match(xi):
    score = 0
    wickets = 0
    log = []
    striker = 0

    for ball in range(120):
        if striker >= len(xi):
            break

        player = xi[striker]
        res = simulate_ball(player)

        if res == "wicket":
            wickets += 1
            log.append(f"{player['name']} OUT")
            striker += 1

        elif res != "dot":
            runs = int(res)
            score += runs

            if runs == 4:
                log.append(f"{player['name']} hits FOUR")
            elif runs == 6:
                log.append(f"{player['name']} hits SIX")

    return score, wickets, log

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

@app.post("/tournament-match")
def tournament_match(data: dict):

    if "xi" not in data or not data["xi"]:
        return {"error": "No XI selected"}

    xi = data["xi"]

    if len(xi) != 11:
        return {"error": "XI must be 11 players"}

    score, wickets, log = play_match(xi)

    return {
        "score": f"{score}/{wickets}",
        "log": log[-10:]
    }

# ================= CAREER MODE =================
career_player = {
    "name": "",
    "runs": 0,
    "matches": 0,
    "form": 70
}

@app.post("/create-player")
def create_player(data: dict):
    career_player["name"] = data["name"]
    career_player["runs"] = 0
    career_player["matches"] = 0
    career_player["form"] = 70
    return {"msg": "Player created", "player": career_player}

@app.get("/career-match")
def career_match():
    runs = random.randint(0, career_player["form"])

    career_player["runs"] += runs
    career_player["matches"] += 1

    return {
        "match_runs": runs,
        "career": career_player
    }

@app.post("/press")
def press(data: dict):
    choice = data["choice"]

    if choice == "confident":
        career_player["form"] += 5
    else:
        career_player["form"] -= 3

    return career_player
