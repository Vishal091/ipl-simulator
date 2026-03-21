from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TEAMS (All 10 IPL teams)
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

venues = {
    "Wankhede": {"batting": 1.2},
    "Chepauk": {"batting": 0.9}
}

tournament_teams = list(teams.keys())

@app.get("/")
def home():
    return {"message": "IPL Simulator API Running"}

# -------- INNINGS ENGINE --------
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

        # Pressure
        if target:
            runs_needed = target - total_runs
            balls_left = 120 - balls
            if balls_left > 0:
                rr = (runs_needed * 6) / balls_left
                if rr > 10:
                    weights[4] *= 1.5
                    weights[5] *= 1.5
                elif rr < 6:
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

        if outcome == "6":
            commentary.append(f"{player['name']} smashes a SIX!")
            total_runs += int(6 * venue_factor)

        elif outcome == "4":
            commentary.append(f"{player['name']} hits a FOUR!")
            total_runs += int(4 * venue_factor)

        elif outcome == "wicket":
            commentary.append(f"WICKET! {player['name']} is out!")
            wickets += 1
            striker_index += 1
            continue

        elif outcome != "dot":
            total_runs += int(int(outcome) * venue_factor)

        if target and total_runs >= target:
            commentary.append("CHASE COMPLETED!")
            break

    return total_runs, wickets, commentary

# -------- MATCH --------
@app.post("/simulate")
def simulate_match():
    team1 = "RCB"
    team2 = "MI"
    venue = "Wankhede"

    factor = venues[venue]["batting"]

    score1, wk1, comm1 = play_innings(teams[team1], factor)
    target = score1 + 1
    score2, wk2, comm2 = play_innings(teams[team2], factor, target)

    winner = team2 if score2 >= target else team1
    summary = f"{winner} won the match!"

    diff = abs(score1 - score2)
    match_type = "🔥 Thriller!" if diff <= 5 else "😎 Close Match" if diff <= 15 else "🥱 One-sided"

    return {
        "team1": team1,
        "score1": f"{score1}/{wk1}",
        "team2": team2,
        "score2": f"{score2}/{wk2}",
        "winner": winner,
        "venue": venue,
        "summary": summary,
        "match_type": match_type,
        "commentary": comm1[-3:] + comm2[-5:]
    }

# -------- TOURNAMENT --------
def generate_schedule():
    matches = []
    for i in range(len(tournament_teams)):
        for j in range(i + 1, len(tournament_teams)):
            matches.append((tournament_teams[i], tournament_teams[j]))
    return matches

def init_points_table():
    return {
        team: {"played": 0, "won": 0, "lost": 0, "points": 0}
        for team in tournament_teams
    }

def simulate_game(team1, team2):
    factor = venues["Wankhede"]["batting"]
    score1, _, _ = play_innings(teams[team1], factor)
    target = score1 + 1
    score2, _, _ = play_innings(teams[team2], factor, target)
    return team2 if score2 >= target else team1

def run_tournament():
    table = init_points_table()
    matches = generate_schedule()
    results = []

    for t1, t2 in matches:
        winner = simulate_game(t1, t2)

        table[t1]["played"] += 1
        table[t2]["played"] += 1

        if winner == t1:
            table[t1]["won"] += 1
            table[t1]["points"] += 2
            table[t2]["lost"] += 1
        else:
            table[t2]["won"] += 1
            table[t2]["points"] += 2
            table[t1]["lost"] += 1

        results.append({"match": f"{t1} vs {t2}", "winner": winner})

    return {"points_table": table, "matches": results}

@app.get("/tournament")
def tournament():
    return run_tournament()
