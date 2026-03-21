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

# ================= LOAD DATA =================
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

# ================= HELPERS =================
def get_phase(over):
    if over < 6:
        return "powerplay"
    elif over < 15:
        return "middle"
    return "death"

def pick_bowlers(xi):
    bowlers = []

    for p in xi:
        if p.get("role") in ["BOWL", "AR"]:
            bowler = {
                "name": p["name"],
                "role": p["role"],
                "bat": p["bat"],
                "bowl": p["bowl"],
                "agg": p["agg"],
                "overs": 0  # ✅ FORCE
            }
            bowlers.append(bowler)

    # fallback (VERY IMPORTANT)
    if len(bowlers) == 0:
        for p in xi[:5]:
            bowler = {
                "name": p["name"],
                "role": p["role"],
                "bat": p["bat"],
                "bowl": p["bowl"],
                "agg": p["agg"],
                "overs": 0
            }
            bowlers.append(bowler)

    return bowlers

def calculate_pressure(score, target, balls_left):
    if target == 0:
        return 1.0

    runs_needed = target - score
    if runs_needed <= 0:
        return 0.8

    rrr = runs_needed / (balls_left / 6)

    if rrr < 6:
        return 0.9
    elif rrr < 9:
        return 1.0
    elif rrr < 12:
        return 1.2
    else:
        return 1.5

def simulate_ball(batter, bowler, phase, pressure):
    bat = batter["bat"]
    bowl = bowler["bowl"]

    if phase == "powerplay":
        bat *= 1.1
    elif phase == "death":
        bat *= 1.2
        bowl *= 1.1

    bat /= pressure

    outcomes = ["dot","1","2","4","6","wicket"]

    weights = [
        30 + bowl * 0.2,
        35,
        10,
        bat * 0.25,
        bat * 0.15,
        15 + bowl * 0.25
    ]

    return random.choices(outcomes, weights=weights)[0]

# ================= INNINGS =================
def play_innings(xi, target=0):
    score = 0
    wickets = 0
    log = []

    striker = 0
    non_striker = 1

    bowlers = pick_bowlers(xi)

    # 🔥 NEW
    batter_stats = {p["name"]: {"runs": 0, "balls": 0} for p in xi}
    bowler_stats = {b["name"]: {"runs": 0, "balls": 0, "wickets": 0} for b in bowlers}

    for over in range(20):

        phase = get_phase(over)
        bowler = min(bowlers, key=lambda x: x.get("overs", 0))
        bowler["overs"] += 1

        for ball in range(6):

            if striker >= len(xi):
                break

            balls_left = max((20 - over) * 6 - ball - 1, 1)
            pressure = calculate_pressure(score, target, balls_left)

            batter = xi[striker]

            res = simulate_ball(batter, bowler, phase, pressure)

            # update balls
            batter_stats[batter["name"]]["balls"] += 1
            bowler_stats[bowler["name"]]["balls"] += 1

            if res == "wicket":
                wickets += 1
                bowler_stats[bowler["name"]]["wickets"] += 1
                log.append(f"{batter['name']} OUT ({bowler['name']})")

                next_batter = max(striker, non_striker) + 1
                if next_batter >= len(xi):
                    break
                striker = next_batter

            elif res != "dot":
                runs = int(res)

                score += runs
                batter_stats[batter["name"]]["runs"] += runs
                bowler_stats[bowler["name"]]["runs"] += runs

                if runs == 4:
                    log.append(f"{batter['name']} hits FOUR")
                elif runs == 6:
                    log.append(f"{batter['name']} hits SIX")

                if target and score >= target:
                    return score, wickets, log, batter_stats, bowler_stats

                if runs % 2 == 1:
                    striker, non_striker = non_striker, striker

            else:
                bowler_stats[bowler["name"]]["runs"] += 0

        striker, non_striker = non_striker, striker

        if wickets >= 10:
            break

    return score, wickets, log, batter_stats, bowler_stats

# ================= FULL MATCH =================
def play_full_match(team1_xi, team2_xi):

    s1, w1, log1, bat1, bowl1 = play_innings(team1_xi)
    target = s1 + 1

    s2, w2, log2, bat2, bowl2 = play_innings(team2_xi, target)

    winner = "You" if s2 >= target else "Opponent"

    return {
        "innings1": f"{s1}/{w1}",
        "innings2": f"{s2}/{w2}",
        "target": target,
        "winner": winner,
        "log": (log1 + log2)[-10:],
        "batting1": bat1,
        "batting2": bat2,
        "bowling1": bowl1,
        "bowling2": bowl2
    }

# ================= ROUTES =================

@app.get("/teams")
def get_teams():
    return TEAM_NAMES

@app.get("/team/{team}")
def get_team(team: str):
    return teams.get(team, [])

@app.post("/tournament-match")
def tournament_match(data: dict):
    try:
        xi = data["xi"]

        if len(xi) != 11:
            return {"error": "Select 11 players"}

        opponent_team = random.choice(TEAM_NAMES)
        opponent_xi = teams[opponent_team][:11]

        return play_full_match(xi, opponent_xi)

    except Exception as e:
        return {"error": str(e)}

# ================= QUICK MATCH =================
@app.post("/quick-match")
def quick_match():
    t1, t2 = random.sample(TEAM_NAMES, 2)
    xi1 = teams[t1][:11]
    xi2 = teams[t2][:11]

    result = play_full_match(xi1, xi2)

    return {
        "team1": t1,
        "team2": t2,
        **result
    }

# ================= CAREER MODE =================
career = {"name": "", "runs": 0, "matches": 0, "form": 70}

@app.post("/create-player")
def create_player(data: dict):
    career["name"] = data["name"]
    career["runs"] = 0
    career["matches"] = 0
    career["form"] = 70
    return career

@app.get("/career-match")
def career_match():
    runs = random.randint(0, career["form"])
    career["runs"] += runs
    career["matches"] += 1
    return {"match_runs": runs, "career": career}

@app.post("/press")
def press(data: dict):
    if data["choice"] == "confident":
        career["form"] += 5
    else:
        career["form"] -= 3
    return career
