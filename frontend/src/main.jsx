import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  LayoutDashboard,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  XCircle,
} from "lucide-react";
import "./style.css";

const API = "https://fraudshield-ai-tz2o.onrender.com";

const defaultForm = {
  amt: 85000,
  category: "shopping_net",
  gender: "M",
  city_pop: 50000,
  lat: 19.07,
  long: 73.0,
  merch_lat: 20.5,
  merch_long: 74.5,
  state: "MH",
  job: "Engineer",
  trans_date_trans_time: "2026-10-06 02:15:00",
};

function App() {
  const [page, setPage] = useState("Overview");
  const [stats, setStats] = useState({
    total: 0,
    high_risk: 0,
    medium_risk: 0,
    low_risk: 0,
    recent: [],
  });

  const [form, setForm] = useState(defaultForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadStats = async () => {
    try {
      const response = await fetch(`${API}/api/stats`);

      if (!response.ok) {
        throw new Error(`Stats request failed: ${response.status}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStats();
    const timer = setInterval(loadStats, 10000);
    return () => clearInterval(timer);
  }, []);

  const analyzeTransaction = async (e) => {
  // Prevent the browser from reloading the React page on form submit.
  if (e) e.preventDefault();

  setLoading(true);
  setError("");

  try {
    const response = await fetch(`${API}/api/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amt: Number(form.amt),
        category: form.category,
        gender: form.gender,
        city_pop: Number(form.city_pop),
        lat: Number(form.lat),
        long: Number(form.long),
        merch_lat: Number(form.merch_lat),
        merch_long: Number(form.merch_long),
        state: form.state,
        job: form.job,
        trans_date_trans_time: form.trans_date_trans_time,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API Error ${response.status}: ${text}`);
    }

    const data = await response.json();

    setResult(data);

    // refresh dashboard statistics
    try {
      const statsResponse = await fetch(`${API}/api/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (e) {
      console.log("Stats refresh failed:", e);
    }

  } catch (error) {
    console.error("Prediction error:", error);
    setError(error.message || "Failed to connect to FraudShield API");
  } finally {
    setLoading(false);
  }
};

  const updateForm = (key, value) => {
    setForm((old) => ({
      ...old,
      [key]: value,
    }));
  };

  const highRiskTransactions = useMemo(
    () => stats.recent?.filter((item) => item.risk === "HIGH") || [],
    [stats]
  );

  const riskPercentage = stats.total
    ? Math.round((stats.high_risk / stats.total) * 100)
    : 0;

  const navItems = [
    {
      name: "Overview",
      icon: LayoutDashboard,
    },
    {
      name: "Transactions",
      icon: Activity,
    },
    {
      name: "Fraud Alerts",
      icon: ShieldAlert,
    },
    {
      name: "Analytics",
      icon: BarChart3,
    },
    {
      name: "Model Monitor",
      icon: BrainCircuit,
    },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <ShieldCheck size={22} />
          </div>

          <div>
            <h2>FraudShield AI</h2>
            <span>Risk Intelligence Platform</span>
          </div>
        </div>

        <nav className="nav">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${
                  page === item.name ? "active" : ""
                }`}
                onClick={() => setPage(item.name)}
              >
                <Icon size={18} />
                <span>{item.name}</span>

                {item.name === "Fraud Alerts" &&
                  stats.high_risk > 0 && (
                    <span className="nav-badge">
                      {stats.high_risk}
                    </span>
                  )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="live-status">
            <span className="live-dot"></span>
            <span>LIVE API</span>
          </div>

          <small>FraudShield AI v1.0</small>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">RISK INTELLIGENCE</p>
            <h1>{page}</h1>
            <p className="subtitle">
              Real-time transaction risk analysis and fraud intelligence
            </p>
          </div>

          <div className="api-pill">
            <span></span>
            API Connected
          </div>
        </header>

        {page === "Overview" && (
          <Overview
            stats={stats}
            result={result}
            form={form}
            updateForm={updateForm}
            analyzeTransaction={analyzeTransaction}
            loading={loading}
            error={error}
          />
        )}

        {page === "Transactions" && (
          <Transactions stats={stats} />
        )}

        {page === "Fraud Alerts" && (
          <FraudAlerts alerts={highRiskTransactions} />
        )}

        {page === "Analytics" && (
          <Analytics
            stats={stats}
            riskPercentage={riskPercentage}
          />
        )}

        {page === "Model Monitor" && <ModelMonitor />}
      </main>
    </div>
  );
}

function Overview({
  stats,
  result,
  form,
  updateForm,
  analyzeTransaction,
  loading,
  error,
}) {
  return (
    <>
      <section className="stats-grid">
        <StatCard
          title="Analyzed"
          value={stats.total}
          icon={<Activity />}
          text="Total predictions"
        />

        <StatCard
          title="High Risk"
          value={stats.high_risk}
          icon={<ShieldAlert />}
          danger
          text="Requires attention"
        />

        <StatCard
          title="Low Risk"
          value={stats.low_risk}
          icon={<ShieldCheck />}
          success
          text="Approved / monitored"
        />

        <StatCard
          title="Medium Risk"
          value={stats.medium_risk}
          icon={<AlertTriangle />}
          warning
          text="Needs review"
        />
      </section>

      <div className="content-grid">
        <section className="panel prediction-panel">
          <div className="panel-header">
            <div>
              <h2>Analyze Transaction</h2>
              <p>Evaluate a transaction using the ML risk engine.</p>
            </div>

            <CircleDollarSign size={24} />
          </div>

          <form onSubmit={analyzeTransaction} className="form-grid">
            <Input
              label="Amount"
              value={form.amt}
              onChange={(v) => updateForm("amt", v)}
              type="number"
            />

            <Input
              label="Category"
              value={form.category}
              onChange={(v) => updateForm("category", v)}
            />

            <Input
              label="Gender"
              value={form.gender}
              onChange={(v) => updateForm("gender", v)}
            />

            <Input
              label="City Population"
              value={form.city_pop}
              onChange={(v) => updateForm("city_pop", v)}
              type="number"
            />

            <Input
              label="Latitude"
              value={form.lat}
              onChange={(v) => updateForm("lat", v)}
              type="number"
              step="any"
            />

            <Input
              label="Longitude"
              value={form.long}
              onChange={(v) => updateForm("long", v)}
              type="number"
              step="any"
            />

            <Input
              label="Merchant Latitude"
              value={form.merch_lat}
              onChange={(v) => updateForm("merch_lat", v)}
              type="number"
              step="any"
            />

            <Input
              label="Merchant Longitude"
              value={form.merch_long}
              onChange={(v) => updateForm("merch_long", v)}
              type="number"
              step="any"
            />

            <Input
              label="State"
              value={form.state}
              onChange={(v) => updateForm("state", v)}
            />

            <Input
              label="Job"
              value={form.job}
              onChange={(v) => updateForm("job", v)}
            />

            <Input
              label="Transaction Time"
              value={form.trans_date_trans_time}
              onChange={(v) =>
                updateForm("trans_date_trans_time", v)
              }
            />

            <div className="form-action">
              <button
                className="primary-button"
                type="submit"
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Analyze Transaction"}
                <ChevronRight size={18} />
              </button>
            </div>
          </form>

          {error && <div className="error-box">{error}</div>}
        </section>

        <RiskResult result={result} />
      </div>
    </>
  );
}

function RiskResult({ result }) {
  if (!result) {
    return (
      <section className="panel empty-result">
        <ShieldCheck size={48} />
        <h2>Risk Decision</h2>
        <p>
          Submit a transaction to generate a real-time fraud
          decision.
        </p>
      </section>
    );
  }

  const isHigh = result.risk_level === "HIGH";

  return (
    <section className="panel risk-panel">
      <div className="panel-header">
        <div>
          <h2>Risk Decision</h2>
          <p>ML model prediction</p>
        </div>

        {isHigh ? (
          <ShieldAlert className="danger-icon" />
        ) : (
          <ShieldCheck className="success-icon" />
        )}
      </div>

      <div className={`risk-banner ${result.risk_level.toLowerCase()}`}>
        <span>{result.risk_level} RISK</span>
        <strong>{result.risk_score}/100</strong>
      </div>

      <div className="probability">
        <span>Fraud probability</span>
        <strong>
          {(result.fraud_probability * 100).toFixed(2)}%
        </strong>
      </div>

      <div className="action-box">
        <small>Recommended Action</small>
        <strong>{result.action}</strong>
      </div>

      <div className="reasons">
        <h3>Why?</h3>

        {result.reasons?.map((reason, index) => (
          <div className="reason" key={index}>
            <AlertTriangle size={16} />
            <span>{reason}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Transactions({ stats }) {
  return (
    <section className="panel page-panel">
      <div className="panel-header">
        <div>
          <h2>Transaction History</h2>
          <p>Recent transactions analyzed by FraudShield AI.</p>
        </div>
        <Activity size={24} />
      </div>

      <TransactionTable transactions={stats.recent || []} />
    </section>
  );
}

function FraudAlerts({ alerts }) {
  return (
    <section className="page-panel">
      <div className="section-title">
        <div>
          <p className="eyebrow">SECURITY CENTER</p>
          <h2>Fraud Alerts</h2>
          <p>High-risk transactions requiring manual attention.</p>
        </div>

        <div className="alert-count">
          <ShieldAlert size={18} />
          {alerts.length} Active Alerts
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="panel empty-state">
          <CheckCircle2 size={48} />
          <h2>No active fraud alerts</h2>
          <p>No high-risk transactions are currently visible.</p>
        </div>
      ) : (
        <div className="alert-list">
          {alerts.map((item, index) => (
            <div className="alert-card" key={index}>
              <div className="alert-icon">
                <ShieldAlert size={22} />
              </div>

              <div className="alert-main">
                <div className="alert-top">
                  <span className="high-label">HIGH RISK</span>
                  <span>{item.created_at}</span>
                </div>

                <h3>
                  ₹{Number(item.amount).toLocaleString("en-IN")}
                </h3>

                <p>
                  Fraud probability:{" "}
                  <strong>
                    {(Number(item.probability) * 100).toFixed(2)}%
                  </strong>
                </p>

                <div className="alert-reasons">
                  {item.reasons?.map((reason, i) => (
                    <span key={i}>{reason}</span>
                  ))}
                </div>
              </div>

              <div className="alert-action">
                {item.action}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Analytics({ stats, riskPercentage }) {
  const total = stats.total || 0;

  const highPercent = total
    ? Math.round((stats.high_risk / total) * 100)
    : 0;

  const mediumPercent = total
    ? Math.round((stats.medium_risk / total) * 100)
    : 0;

  const lowPercent = total
    ? Math.round((stats.low_risk / total) * 100)
    : 0;

  return (
    <section className="page-panel">
      <div className="section-title">
        <div>
          <p className="eyebrow">DATA INTELLIGENCE</p>
          <h2>Analytics</h2>
          <p>Risk distribution from analyzed transactions.</p>
        </div>

        <BarChart3 size={28} />
      </div>

      <div className="analytics-grid">
        <MetricCard
          title="Total Transactions"
          value={total}
          icon={<Activity />}
        />

        <MetricCard
          title="High Risk Rate"
          value={`${highPercent}%`}
          icon={<TrendingUp />}
        />

        <MetricCard
          title="Medium Risk"
          value={`${mediumPercent}%`}
          icon={<AlertTriangle />}
        />

        <MetricCard
          title="Low Risk"
          value={`${lowPercent}%`}
          icon={<ShieldCheck />}
        />
      </div>

      <div className="panel chart-panel">
        <div className="chart-header">
          <div>
            <h3>Risk Distribution</h3>
            <p>Current prediction distribution</p>
          </div>
        </div>

        <RiskBar
          label="High Risk"
          value={highPercent}
          count={stats.high_risk}
          danger
        />

        <RiskBar
          label="Medium Risk"
          value={mediumPercent}
          count={stats.medium_risk}
          warning
        />

        <RiskBar
          label="Low Risk"
          value={lowPercent}
          count={stats.low_risk}
          success
        />
      </div>
    </section>
  );
}

function ModelMonitor() {
  const metrics = [
    ["Model", "XGBoost"],
    ["Validation PR-AUC", "0.7113"],
    ["Validation ROC-AUC", "0.9642"],
    ["Test PR-AUC", "0.6098"],
    ["Test ROC-AUC", "0.9590"],
    ["Test Precision", "0.4692"],
    ["Test Recall", "0.9683"],
    ["Test F1 Score", "0.6321"],
    ["Decision Threshold", "0.05"],
  ];

  return (
    <section className="page-panel">
      <div className="section-title">
        <div>
          <p className="eyebrow">ML OPERATIONS</p>
          <h2>Model Monitor</h2>
          <p>Current FraudShield AI model performance.</p>
        </div>

        <BrainCircuit size={28} />
      </div>

      <div className="model-status">
        <div className="model-status-icon">
          <CheckCircle2 size={25} />
        </div>

        <div>
          <strong>XGBoost Model Active</strong>
          <span>Production prediction pipeline</span>
        </div>

        <span className="active-pill">ACTIVE</span>
      </div>

      <div className="metric-table">
        {metrics.map(([name, value]) => (
          <div className="metric-row" key={name}>
            <span>{name}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="monitor-note">
        <AlertTriangle size={18} />
        <span>
          Metrics are based on the project's evaluation dataset and
          should be treated as demonstration metrics, not production
          financial-performance guarantees.
        </span>
      </div>
    </section>
  );
}

function TransactionTable({ transactions }) {
  if (!transactions.length) {
    return (
      <div className="empty-state small">
        <Activity size={35} />
        <p>No transactions available yet.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Amount</th>
            <th>Probability</th>
            <th>Risk</th>
            <th>Action</th>
            <th>Time</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((item, index) => (
            <tr key={index}>
              <td>
                <strong>
                  ₹{Number(item.amount).toLocaleString("en-IN")}
                </strong>
              </td>

              <td>
                {(Number(item.probability) * 100).toFixed(2)}%
              </td>

              <td>
                <span
                  className={`risk-tag ${item.risk.toLowerCase()}`}
                >
                  {item.risk}
                </span>
              </td>

              <td>{item.action}</td>
              <td>{item.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  danger,
  success,
  warning,
  text,
}) {
  return (
    <div
      className={`stat-card ${
        danger ? "danger" : success ? "success" : warning ? "warning" : ""
      }`}
    >
      <div className="stat-top">
        <span>{title}</span>
        {icon}
      </div>

      <strong>{value}</strong>
      <small>{text}</small>
    </div>
  );
}

function MetricCard({ title, value, icon }) {
  return (
    <div className="metric-card">
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>

      {icon}
    </div>
  );
}

function RiskBar({ label, value, count }) {
  return (
    <div className="risk-bar-row">
      <div className="risk-bar-label">
        <span>{label}</span>
        <strong>
          {count} ({value}%)
        </strong>
      </div>

      <div className="bar-track">
        <div
          className={`bar-fill ${label
            .toLowerCase()
            .replace(" ", "-")}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  step,
}) {
  return (
    <label className="field">
      <span>{label}</span>

      <input
        type={type}
        value={value}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </label>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);