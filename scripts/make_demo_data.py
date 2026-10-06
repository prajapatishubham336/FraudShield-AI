from pathlib import Path
import numpy as np, pandas as pd

rng=np.random.default_rng(42); 
n=5000
dt=pd.date_range("2026-01-01",periods=n,freq="15min")

amount=np.exp(rng.normal(4.5,1.0,n)); 
night=dt.hour.isin([0,1,2,3,4,23]); 
dist=rng.uniform(2,800,n)

score=(amount>200)*(0.45)+(amount>800)*(0.25)+night*0.2+(dist>350)*0.25+rng.random(n)*0.12
fraud=(score>0.75).astype(int)

df=pd.DataFrame({"trans_date_trans_time":dt,
                 "amt":amount.round(2),
                 "category":rng.choice(["grocery","shopping_net","travel","gas_transport","misc_net"],n),"gender":rng.choice(["M","F"],n),
                 "city_pop":rng.integers(10000,1500000,n),
                 "lat":rng.uniform(8,28,n),
                 "long":rng.uniform(68,88,n),
                 "merch_lat":rng.uniform(8,28,n),
                 "merch_long":rng.uniform(68,88,n),
                 "state":rng.choice(["MH","DL","KA","GJ","RJ","TN"],n),
                 "job":rng.choice(["engineer","teacher","manager","student","doctor","analyst"],n),"is_fraud":fraud})
out=Path(__file__).resolve().parents[1]/"backend/data/fraudTrain_demo.csv"; 
df.to_csv(out,index=False); print(out)
