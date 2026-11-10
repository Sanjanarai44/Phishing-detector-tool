"""Loads the model once and scores a URL.

Class mapping (easy to invert!): classes_ = [0, 1]; 0 = Phishing, 1 = Legitimate.
predict_proba(X)[:, 1] = P(Legitimate); phishing risk = 1 - P(Legitimate).
"""
import os
import joblib
import pandas as pd
import sklearn.compose._column_transformer
from .feature_extraction import FEATURE_COLUMNS, extract_features

# Compatibility shim for unpickling ColumnTransformer across sklearn versions
if not hasattr(sklearn.compose._column_transformer, '_RemainderColsList'):
    sklearn.compose._column_transformer._RemainderColsList = type('_RemainderColsList', (list,), {})

MODEL_PATH = os.environ.get(
    "PHISHGUARD_MODEL",
    os.path.join(os.path.dirname(__file__), "..", "model", "phishing_xgboost_model.joblib"),
)
PHISHING_THRESHOLD = 0.7   # risk >= 0.7  -> Phishing
LEGIT_THRESHOLD = 0.3      # risk <  0.3  -> Legitimate; in between -> Uncertain

_model = None


def _load_portable(model_dir):
    """Load preprocessor.joblib + xgb_model.json (avoids xgboost's pickle format)."""
    from sklearn.pipeline import Pipeline
    from xgboost import XGBClassifier
    pre = joblib.load(os.path.join(model_dir, "preprocessor.joblib"))
    clf = XGBClassifier()
    clf.load_model(os.path.join(model_dir, "xgb_model.json"))
    return Pipeline(steps=[("preprocessor", pre), ("classifier", clf)])


def get_model():
    global _model
    if _model is None:
        model_dir = os.path.dirname(os.path.abspath(MODEL_PATH))
        portable = os.path.join(model_dir, "xgb_model.json")
        if os.path.exists(portable) and os.path.exists(os.path.join(model_dir, "preprocessor.joblib")):
            _model = _load_portable(model_dir)
        else:
            _model = joblib.load(MODEL_PATH)
        assert list(_model.classes_) == [0, 1], "Unexpected class order"
    return _model


def features_to_frame(features: dict) -> pd.DataFrame:
    return pd.DataFrame([[features[c] for c in FEATURE_COLUMNS]], columns=FEATURE_COLUMNS)


def verdict_from_risk(risk: float):
    if risk >= PHISHING_THRESHOLD:
        return "Phishing", "High"
    if risk >= LEGIT_THRESHOLD:
        return "Uncertain", "Medium"
    return "Legitimate", "Low"


def predict_features(features: dict) -> dict:
    p_legit = float(get_model().predict_proba(features_to_frame(features))[0, 1])
    risk = 1.0 - p_legit
    verdict, level = verdict_from_risk(risk)
    return {
        "verdict": verdict,
        "risk_level": level,
        "phishing_probability": round(risk, 4),
        "legitimate_probability": round(p_legit, 4),
    }


def predict_url(url: str) -> dict:
    feats = extract_features(url)
    out = predict_features(feats)
    out["features"] = feats
    return out
