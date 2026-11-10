"""PhishGuard AI backend. Run: python app.py  (http://127.0.0.1:5000)"""
import json
import logging
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from src.feature_extraction import InvalidURLError, extract_features
from src.predictor import predict_features, get_model
from src.explain_prediction import explain, reliability, DISCLAIMER

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("phishguard")

_HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(_HERE, "model", "global_importance.json")) as _f:
    GLOBAL_IMPORTANCE = json.load(_f)

MODEL_INFO = {
    "name": "XGBoost (sklearn Pipeline)", "version": "1.0",
    "n_features": 19, "feature_type": "URL text only (page is never fetched)",
    "classes": {"0": "Phishing", "1": "Legitimate"},
    "evaluation": {"scope": "held-out test split of the PhiUSIIL-derived dataset (33,953 rows)",
                   "accuracy": 0.99741, "phishing_precision": 0.99945, "phishing_recall": 0.99451,
                   "phishing_f1": 0.99697, "roc_auc": 0.99895,
                   "confusion_matrix": [[14492, 80], [8, 19373]],
                   "validation_accuracy": 0.99773, "random_forest_validation_accuracy": 0.99725},
    "data": {"source": "PhiUSIIL phishing URL dataset (~235K URLs)", "train": 168422,
             "validation": 33420, "test": 33953, "legitimate_share": 0.57},
    "global_importance": GLOBAL_IMPORTANCE,
    "global_importance_note": "Mean |contribution| over a 10,000-row sample; TLD columns summed.",
    "limitations": ["Not a guarantee of real-world accuracy.",
                    "Dataset bias: http:// URLs, long paths and many dots look phishing-like.",
                    "Cannot see page content, domain age or certificates."],
}


def create_app():
    app = Flask(__name__)
    CORS(app)
    get_model()  # load once at startup

    @app.get("/api/health")
    def health():
        return jsonify(status="ok")

    @app.get("/api/model-info")
    def model_info():
        return jsonify(MODEL_INFO)

    @app.post("/api/scan")
    def scan():
        body = request.get_json(silent=True)
        if not isinstance(body, dict) or "url" not in body:
            return jsonify(error='Send JSON like {"url": "https://example.com"}'), 400
        try:
            feats = extract_features(body["url"])
        except InvalidURLError as exc:
            return jsonify(error=str(exc)), 400
        try:
            result = predict_features(feats)
            reasons = explain(feats)
        except Exception:
            log.exception("scan failed")
            return jsonify(error="Internal error while scoring the URL."), 500
        log.info("scan verdict=%s risk=%.3f", result["verdict"], result["phishing_probability"])
        return jsonify({"url": body["url"].strip(), **result, "reasons": reasons,
                        "features": feats, "reliability": reliability(body["url"]),
                        "model": {"name": MODEL_INFO["name"], "version": MODEL_INFO["version"]},
                        "disclaimer": DISCLAIMER})

    return app


if __name__ == "__main__":
    create_app().run(host="127.0.0.1", port=5000)
