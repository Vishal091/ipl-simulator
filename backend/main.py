from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

# -------- CORS --------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------- DATA --------
teams = {
    "RCB": [{"name": "Kohli", "agg": 70}, {"name": "Maxwell", "agg": 95}],
    "MI": [{"name": "Rohit", "agg": 70}, {"name": "Sky", "agg": 90}],
    "CSK": [{"name": "Dhoni", "agg": 80}, {"name": "Jadeja", "agg": 75}],
    "KKR": [{"name": "Russell", "agg": 95}, {"name": "Rinku", "agg": 90}],
    "DC": [{"name": "Warner", "agg": 75}, {"name": "Pant", "agg": 90}],
    "SRH": [{"name": "Head", "agg": 95}, {"name": "Markram", "agg": 80}],
    "RR": [{"name": "Buttler", "agg": 95}, {"name": "Samson", "agg": 85}],
    "PBKS": [{"name": "Dhawan", "agg": 70}, {"name": "Livingstone", "agg": 95}],
    "GT": [{"name": "Gill", "agg": 80}, {"name": "Miller", "agg": 90}],
    "LSG": [{"name": "KL Rahul", "agg": 70}, {"name": "Stoinis", "agg": 90}],
}

venues = {"Wankhede": {"batting": 1.2}}
tournament_teams = list(teams.keys())

# -------- CAREER --------
player_profile = {
    "name": "",
    "team": "RCB",
    "agg": 75,
    "runs": 0,
    "matches": 0,
    "form": "Normal"
}

@app.get("/")
def home():
    return {"message": "IPL Simulator Running"}

# -------- ENGINE --------
def play_innings(team, factor, target=None):
    total = 0
    wickets = 0
    balls = 0
    i = 0

    while balls < 120:
        if i >= len(team):
            break

        player = team[i]
        balls += 1

        outcome = random.choice(["dot", "1", "2", "4", "6", "wicket"])

        if outcome == "wicket":
            wickets += 1
            i += 1
            continue
        elif outcome != "dot":
            total += int(outcome) * factor

        if target and total >= target:
            break

    return int(total), wickets

def simulate_game(t1, t2):
    factor = venues["Wankhede"]["batting"]

    s1, _ = play_innings(teams[t1], factor)
    target = s1 + 1
    s2, _ = play_innings(teams[t2], factor, target)

    return t2 if s2 >= target else t1

# -------- MATCH MODE --------
@app.post("/simulate")
def simulate_match():
    t1, t2 = "RCB", "MI"
    factor = venues["Wankhede"]["batting"]

    s1, w1 = play_innings(teams[t1], factor)
    target = s1 + 1
    s2, w2 = play_innings(teams[t2], factor, target)

    winner = t2 if s2 >= target else t1

    return {
        "team1": t1,
        "score1": f"{s1}/{w1}",
        "team2": t2,
        "score2": f"{s2}/{w2}",
        "winner": winner
    }

# -------- TOURNAMENT --------
def run_league():
    table = {t: {"pts": 0} for t in tournament_teams}

    for i in range(len(tournament_teams)):
        for j in range(i + 1, len(tournament_teams)):
            t1 = tournament_teams[i]
            t2 = tournament_teams[j]

            winner = simulate_game(t1, t2)
            table[winner]["pts"] += 2

    sorted_table = sorted(table.items(), key=lambda x: x[1]["pts"], reverse=True)
    return [t for t, _ in sorted_table[:4]], sorted_table

def run_playoffs(top4):
    q1 = simulate_game(top4[0], top4[1])
    elim = simulate_game(top4[2], top4[3])
    q2 = simulate_game(top4[1], elim)
    final = simulate_game(q1, q2)

    return {
        "qualifier1": q1,
        "eliminator": elim,
        "qualifier2": q2,
        "champion": final
    }

@app.get("/tournament")
def full_ipl():
    top4, table = run_league()
    playoffs = run_playoffs(top4)

    return {
        "points_table": table,
        "top4": top4,
        "playoffs": playoffs
    }

# -------- CAREER MODE --------
@app.post("/create-player")
def create_player(name: str):
    player_profile["name"] = name
    player_profile["runs"] = 0
    player_profile["matches"] = 0
    player_profile["agg"] = 75
    player_profile["form"] = "Normal"

    return {"message": f"{name} created"}

@app.get("/career-match")
def career_match():
    team = player_profile["team"]
    opponent = "MI"

    s1 = random.randint(140, 200)
    s2 = random.randint(140, 200)

    player_runs = random.randint(10, player_profile["agg"])

    player_profile["runs"] += player_runs
    player_profile["matches"] += 1

    if player_runs >= 50:
        player_profile["form"] = "🔥 In Form"
    elif player_runs <= 20:
        player_profile["form"] = "🥶 Out of Form"
    else:
        player_profile["form"] = "Normal"

    result = "Won" if s1 > s2 else "Lost"

    return {
        "team_score": s1,
        "opp_score": s2,
        "player_runs": player_runs,
        "result": result,
        "stats": player_profile
    }

@app.post("/press-answer")
def press_answer(choice: str):
    if choice == "confident":
        player_profile["agg"] += 5
    elif choice == "humble":
        player_profile["agg"] -= 2

    return {"agg": player_profile["agg"]}
