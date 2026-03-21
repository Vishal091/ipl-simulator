from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= DATA =================
df = pd.read_csv("backend/data/ipl_2026.csv")

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
    weights = [30,30,10,p["bat"]*0.2,p["bat"]*0.1,20]
    return random.choices(outcomes, weights=weights)[0]

def play_match(xi):
    score, wk, log = 0, 0, []
    striker = 0

    for ball in range(120):
        if striker >= len(xi): break
        p = xi[striker]
        res = simulate_ball(p)

        if res == "wicket":
            wk += 1
            log.append(f"{p['name']} OUT")
            striker += 1
        elif res != "dot":
            runs = int(res)
            score += runs
            if runs >= 4:
                log.append(f"{p['name']} hits {runs}")

    return score, wk, log

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
    xi = data["xi"]
    mode = data.get("mode", "quick")

    score, wk, log = play_match(xi)

    return {
        "score": f"{score}/{wk}",
        "log": log if mode == "ball" else log[-5:]
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
