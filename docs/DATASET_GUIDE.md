# Dataset guide

## Recommended: FraudTrain/FraudTest
Kaggle page: https://www.kaggle.com/competitions/transaction-fraud-detection/data

Download the training file and rename it `fraudTrain.csv`. The training data includes transaction time, merchant/category, amount, customer/location information and `is_fraud`.

### What to check before training
```text
1. df.shape
2. df.dtypes
3. duplicate rows
4. missing-value percentage
5. fraud rate
6. amount distribution
7. fraud rate by category
8. fraud rate by hour
9. fraud rate over time
10. leakage / post-transaction columns
```

## Alternative: ULB Credit Card Fraud
Kaggle: https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud
284,807 rows and 492 frauds. It is excellent for benchmarking imbalance handling but the main features are PCA-anonymized, so it is less suitable for demonstrating device/location/merchant feature engineering.

## Alternative: IEEE-CIS
Kaggle: https://www.kaggle.com/competitions/ieee-fraud-detection/data
This dataset joins transaction and identity tables and contains many masked categorical and device/network features. It is more enterprise-like but substantially heavier.
