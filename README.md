# FraudShield-AI
Real-Time Fraud Detection &amp; Risk Intelligence Platform using Machine Learning, XGBoost, FastAPI and React.

## Real-Time Fraud Detection & Risk Intelligence Platform

FraudShield AI is an end-to-end **Machine Learning based fraud detection platform** designed to analyze financial transactions, estimate fraud probability, calculate risk scores, and recommend real-time actions.

The platform combines **Machine Learning, XGBoost, FastAPI, React, Explainable AI, and Risk Scoring** to provide an industry-style fraud detection workflow.

> **Turn every transaction into an intelligent risk decision.**

---

## 🚀 Key Features

- 🔍 Real-time transaction fraud detection
- 🤖 Machine Learning based fraud prediction
- ⚡ XGBoost-based fraud classification
- 📊 Fraud probability estimation
- 🎯 Risk score from 0–100
- 🚦 Low / Medium / High risk classification
- 🛑 Automated action recommendation
- 🧠 Explainable fraud detection
- 📈 Transaction statistics dashboard
- 🔌 FastAPI REST API
- ⚛️ React-based dashboard
- 🐳 Docker-ready architecture
- 📁 Modular ML training pipeline
- 📚 Dataset and modeling documentation

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │    React Dashboard   │
                    │       Frontend       │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │       FastAPI        │
                    │       Backend        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Feature Engineering  │
                    │  & Preprocessing     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    XGBoost Model     │
                    │  Fraud Prediction    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Fraud Probability  │
                    │      & Risk Score    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Risk Engine       │
                    │ Low / Medium / High  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Recommended Action   │
                    │ Approve / Review /   │
                    │       Block          │
                    └──────────────────────┘
```
---
# 🔄 Fraud Detection Workflow

```text
Transaction
     ↓
Data Validation
     ↓
Feature Engineering
     ↓
ML Prediction
     ↓
Fraud Probability
     ↓
Risk Score
     ↓
Risk Classification
     ↓
Explainable Reasons
     ↓
Recommended Action
```

---
## 🧠 Machine Learning

FraudShield AI evaluates multiple machine learning approaches before selecting the final model.

### Models

- Logistic Regression
- Random Forest
- XGBoost

The model selection process focuses on fraud-detection-oriented metrics rather than accuracy alone.

### Primary Model

**XGBoost** is used as the main model because it performs well on structured/tabular transaction data and can capture nonlinear relationships between transaction features.

---

## 📊 Model Evaluation

Example evaluation from the training pipeline:

| Model | PR-AUC | ROC-AUC | Precision | Recall |
|---|---:|---:|---:|---:|
| Logistic Regression | 0.6504 | 0.9539 | 0.5410 | 0.8571 |
| Random Forest | 0.7006 | 0.9617 | 0.5679 | 0.5974 |
| XGBoost | 0.7113 | 0.9642 | 0.6364 | 0.6364 |

For fraud detection, **PR-AUC, recall, precision and F-score** are more informative than accuracy because fraud datasets are highly imbalanced.

---

## 🎯 Risk Intelligence

FraudShield converts model predictions into an easy-to-understand risk score.

| Risk Score | Risk Level | Recommended Action |
|---|---|---|
| 0–30 | 🟢 LOW | APPROVE / MONITOR |
| 31–70 | 🟡 MEDIUM | REVIEW |
| 71–100 | 🔴 HIGH | BLOCK / MANUAL REVIEW |

### Example

```text
Fraud Probability : 99.16%
Risk Score        : 99/100
Risk Level        : HIGH RISK
Action            : BLOCK / MANUAL REVIEW
```
---

# 🧠 Explainable AI

FraudShield does not only return a prediction.

It also provides understandable reasons behind the risk decision.

## Example

```text
Why?

• Transaction amount is unusually high
• Very large transaction value
• Transaction occurred at an unusual hour
```

This makes the system easier for fraud analysts and business teams to understand.

---

# 📥 Transaction Features

The system can analyze transaction-level information such as:

- Transaction amount
- Transaction category
- Gender
- City population
- Customer latitude
- Customer longitude
- Merchant latitude
- Merchant longitude
- State
- Job
- Transaction timestamp

Additional features can be engineered from the raw transaction data.

---

# ⚙️ Feature Engineering

The ML pipeline can generate useful fraud signals such as:

- Transaction hour
- Weekday
- Month
- Customer-to-merchant distance
- Encoded categorical features
- Missing-value handling

Geographical distance can be calculated using the **Haversine formula**.

---

# 🔌 API

FraudShield provides a REST API using FastAPI.

## Health Check

```http
GET /api/health
```

Returns the backend and model status.

### Example Response

```json
{
  "status": "ok",
  "model_loaded": true
}
```

---

## Fraud Prediction

```http
POST /api/predict
```

### Example Request

```json
{
  "amt": 85000,
  "category": "shopping_net",
  "gender": "M",
  "city_pop": 250000,
  "lat": 18.52,
  "long": 73.85,
  "merch_lat": 19.07,
  "merch_long": 72.87,
  "state": "MH",
  "job": "engineer",
  "trans_date_trans_time": "2026-10-05 00:30:00"
}
```

### Example Response

```json
{
  "fraud_probability": 0.9916,
  "risk_score": 99,
  "risk_level": "HIGH",
  "action": "BLOCK / MANUAL REVIEW",
  "reasons": [
    "transaction amount is unusually high",
    "very large transaction value",
    "transaction occurred at an unusual hour"
  ]
}
```

---

## Dashboard Statistics

```http
GET /api/stats
```

Returns transaction and risk statistics used by the dashboard.

---

# 🖥️ Frontend

The frontend is built using:

- React
- Vite
- JavaScript
- CSS
- Lucide Icons

The dashboard provides:

- Transaction analysis form
- Fraud probability
- Risk score
- Risk level
- Recommended action
- Explainable fraud reasons
- Transaction statistics

---

# 🛠️ Technology Stack

### Machine Learning

- Python
- Pandas
- NumPy
- Scikit-learn
- XGBoost
- Joblib

### Backend

- FastAPI
- Uvicorn
- Pydantic

### Frontend

- React
- Vite
- JavaScript
- CSS
- Lucide React

### DevOps / Deployment

- Docker
- Docker Compose

### Documentation

- Markdown
- Jupyter Notebook

---

# 📂 Project Structure

```text
FraudShield-AI/
│
├── backend/
│   ├── data/
│   │   └── .gitkeep
│   │
│   ├── model/
│   │   └── .gitkeep
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   └── style.css
│   │
│   ├── index.html
│   ├── package.json
│   └── package-lock.json
│
├── docs/
│   ├── DATASET_GUIDE.md
│   └── MODELING.md
│
├── notebooks/
│
├── scripts/
│   ├── make_demo_data.py
│   └── train.py
│
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

