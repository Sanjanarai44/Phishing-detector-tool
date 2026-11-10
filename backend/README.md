# PhishGuard AI: Backend (Member 3)

Flask API that turns a URL string into 19 features, scores it with Member 2's XGBoost model, and returns a verdict with plain-English reasons.
**The URL is only parsed as text. The page is never fetched or opened.**

## Setup (Windows CMD)
```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
The API runs at http://127.0.0.1:5000. The model needs **scikit-learn 1.6.1** (it fails to load on newer versions).

Frontend (second terminal, repo root): `npm install` then `npm run dev`. Vite proxies `/api` to port 5000.

## API
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/scan` | Score one URL |
| GET | `/api/health` | `{"status": "ok"}` |
| GET | `/api/model-info` | Metrics, data sizes, global feature importance, limitations |

`POST /api/scan` body: `{"url": "https://www.example.com"}`

Response (200):
```json
{
  "url": "https://www.nerdscandy.com",
  "verdict": "Legitimate",
  "risk_level": "Low",
  "phishing_probability": 0.0019,
  "legitimate_probability": 0.9981,
  "reasons": [{"feature": "IsHTTPS", "value": 1, "direction": "legitimate", "impact": 3.1, "explanation": "..."}],
  "features": {"URLLength": 25, "...": "all 19 features"},
  "reliability": {"level": "normal", "notes": []},
  "model": {"name": "XGBoost (sklearn Pipeline)", "version": "1.0"},
  "disclaimer": "..."
}
```
Errors: `400 {"error": "..."}` for a missing/invalid URL (must start with http:// or https://, no spaces, host present, max 2048 chars); `500` for an internal failure.

Class mapping (easy to invert): model classes are `[0, 1]` with **0 = Phishing, 1 = Legitimate**. `phishing_probability = 1 - P(Legitimate)`.
Verdict bands: risk >= 0.7 Phishing, 0.3 to 0.7 Uncertain, < 0.3 Legitimate.

## How the features match the dataset
The dataset's features are not plain counts over the URL string. Verified on a 10,000-row sample (`data/sample_10k.csv`):
- Features are computed on the URL **without its last character**, and character counts start **after `https://` and an optional `www.`**.
- For IP hosts the dataset's TLD is the last octet; `&amp;` is not counted as `&`; `IsHTTPS` is 1 if "https" appears anywhere.
- About 21% of the dataset's **phishing** rows were computed on the full URL instead; this cannot be predicted from the text, so `URLLength` matches exactly on the rest only.
- Percent-encoding (`HasObfuscation`) differs on about 0.2% of rows.

Parity results on the 10k sample: all columns match >= 99% on rows using the dropped-last-character convention; the model gives the same verdict as with the stored features on 99.96% of rows; accuracy through this extractor is 99.73% (stored features: 99.77%).
**The model is sensitive to this convention:** with plain counting, legitimate recall on the sample falls from 99.98% to about 77%.

## Evaluation (say it this way)
Accuracy 99.74%, phishing precision 99.95%, recall 99.45%, F1 99.70%, ROC-AUC 0.99895 on **this dataset's held-out test split** (33,953 URLs; 80 phishing missed, 8 legitimate flagged). This is not real-world accuracy.

## Limitations
- In the training data **every legitimate URL is a bare `https://www.domain.tld` homepage** and every `http://` URL is phishing. Real legitimate URLs with paths, queries, no `www.`, or `http://` are often flagged Phishing (for example `https://github.com/pallets/flask`). The API adds a `reliability` block with level `low` and notes when this applies, and the UI shows it.
- Only the URL text is used: no page content, domain age, WHOIS or certificates.
- Reasons are "suspicious indicators", not proof. The result is a hint.
- Improving this needs retraining on URLs with realistic legitimate examples (future work for Member 2).

## Tests
```
python -m pytest -q
```
`tests/test_basic.py`: 5 notebook sample rows (P(Legit) 0.9969, 0.9997, 0.9997, 0.9981, 0.9972), invalid URLs, API behaviour, reliability flag. `tests/test_parity.py`: extractor parity against `data/sample_10k.csv`.

## Layout
`app.py` (Flask) · `src/feature_extraction.py` · `src/predictor.py` · `src/explain_prediction.py` · `model/` (joblib + global importance) · `tests/` · `data/`
