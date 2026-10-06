import argparse, json, warnings
from pathlib import Path
import numpy as np
import pandas as pd
import joblib
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import average_precision_score, roc_auc_score, precision_recall_curve, f1_score, fbeta_score, precision_score, recall_score, confusion_matrix
from xgboost import XGBClassifier
warnings.filterwarnings("ignore")

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "backend" / "model"; 
OUT.mkdir(parents=True, exist_ok=True)

BASE = ["amt","category","gender","city_pop","lat","long","merch_lat","merch_long",
        "state","job","hour","dayofweek","month","distance_km"]

def engineer(df):
    df = df.copy()
    # Accept common dataset naming variants.
    ren = {"transaction_amount":"amt", "trans_amount":"amt", "isFraud":"is_fraud"}
    df.rename(columns={k:v for k,v in ren.items() if k in df.columns}, inplace=True)

    if "is_fraud" not in df: raise ValueError("Target column is_fraud not found.")
    dt_col = "trans_date_trans_time" if "trans_date_trans_time" in df else None

    if dt_col:
        dt = pd.to_datetime(df[dt_col], errors="coerce")
        df["hour"], df["dayofweek"], df["month"] = dt.dt.hour, dt.dt.dayofweek, dt.dt.month
    else:
        df["hour"], df["dayofweek"], df["month"] = 12, 0, 1
    for c in ["amt","city_pop","lat","long","merch_lat","merch_long"]:
        if c not in df: df[c] = 0
    for c in ["category","gender","state","job"]:
        if c not in df: df[c] = "unknown"
    p = np.pi/180
    a = 0.5 - np.cos((df.merch_lat-df.lat)*p)/2 + np.cos(df.lat*p)*np.cos(df.merch_lat*p)*(1-np.cos((df.merch_long-df.long)*p))/2
    df["distance_km"] = 6371*2*np.arcsin(np.sqrt(np.clip(a, 0, 1)))
    return df

def make_xy(df):
    y = df["is_fraud"].astype(int)
    X = df[[c for c in BASE if c in df.columns]].copy()
    return X, y

def split_time(df):
    if "trans_date_trans_time" in df:
        d = pd.to_datetime(df["trans_date_trans_time"], errors="coerce")
        df = df.assign(_dt=d).sort_values("_dt").drop(columns="_dt")
    n=len(df); 
    a=int(n*.70); 
    b=int(n*.85)
    return df.iloc[:a], df.iloc[a:b], df.iloc[b:]

def preprocess():
    num=["amt","city_pop","lat","long","merch_lat","merch_long","hour","dayofweek","month","distance_km"]
    cat=["category","gender","state","job"]
    try: 
        enc=OneHotEncoder(handle_unknown="ignore", min_frequency=10, sparse_output=True)
    except TypeError: 
        enc=OneHotEncoder(handle_unknown="ignore", min_frequency=10, sparse=True)
    return ColumnTransformer([("num", Pipeline([("impute",SimpleImputer(strategy="median")),
                                                ("scale",StandardScaler())]), num), 
                                                ("cat", Pipeline([("impute",SimpleImputer(strategy="most_frequent")),("onehot",enc)]), cat)])

def evaluate(name, model, Xtr,ytr,Xv,yv):
    model.fit(Xtr,ytr); 
    p=model.predict_proba(Xv)[:,1]
    return name, model, {"pr_auc":average_precision_score(yv,p),
                         "roc_auc":roc_auc_score(yv,p),
                         "recall@0.5":recall_score(yv,p>=.5,zero_division=0),
                         "precision@0.5":precision_score(yv,p>=.5,zero_division=0)}

def tune_threshold(model,Xv,yv):
    p=model.predict_proba(Xv)[:,1]; best=(.5,-1)
    for t in np.arange(.05,.96,.01):
        s=fbeta_score(yv,p>=t,beta=2,zero_division=0)
        if s>best[1]: best=(float(t),float(s))
    return best

def main(path,max_rows):
    df=pd.read_csv(path)
    if max_rows and len(df)>max_rows: 
        df=df.sample(max_rows, random_state=42)
    df=engineer(df)
    tr,va,te=split_time(df)
    Xtr,ytr=make_xy(tr); 
    Xv,yv=make_xy(va); Xt,yt=make_xy(te)
    pos=max(1,int(ytr.sum())); 
    neg=max(1,int(len(ytr)-ytr.sum())); spw=neg/pos
    candidates=[
      ("logistic",LogisticRegression(max_iter=500,class_weight="balanced")),
      ("random_forest",RandomForestClassifier(n_estimators=220,
                                              min_samples_leaf=3,
                                              class_weight="balanced_subsample",
                                              n_jobs=-1,random_state=42)),
      ("xgboost",XGBClassifier(n_estimators=350,
                               max_depth=7,
                               learning_rate=.06,
                               subsample=.85,
                               colsample_bytree=.85,
                               reg_lambda=2,
                               scale_pos_weight=spw,
                               tree_method="hist",
                               eval_metric="aucpr",
                               n_jobs=-1,random_state=42)),
    ]
    results=[]; 
    fitted={}
    for name,clf in candidates:
        pipe=Pipeline([("prep",preprocess()),("model",clf)])
        name,fit,metrics=evaluate(name,pipe,Xtr,ytr,Xv,yv); 
        
        results.append({"model":name,**metrics}); fitted[name]=fit
        print(name,metrics)
        
    best_name=max(results,key=lambda x:x["pr_auc"])["model"]
    best=fitted[best_name]
    threshold,fb=tune_threshold(best,Xv,yv)
    p=best.predict_proba(Xt)[:,1]; pred=p>=threshold


    test={"pr_auc":average_precision_score(yt,p),
          "roc_auc":roc_auc_score(yt,p),
          "precision":precision_score(yt,pred,zero_division=0),
          "recall":recall_score(yt,pred,zero_division=0),
          "f1":f1_score(yt,pred,zero_division=0),
          "f2":fbeta_score(yt,pred,beta=2,zero_division=0),
          "confusion_matrix":confusion_matrix(yt,pred).tolist()}
    
    bundle={"model":best,
            "threshold":threshold,
            "features":BASE,
            "best_model":best_name,
            "validation_results":results,
            "test_results":test}
    
    joblib.dump(bundle,OUT/"fraudshield.joblib")
    (OUT/"metrics.json").write_text(json.dumps({"best_model":best_name,
                                                "threshold":threshold,
                                                "validation":results,
                                                "test":test},indent=2))
    print("Saved",OUT/"fraudshield.joblib")
    print("Best",best_name,"threshold",threshold,"test",test)

if __name__=="__main__":
    ap=argparse.ArgumentParser(); 
    ap.add_argument("--data",required=True); 
    ap.add_argument("--max-rows",type=int,default=300000); 
    args=ap.parse_args(); main(args.data,args.max_rows)
