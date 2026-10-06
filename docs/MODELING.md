# Modeling decisions

## Preprocessing
- Parse transaction timestamp.
- Engineer hour, weekday and month.
- Calculate approximate customer-to-merchant distance with the Haversine formula.
- Median-impute numeric values and most-frequent-impute categorical values.
- One-hot encode categorical variables with rare-category grouping.
- Avoid using post-transaction or target-derived fields.

## Split
Use chronological 70/15/15 splitting whenever a transaction timestamp exists. This is closer to production than a random split because future transactions should not influence the past.

## Model selection
Start with Logistic Regression as a transparent baseline, Random Forest as a nonlinear baseline, and XGBoost as the main gradient-boosting candidate. Select by validation PR-AUC, not raw accuracy.

## Imbalance
`scale_pos_weight = negatives / positives` is passed to XGBoost. This does not create synthetic fraud records and keeps the training distribution intact.

## Threshold
The default 0.5 threshold is not assumed to be optimal. The script searches 0.05–0.95 and chooses the validation threshold with the highest F2 score. F2 gives more weight to recall, which is often appropriate when missing a fraud is more costly than reviewing a legitimate transaction.

## Explainability
The API explanation layer is deliberately deterministic and only references fields received in the transaction. This prevents the demo from inventing reasons that are not present in the input.
