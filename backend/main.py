from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import random
import os
app = FastAPI()

# ================= CORS =================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= LOAD DATA =================


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "ipl_2026.csv")

df = pd.read_csv(DATA_PATH)

# ================= ROLE MAP =================
def map_role(role):
    role = role.lower()

    if "bat" in role:
        return "BAT"
    elif "bowl" in role:
        return "BOWL"
    elif "allround" in role:
        return "AR"
    elif "wicket" in role:
        return "WK"
    else:
        return "BAT"

# ================= NEW RATING SYSTEM =================
def generate_player_stats(role):
    if role == "BAT":
        bat = random.randint(78, 96)
        bowl = random.randint(20, 45)

    elif role == "BOWL":
        bat = random.randint(20, 45)
        bowl = random.randint(78, 96)

    elif role == "AR":
        bat = random.randint(65, 88)
        bowl = random.randint(65, 88)

    elif role == "WK":
        bat = random.randint(72, 92)
        bowl = random.randint(20, 40)

    else:
        bat = random.randint(50, 70)
        bowl = random.randint(50, 70)

    agg = int((bat * 0.65) + (bowl * 0.35))
    return bat, bowl, agg

# ================= GET TEAMS =================
@app.get("/teams")
def get_teams():
    return list(df["team"].unique())

# ================= GET TEAM SQUAD =================
@app.get("/team/{team_name}")
def get_team(team_name: str):
    team_df = df[df["team"] == team_name]

    players = []

    for _, row in team_df.iterrows():
        role = map_role(row["role"])
        bat, bowl, agg = generate_player_stats(role)

        players.append({
            "name": row["name"],
            "role": role,
            "bat": bat,
            "bowl": bowl,
            "agg": agg
        })

    return players

# ================= BALL ENGINE =================
def simulate_ball(bat, bowl):
    diff = bat - bowl

    if diff > 25:
        return random.choices(
            ["6", "4", "2", "1", "OUT"],
            weights=[20, 30, 20, 20, 10]
        )[0]

    elif diff > 10:
        return random.choices(
            ["4", "2", "1", "OUT", "0"],
            weights=[25, 25, 25, 10, 15]
        )[0]

    else:
        return random.choices(
            ["1", "0", "OUT", "2"],
            weights=[30, 30, 20, 20]
        )[0]

# ================= INNINGS =================
def play_innings(team, target=None):
    score = 0
    wickets = 0
    balls = 0
    log = []

    batters = team.copy()
    bowlers = team.copy()

    # ADD OVERS FIELD (FIX FOR YOUR ERROR)
    for b in bowlers:
        b["overs"] = 0

    striker = batters[0]
    non_striker = batters[1]
    next_batter_idx = 2

    while balls < 120 and wickets < 10:
        bowler = sorted(bowlers, key=lambda x: x["overs"])[0]

        result = simulate_ball(striker["bat"], bowler["bowl"])

        if result == "OUT":
            wickets += 1
            log.append(f"{striker['name']} OUT!")

            if next_batter_idx < len(batters):
                striker = batters[next_batter_idx]
                next_batter_idx += 1
            else:
                break

        else:
            runs = int(result)
            score += runs
            log.append(f"{striker['name']} scores {runs}")

            if runs % 2 == 1:
                striker, non_striker = non_striker, striker

        balls += 1
        bowler["overs"] += 1

        # CHASE LOGIC
        if target and score >= target:
            break

        # OVER CHANGE
        if balls % 6 == 0:
            striker, non_striker = non_striker, striker

    return score, wickets, log

# ================= FULL MATCH =================
def play_full_match(team1, team2):
    s1, w1, log1 = play_innings(team1)

    target = s1 + 1

    s2, w2, log2 = play_innings(team2, target)

    if s2 >= target:
        winner = "Team 2"
    else:
        winner = "Team 1"

    return {
        "innings1": f"{s1}/{w1}",
        "innings2": f"{s2}/{w2}",
        "target": target,
        "winner": winner,
        "log": log1 + log2
    }

# ================= TOURNAMENT MATCH =================
@app.post("/tournament-match")
def tournament_match(data: dict):
    xi = data.get("xi")

    if not xi or len(xi) != 11:
        return {"error": "Invalid XI"}

    opponent = random.sample(xi, len(xi))

    result = play_full_match(xi, opponent)

    return result
