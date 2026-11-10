"""Plain-English reasons from XGBoost pred_contribs (sums exactly to log-odds).

Positive contribution = pushes toward Legitimate; negative = toward Phishing.
All TLD_* one-hot columns are summed into one 'TLD' contribution.
"""
import numpy as np
import xgboost as xgb
from .feature_extraction import FEATURE_COLUMNS
from .predictor import get_model, features_to_frame

NUMERIC = [c for c in FEATURE_COLUMNS if c != "TLD"]

_TEXT = {
    "NoOfOtherSpecialCharsInURL": "number of special characters (dots, dashes, slashes...)",
    "SpacialCharRatioInURL": "share of the URL made of special characters",
    "IsHTTPS": "whether the URL uses HTTPS",
    "TLD": "the top-level domain (e.g. .com, .xyz)",
    "URLLength": "total URL length",
    "DomainLength": "domain name length",
    "NoOfSubDomain": "number of subdomains",
    "NoOfLettersInURL": "number of letters in the URL",
    "LetterRatioInURL": "share of the URL that is letters",
    "NoOfDegitsInURL": "number of digits in the URL",
    "DegitRatioInURL": "share of the URL that is digits",
    "NoOfEqualsInURL": "number of '=' characters",
    "NoOfQMarkInURL": "number of '?' characters",
    "NoOfAmpersandInURL": "number of '&' characters",
    "IsDomainIP": "whether the host is a raw IP address",
    "HasObfuscation": "whether the URL contains percent-encoded characters",
    "NoOfObfuscatedChar": "number of percent-encoded characters",
    "ObfuscationRatio": "share of the URL that is percent-encoded",
    "TLDLength": "length of the top-level domain",
}

DISCLAIMER = ("This is a statistical estimate from the URL text only. It is not proof. "
              "The page was never opened. Model trained on one public dataset.")


def contributions(features: dict) -> dict:
    """Return {feature: log-odds contribution} (+ -> Legitimate) and the bias."""
    model = get_model()
    X = features_to_frame(features)
    Xt = model.named_steps["preprocessor"].transform(X)
    names = model.named_steps["preprocessor"].get_feature_names_out()
    booster = model.named_steps["classifier"].get_booster()
    contribs = booster.predict(xgb.DMatrix(Xt), pred_contribs=True)[0]
    out, tld = {}, 0.0
    for name, c in zip(names, contribs[:-1]):
        if name.startswith("cat__TLD_"):
            tld += float(c)
        else:
            out[name.split("__", 1)[1]] = float(c)
    out["TLD"] = tld
    return {"by_feature": out, "bias": float(contribs[-1])}


_FLAGS = {"IsHTTPS", "IsDomainIP", "HasObfuscation"}


def _show(name, value):
    if name in _FLAGS:
        return "Yes" if value else "No"
    return str(value) if value != "" else "(none)"


def explain(features: dict, top_n: int = 5) -> list:
    contribs = contributions(features)["by_feature"]
    ranked = sorted(contribs.items(), key=lambda kv: abs(kv[1]), reverse=True)[:top_n]
    reasons = []
    for name, c in ranked:
        toward_legit = c > 0
        label = _TEXT[name][0].upper() + _TEXT[name][1:]
        shown = _show(name, features[name])
        if toward_legit:
            text = (f"Reassuring indicator: {label} is {shown}. In the training data this value "
                    "was more common in legitimate URLs.")
        else:
            text = (f"Suspicious indicator: {label} is {shown}. In the training data this value "
                    "was more common in phishing URLs.")
        reasons.append({
            "feature": name, "value": features[name],
            "direction": "legitimate" if toward_legit else "phishing",
            "impact": round(abs(c), 3), "explanation": text,
        })
    return reasons


def reliability(url: str) -> dict:
    """Warn when the URL looks unlike the training data's legitimate examples.

    In the training data EVERY legitimate URL is a bare https://www.<domain>
    homepage (no path, no query, no other subdomain), so the model tends to
    call anything else 'Phishing'. This is a dataset limitation, not proof.
    """
    from urllib.parse import urlsplit
    parts = urlsplit(url.strip())
    notes = []
    if parts.scheme.lower() != "https":
        notes.append("The URL does not use https://; in the training data every http:// URL was phishing.")
    host = (parts.hostname or "")
    if not host.startswith("www."):
        notes.append("The host does not start with 'www.'; the training data's legitimate URLs all did.")
    if parts.path not in ("", "/") or parts.query or parts.fragment:
        notes.append("The URL has a path, query or fragment; the training data's legitimate URLs were bare homepages.")
    return {"level": "low" if notes else "normal", "notes": notes}
