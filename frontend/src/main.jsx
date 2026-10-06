import React,{useEffect,useState} from 'react';
import{createRoot}from'react-dom/client';
import{ShieldAlert,Activity,TriangleAlert,CheckCircle}from'lucide-react';
import'./style.css';

const API='http://127.0.0.1:8000';

function App(){
  const[form,setForm]=useState({
    amt:85000,
    category:'shopping_net',
    gender:'M',
    city_pop:250000,
    lat:18.52,
    long:73.85,
    merch_lat:19.07,
    merch_long:72.87,
    state:'MH',
    job:'engineer',
    trans_date_trans_time:'2026-10-05 00:30:00'
  });

  const[result,setResult]=useState(null);
  const[stats,setStats]=useState({total:0,high_risk:0,medium_risk:0,low_risk:0});
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState('');

  const update=e=>setForm({...form,[e.target.name]:e.target.value});

  const predict=async()=>{
    setLoading(true);
    setError('');

    try{
      const r=await fetch(`${API}/api/predict`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          ...form,
          amt:+form.amt,
          city_pop:+form.city_pop,
          lat:+form.lat,
          long:+form.long,
          merch_lat:+form.merch_lat,
          merch_long:+form.merch_long
        })
      });

      if(!r.ok){
        throw new Error(`API Error: ${r.status}`);
      }

      const data=await r.json();
      setResult(data);

    }catch(err){
      console.error(err);
      setError('Backend API se connection nahi ho raha. Check FastAPI server.');
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{
    fetch(`${API}/api/stats`)
      .then(r=>r.json())
      .then(setStats)
      .catch(err=>console.error('Stats error:',err));
  },[result]);

  return(
    <div className="app">

      <aside>
        <div className="brand">
          <ShieldAlert/> FraudShield AI
        </div>

        <p className="tag">Risk Intelligence Platform</p>

        <nav>
          <b>Overview</b>
          <span>Transactions</span>
          <span>Fraud Alerts</span>
          <span>Analytics</span>
          <span>Model Monitor</span>
        </nav>
      </aside>

      <main>

        <header>
          <div>
            <h1>Fraud Detection Dashboard</h1>
            <p>Real-time transaction risk analysis</p>
          </div>

          <span className="live">
            <Activity/> LIVE API
          </span>
        </header>

        <section className="cards">
          <Card icon={<Activity/>} label="Analyzed" value={stats.total}/>
          <Card icon={<TriangleAlert/>} label="High Risk" value={stats.high_risk}/>
          <Card icon={<CheckCircle/>} label="Low Risk" value={stats.low_risk}/>
          <Card icon={<ShieldAlert/>} label="Medium Risk" value={stats.medium_risk}/>
        </section>

        <section className="grid">

          <div className="panel">
            <h2>Analyze Transaction</h2>

            <div className="form">
              {Object.keys(form).map(k=>(
                <label key={k}>
                  {k.replaceAll('_',' ')}
                  <input
                    name={k}
                    value={form[k]}
                    onChange={update}
                  />
                </label>
              ))}
            </div>

            <button onClick={predict} disabled={loading}>
              {loading?'Analyzing...':'Analyze Transaction'}
            </button>

            {error&&<div className="error">{error}</div>}
          </div>

          <div className="panel result">
            <h2>Risk Decision</h2>

            {!result ? (
              <div className="empty">
                Submit a transaction to see fraud probability,
                risk score and explainable signals.
              </div>
            ) : (
              <>
                <div className={`risk ${result.risk_level.toLowerCase()}`}>
                  {result.risk_level} RISK
                </div>

                <div className="score">
                  {result.risk_score}<small>/100</small>
                </div>

                <div className="prob">
                  Fraud probability:
                  <b>{(result.fraud_probability*100).toFixed(2)}%</b>
                </div>

                <h3>Recommended Action</h3>
                <div className="action">
                  {result.action}
                </div>

                <h3>Why?</h3>

                <ul>
                  {result.reasons?.map((x,i)=>(
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </>
            )}
          </div>

        </section>

      </main>
    </div>
  );
}

function Card({icon,label,value}){
  return(
    <div className="card">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App/>);