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
def calculate_pressure(score, target, balls_left):
    if target == 0:
        return 1.0

    runs_needed = target - score
    if runs_needed <= 0:
        return 0.8  # low pressure (already won)

    rrr = runs_needed / (balls_left / 6)

    if rrr < 6:
        return 0.9
    elif rrr < 9:
        return 1.0
    elif rrr < 12:
        return 1.2
    else:
        return 1.5
def pick_bowlers(xi):
    bowlers = []

    for p in xi:
        if p["role"] in ["BOWL", "AR"]:
            bowlers.append({**p, "overs": 0})

    # fallback if no bowlers
    if len(bowlers) < 5:
        bowlers = xi[:5]

    return bowlers
def play_innings(xi, target=0):

    score = 0
    wickets = 0
    log = []

    striker = 0
    non_striker = 1

    bowlers = pick_bowlers(xi)

    for over in range(20):

        phase = get_phase(over)

        bowler = sorted(bowlers, key=lambda x: x["overs"])[0]
        bowler["overs"] += 1

        for ball in range(6):

            balls_left = (20 - over) * 6 - ball

            pressure = calculate_pressure(score, target, balls_left)

            batter = xi[striker]

            res = simulate_ball(batter, bowler, phase, pressure)

            if res == "wicket":
                wickets += 1
                log.append(f"{batter['name']} OUT ({bowler['name']})")
                striker = max(striker, non_striker) + 1

                if striker >= len(xi):
                    break

            elif res != "dot":
                runs = int(res)
                score += runs

                if runs == 4:
                    log.append(f"{batter['name']} hits FOUR")
                elif runs == 6:
                    log.append(f"{batter['name']} hits SIX")

                # chase complete
                if target and score >= target:
                    return score, wickets, log

                if runs % 2 == 1:
                    striker, non_striker = non_striker, striker

        striker, non_striker = non_striker, striker

        if wickets >= 10:
            break

    return score, wickets, log
def play_full_match(team1_xi, team2_xi):

    # toss
    first, second = team1_xi, team2_xi

    # innings 1
    s1, w1, log1 = play_innings(first)

    target = s1 + 1

    # innings 2
    s2, w2, log2 = play_innings(second, target)

    winner = "Team 1" if s1 > s2 else "Team 2"

    return {
        "innings1": f"{s1}/{w1}",
        "innings2": f"{s2}/{w2}",
        "target": target,
        "winner": winner,
        "log": (log1 + log2)[-15:]
    }
def get_phase(over):
    if over < 6:
        return "powerplay"
    elif over < 15:
        return "middle"
    return "death"
def simulate_ball(batter, bowler, phase, pressure):
    bat = batter["bat"]
    bowl = bowler["bowl"]

    # phase boost
    if phase == "powerplay":
        bat *= 1.1
    elif phase == "death":
        bat *= 1.2
        bowl *= 1.1

    # pressure effect
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
def play_match(xi):

    score = 0
    wickets = 0
    log = []

    striker = 0
    non_striker = 1

    bowlers = pick_bowlers(xi)

    for over in range(20):

        phase = get_phase(over)

        # pick bowler (least overs bowled)
        bowler = sorted(bowlers, key=lambda x: x["overs"])[0]
        bowler["overs"] += 1

        for ball in range(6):

            if striker >= len(xi):
                break

            batter = xi[striker]

            res = simulate_ball(batter, bowler, phase)

            if res == "wicket":
                wickets += 1
                log.append(f"{batter['name']} OUT ({bowler['name']})")
                striker = max(striker, non_striker) + 1

                if striker >= len(xi):
                    break

            elif res != "dot":
                runs = int(res)
                score += runs

                if runs == 4:
                    log.append(f"{batter['name']} hits FOUR")
                elif runs == 6:
                    log.append(f"{batter['name']} hits SIX")

                # strike rotation
                if runs % 2 == 1:
                    striker, non_striker = non_striker, striker

        # over end strike change
        striker, non_striker = non_striker, striker

        if wickets >= 10:
            break

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

    xi = data["xi"]

    if len(xi) != 11:
        return {"error": "Select 11 players"}

    # random opponent
    opponent_team = random.choice(TEAM_NAMES)
    opponent_xi = teams[opponent_team][:11]

    result = play_full_match(xi, opponent_xi)

    return result

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
