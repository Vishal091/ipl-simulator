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

# ================= GLOBAL STATE =================
tournament = {
    "teams": [],
    "points": {},
    "schedule": [],
    "results": []
}

# ================= ROLE MAP =================
def map_role(role):
    role = str(role).lower()
    if "bat" in role: return "BAT"
    if "bowl" in role: return "BOWL"
    if "allround" in role: return "AR"
    if "wicket" in role: return "WK"
    return "BAT"

# ================= RATINGS =================
def generate_player_stats(role):
    if role == "BAT":
        bat = random.randint(78, 96); bowl = random.randint(20, 45)
    elif role == "BOWL":
        bat = random.randint(20, 45); bowl = random.randint(78, 96)
    elif role == "AR":
        bat = random.randint(65, 88); bowl = random.randint(65, 88)
    elif role == "WK":
        bat = random.randint(72, 92); bowl = random.randint(20, 40)
    else:
        bat = random.randint(50, 70); bowl = random.randint(50, 70)

    agg = int((bat * 0.65) + (bowl * 0.35))
    return bat, bowl, agg

# ================= BASIC APIs =================
@app.get("/teams")
def get_teams():
    return list(df["team"].unique())

@app.get("/team/{team}")
def get_team(team: str):
    team_df = df[df["team"] == team]
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

# ================= MATCH ENGINE =================
def simulate_ball(bat, bowl):
    diff = bat - bowl

    if diff > 25:
        return random.choices(["6","4","2","1","OUT"], [20,30,20,20,10])[0]
    elif diff > 10:
        return random.choices(["4","2","1","OUT","0"], [25,25,25,10,15])[0]
    else:
        return random.choices(["1","0","OUT","2"], [30,30,20,20])[0]

def play_innings(team, target=None):
    score, wickets, balls = 0, 0, 0

    batters = team.copy()
    bowlers = team.copy()

    for b in bowlers:
        b["overs"] = 0

    striker, non_striker = batters[0], batters[1]
    next_idx = 2

    while balls < 120 and wickets < 10:
        bowler = sorted(bowlers, key=lambda x: x["overs"])[0]
        result = simulate_ball(striker["bat"], bowler["bowl"])

        if result == "OUT":
            wickets += 1
            if next_idx < len(batters):
                striker = batters[next_idx]
                next_idx += 1
            else:
                break
        else:
            runs = int(result)
            score += runs
            if runs % 2:
                striker, non_striker = non_striker, striker

        balls += 1
        bowler["overs"] += 1

        if target and score >= target:
            break

        if balls % 6 == 0:
            striker, non_striker = non_striker, striker

    return score, wickets

def play_full_match(t1, t2):
    s1, w1 = play_innings(t1)
    target = s1 + 1
    s2, w2 = play_innings(t2, target)

    winner = "Team 2" if s2 >= target else "Team 1"

    return {
        "innings1": f"{s1}/{w1}",
        "innings2": f"{s2}/{w2}",
        "target": target,
        "winner": winner
    }

# ================= TOURNAMENT =================
@app.post("/init-tournament")
def init():
    teams = list(df["team"].unique())

    tournament["teams"] = teams
    tournament["points"] = {
        t: {"played": 0, "wins": 0, "points": 0}
        for t in teams
    }

    schedule = []
    for i in range(len(teams)):
        for j in range(i+1, len(teams)):
            schedule.append({
                "team1": teams[i],
                "team2": teams[j],
                "played": False
            })

    random.shuffle(schedule)

    tournament["schedule"] = schedule
    tournament["results"] = []

    return {"message": "Tournament initialized"}

# ================= POINTS =================
def update_points(t1, t2, winner):
    tournament["points"][t1]["played"] += 1
    tournament["points"][t2]["played"] += 1

    if winner == "Team 1":
        tournament["points"][t1]["wins"] += 1
        tournament["points"][t1]["points"] += 2
    else:
        tournament["points"][t2]["wins"] += 1
        tournament["points"][t2]["points"] += 2

# ================= SIMULATION FIX =================
def simulate_other_matches(user_team, limit=5):
    count = 0

    for m in tournament["schedule"]:
        if count >= limit:
            break

        if m["played"]:
            continue

        if user_team in [m["team1"], m["team2"]]:
            continue

        t1, t2 = m["team1"], m["team2"]
        winner = random.choice([t1, t2])

        update_points(t1, t2, winner)

        m["played"] = True
        count += 1

        tournament["results"].append({
            "team1": t1,
            "team2": t2,
            "winner": winner
        })

# ================= PLAY MATCH =================
@app.post("/tournament-match")
def play(data: dict):
    user_team = data.get("team")
    xi = data.get("xi")

    if not user_team or not xi:
        return {"error": "Invalid input"}

    match = next(
        (m for m in tournament["schedule"]
         if not m["played"] and user_team in [m["team1"], m["team2"]]),
        None
    )

    if not match:
        return {
            "error": "No matches left",
            "points": tournament["points"]
        }

    opponent = match["team2"] if match["team1"] == user_team else match["team1"]

    opp_df = df[df["team"] == opponent]
    opp_xi = []

    for _, row in opp_df.sample(11).iterrows():
        role = map_role(row["role"])
        bat, bowl, agg = generate_player_stats(role)

        opp_xi.append({
            "name": row["name"],
            "role": role,
            "bat": bat,
            "bowl": bowl,
            "agg": agg
        })

    result = play_full_match(xi, opp_xi)

    update_points(user_team, opponent, result["winner"])

    match["played"] = True

    tournament["results"].append({
        "team1": user_team,
        "team2": opponent,
        "result": result
    })

    # 🔥 FIXED (gradual sim)
    simulate_other_matches(user_team, limit=5)

    return {
        "match": result,
        "points": tournament["points"]
    }

# ================= STATUS =================
@app.get("/tournament-status")
def status():
    return tournament