# 📊 Dataset

FraudShield AI is designed around transaction-level fraud data containing information about:

- Transaction timestamp
- Merchant
- Transaction category
- Transaction amount
- Customer information
- Geographic information
- Merchant location
- Fraud label

The dataset is **not included in the GitHub repository** because large datasets should not be committed directly to the repository.

See:

```text
docs/DATASET_GUIDE.md
```

for dataset sources and setup instructions.

---

# 🚀 Local Setup

## 1. Clone Repository

```bash
git clone https://github.com/prajapatishubham336/FraudShield-AI.git
cd FraudShield-AI
```

---

# 🐍 Backend Setup

Create and activate a Python environment:

```bash
conda create -n llmapp python=3.11
conda activate llmapp
```

Install dependencies:

```bash
pip install -r backend/requirements.txt
```

---

# 📁 Dataset Setup

Place your training dataset inside:

```text
backend/data/
```

Expected filename:

```text
fraudTrain.csv
```

Refer to:

```text
docs/DATASET_GUIDE.md
```

for dataset information.

---

# 🧠 Train the Model

Run:

```bash
python scripts/train.py
```

The training pipeline evaluates multiple models and saves the selected model locally.

The generated model file is intentionally ignored by Git using:

```text
backend/model/*.joblib
```

---

# ▶️ Start Backend

Run:

```bash
uvicorn backend.app:app --reload --port 8000
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

---

# ⚛️ Start Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server will provide a local URL such as:

```text
http://localhost:5173
```

or another available port.

---

# 🐳 Docker

The project also contains Docker configuration for containerized deployment.

Build and run:

```bash
docker compose up --build
```

The Docker setup is designed to keep the application reproducible across environments.

---

# 🔐 Security & Privacy

The project follows basic security practices:

- Environment variables are stored in `.env`
- `.env` is excluded from Git
- Dataset files are excluded from Git
- Database files are excluded from Git
- Trained model artifacts are excluded from Git
- Sensitive configuration should never be committed

Example environment configuration:

```text
.env.example
```

---

# 📈 Future Enhancements

FraudShield AI can be extended into a production-grade fraud intelligence platform with:

### Advanced ML

- LightGBM
- CatBoost
- Ensemble models
- Cost-sensitive learning
- Advanced anomaly detection

### Real-Time Architecture

- Redis
- Kafka
- Message queues
- Streaming transaction processing

### MLOps

- MLflow
- Model versioning
- Experiment tracking
- Automated model retraining
- Model monitoring
- Data drift detection

### Explainable AI

- SHAP
- Feature importance
- Local explanations
- Global model explanations

### Database

- PostgreSQL
- Redis
- Transaction history
- Fraud alert storage

### Production Dashboard

- Fraud trend analytics
- Geographic fraud visualization
- Fraud category analysis
- Customer risk profiles
- Merchant risk profiles
- Real-time fraud alerts

---

# 🧩 Production Architecture

The long-term architecture can evolve into:

```text
                 Transaction Sources
                         │
                         ▼
                ┌─────────────────┐
                │ Kafka / Queue   │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Feature Engine  │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ ML Model Server │
                └────────┬────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
       Fraud Probability       Risk Engine
                                     │
                     ┌───────────────┼───────────────┐
                     ▼               ▼               ▼
                  APPROVE          REVIEW          BLOCK
```

---

# 🎯 Project Goals

FraudShield AI demonstrates practical skills in:

- Machine Learning
- Classification
- Imbalanced datasets
- Feature engineering
- XGBoost
- Model evaluation
- FastAPI
- REST APIs
- React
- Explainable AI
- Risk scoring
- Docker
- ML system design

---

# ⚠️ Disclaimer

This project is created for **educational, portfolio, and demonstration purposes**.

The model should not be used for real financial decisions without proper validation, security controls, monitoring, regulatory compliance, and production-grade fraud detection infrastructure.

---

# 👨‍💻 Author

**Shubham Prajapati**

AI / ML Engineer | Generative AI | Machine Learning

---

# ⭐ If You Like This Project

If you find FraudShield AI useful or interesting, consider giving the repository a ⭐ on GitHub.

---

FraudShield AI  
**Real-Time Fraud Detection & Risk Intelligence Platform**
