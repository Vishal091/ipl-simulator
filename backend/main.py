from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/")
def home():
    return {"message": "IPL Simulator API Running"}

# -------- INNINGS --------
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
        over = balls // 6

        if over < 6:
            w = [25, 30, 10, 20, 10, 5]
        elif over < 16:
            w = [35, 35, 10, 10, 3, 7]
        else:
            w = [20, 25, 10, 20, 15, 10]

        if target:
            need = target - total
            left = 120 - balls
            if left > 0:
                rr = (need * 6) / left
                if rr > 10:
                    w[4] *= 1.5
                    w[5] *= 1.5

        agg = player["agg"] / 100
        w[3] *= agg
        w[4] *= agg
        w[5] *= (1.2 - agg)

        outcome = random.choices(
            ["dot", "1", "2", "4", "6", "wicket"], weights=w
        )[0]

        if outcome == "wicket":
            wickets += 1
            i += 1
            continue
        elif outcome != "dot":
            total += int(outcome) * factor

        if target and total >= target:
            break

    return total

# -------- MATCH --------
def simulate_game(t1, t2):
    factor = venues["Wankhede"]["batting"]

    s1 = play_innings(teams[t1], factor)
    target = s1 + 1
    s2 = play_innings(teams[t2], factor, target)

    return t2 if s2 >= target else t1

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
    return [team for team, _ in sorted_table[:4]], sorted_table

# -------- PLAYOFFS --------
def run_playoffs(top4):
    q1_winner = simulate_game(top4[0], top4[1])
    q1_loser = top4[1] if q1_winner == top4[0] else top4[0]

    eliminator_winner = simulate_game(top4[2], top4[3])

    q2_winner = simulate_game(q1_loser, eliminator_winner)

    final_winner = simulate_game(q1_winner, q2_winner)

    return {
        "qualifier1": q1_winner,
        "eliminator": eliminator_winner,
        "qualifier2": q2_winner,
        "champion": final_winner
    }

# -------- API --------
@app.get("/tournament")
def full_ipl():
    top4, table = run_league()
    playoffs = run_playoffs(top4)

    return {
        "points_table": table,
        "top4": top4,
        "playoffs": playoffs
    }
