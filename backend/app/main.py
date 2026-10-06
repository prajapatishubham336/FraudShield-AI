from pathlib import Path
import sqlite3
import json
import math
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "model" / "fraudshield.joblib"
DB_PATH = ROOT / "data" / "fraudshield.db"

app = FastAPI(title="FraudShield AI", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], 
                   allow_credentials=True, 
                   allow_methods=["*"], 
                   allow_headers=["*"])

class Transaction(BaseModel):
    amt: float = Field(gt=0)
    category: str = "unknown"
    gender: str = "unknown"
    city_pop: float = 0
    lat: float = 0
    long: float = 0
    merch_lat: float = 0
    merch_long: float = 0
    trans_date_trans_time: str = ""
    state: str = "unknown"
    job: str = "unknown"


def db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(DB_PATH)
    con.execute("CREATE TABLE IF NOT EXISTS predictions(id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, amount REAL, probability REAL, risk TEXT, action TEXT, reasons TEXT)")
    return con


def distance_km(lat1, lon1, lat2, lon2):
    p = math.pi / 180
    a = 0.5 - math.cos((lat2-lat1)*p)/2 + math.cos(lat1*p)*math.cos(lat2*p)*(1-math.cos((lon2-lon1)*p))/2
    return 6371 * 2 * math.asin(math.sqrt(max(0, a)))


def feature_frame(t: Transaction):
    dt = pd.to_datetime(t.trans_date_trans_time, errors="coerce")
    if pd.isna(dt):
        dt = pd.Timestamp.now()
    return pd.DataFrame([{
        "amt": t.amt, "category": t.category, "gender": t.gender, "city_pop": t.city_pop,
        "lat": t.lat, "long": t.long, "merch_lat": t.merch_lat, "merch_long": t.merch_long,
        "state": t.state, "job": t.job, "hour": dt.hour, "dayofweek": dt.dayofweek,
        "month": dt.month, "distance_km": distance_km(t.lat, t.long, t.merch_lat, t.merch_long),
    }])


def explain(t: Transaction, risk_score: int):
    reasons = []
    if t.amt >= 5000: 
        reasons.append("transaction amount is unusually high")
    if t.amt >= 10000: 
        reasons.append("very large transaction value")
    dt = pd.to_datetime(t.trans_date_trans_time, errors="coerce")
    if not pd.isna(dt) and (dt.hour <= 5 or dt.hour >= 23): 
        reasons.append("transaction occurred at an unusual hour")
    d = distance_km(t.lat, t.long, t.merch_lat, t.merch_long)
    if d >= 300: 
        reasons.append("merchant is far from the customer location")
    if t.city_pop >= 1000000 and t.amt > 2000: 
        reasons.append("large transaction in a high-volume population area")
    return reasons[:4] or ["model identified a combination of risk signals"]

@app.get("/api/health")
def health():
    return {"status": "ok", "model_loaded": MODEL_PATH.exists()}

@app.post("/api/predict")
def predict(t: Transaction):
    if not MODEL_PATH.exists():
        raise HTTPException(503, "Model not found. Run: python scripts/train.py --data backend/data/fraudTrain.csv")
    bundle = joblib.load(MODEL_PATH)
    model = bundle["model"]
    threshold = float(bundle.get("threshold", 0.5))

    X = feature_frame(t)
    p = float(model.predict_proba(X)[:, 1][0])
    
    score = int(round(p * 100))
    risk = "HIGH" if score >= 71 else "MEDIUM" if score >= 31 else "LOW"
    action = "BLOCK / MANUAL REVIEW" if p >= threshold else "APPROVE / MONITOR"

    reasons = explain(t, score)
    con = db(); 
    con.execute("INSERT INTO predictions(amount, probability, risk, action, reasons) VALUES (?,?,?,?,?", 
                (t.amt, p, risk, action, json.dumps(reasons))); 
    con.commit(); 
    con.close()
    return {"fraud_probability": round(p, 5), 
            "risk_score": score, 
            "risk_level": risk, 
            "action": action, 
            "reasons": reasons}

@app.get("/api/stats")
def stats():
    con = db(); 
    rows = con.execute("SELECT amount, probability, risk, action, created_at, reasons FROM predictions ORDER BY id DESC LIMIT 100").fetchall(); 
    
    con.close()
    return {"total": len(rows), "high_risk": 
            sum(r[2] == "HIGH" for r in rows), "medium_risk": 
            sum(r[2] == "MEDIUM" for r in rows), "low_risk": 
            sum(r[2] == "LOW" for r in rows), "recent": 
            [{"amount": r[0], "probability": r[1], "risk": r[2], "action": r[3], "created_at": r[4], "reasons": json.loads(r[5])} for r in rows[:10]]}
