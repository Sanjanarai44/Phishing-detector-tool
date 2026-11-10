"""URL string -> the 19 features the PhishGuard model expects.

The URL is only PARSED as text. It is never fetched or opened.

IMPORTANT: the dataset (PhiUSIIL) does not count characters over the raw
URL string. It counts them over the part AFTER "scheme://" and an optional
"www." (verified on a 10,000-row sample; see tests/test_parity.py). The dataset's
legitimate rows are also 1 character / 1 letter SHORTER than their URL text;
the model depends on this, so the same offset is applied here.
"""
import re
from urllib.parse import urlsplit

FEATURE_COLUMNS = [
    "URLLength", "DomainLength", "IsDomainIP", "TLD", "TLDLength",
    "NoOfSubDomain", "HasObfuscation", "NoOfObfuscatedChar", "ObfuscationRatio",
    "NoOfLettersInURL", "LetterRatioInURL", "NoOfDegitsInURL", "DegitRatioInURL",
    "NoOfEqualsInURL", "NoOfQMarkInURL", "NoOfAmpersandInURL",
    "NoOfOtherSpecialCharsInURL", "SpacialCharRatioInURL", "IsHTTPS",
]

MAX_URL_LENGTH = 2048
_IPV4 = re.compile(r"^\d{1,3}(\.\d{1,3}){3}$")
_PERCENT = re.compile(r"%[0-9A-Fa-f]{2}")


class InvalidURLError(ValueError):
    """Raised when the input is not a usable http(s) URL."""


def validate_url(url) -> str:
    if not isinstance(url, str):
        raise InvalidURLError("URL must be a string.")
    url = url.strip()
    if not url:
        raise InvalidURLError("URL is empty.")
    if len(url) > MAX_URL_LENGTH:
        raise InvalidURLError(f"URL is longer than {MAX_URL_LENGTH} characters.")
    if re.search(r"\s", url):
        raise InvalidURLError("URL must not contain spaces.")
    if not re.match(r"^https?://", url, re.I):
        raise InvalidURLError("URL must start with http:// or https://")
    try:
        parts = urlsplit(url)
        host = parts.hostname
    except ValueError as exc:
        raise InvalidURLError(f"Malformed URL: {exc}") from exc
    if not host:
        raise InvalidURLError("URL has no host name.")
    return url


def extract_features(url: str) -> dict:
    """Return {column: value} in FEATURE_COLUMNS order."""
    url = validate_url(url)
    parts = urlsplit(url)
    host = parts.netloc.rsplit("@", 1)[-1].split(":")[0]  # keep 'www.' like the dataset's Domain
    host_l = host.lower()

    is_ip = 1 if _IPV4.match(host_l) else 0
    labels = host_l.split(".")
    tld = labels[-1]  # dataset keeps the last octet as TLD for IP hosts

    # Dataset convention (verified on 10k rows): features are computed on the
    # URL WITHOUT ITS LAST CHARACTER, and character counts start after
    # "scheme://" and an optional "www.".
    body = url[:-1]
    rest = re.sub(r"^https?://(www\.)?", "", body, flags=re.I)

    letters = sum(c.isalpha() for c in rest)
    digits = sum(c.isdigit() for c in rest)
    equals = body.count("=")
    qmark = body.count("?")
    amp = len(re.findall(r"&(?!amp;)", body))  # '&amp;' entities are not counted
    other = sum((not c.isalnum()) and c not in "=?&" for c in rest)

    n = len(body)
    obf = len(_PERCENT.findall(body))  # approximate; dataset rule differs on ~0.2% rows

    feats = {
        "URLLength": n,
        "DomainLength": len(host),
        "IsDomainIP": is_ip,
        "TLD": tld,
        "TLDLength": len(tld),
        "NoOfSubDomain": max(host_l.count(".") - 1, 0),
        "HasObfuscation": 1 if obf else 0,
        "NoOfObfuscatedChar": obf,
        "ObfuscationRatio": round(obf / n, 3),
        "NoOfLettersInURL": letters,
        "LetterRatioInURL": round(letters / n, 3),
        "NoOfDegitsInURL": digits,
        "DegitRatioInURL": round(digits / n, 3),
        "NoOfEqualsInURL": equals,
        "NoOfQMarkInURL": qmark,
        "NoOfAmpersandInURL": amp,
        "NoOfOtherSpecialCharsInURL": other,
        "SpacialCharRatioInURL": round(other / n, 3),
        "IsHTTPS": 1 if "https" in url.lower() else 0,
    }
    return {k: feats[k] for k in FEATURE_COLUMNS}
