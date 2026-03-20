from fastapi import FastAPI
import random

app = FastAPI()

@app.get("/")
def home():
    return {"message": "IPL Simulator API Running"}

@app.post("/simulate")
def simulate_match():
    teams = ["RCB", "MI"]

    score1 = random.randint(140, 220)
    score2 = random.randint(140, 220)

    winner = teams[0] if score1 > score2 else teams[1]

    return {
        "team1": teams[0],
        "score1": score1,
        "team2": teams[1],
        "score2": score2,
        "winner": winner
    }
