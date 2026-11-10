import pytest
from src.feature_extraction import extract_features, InvalidURLError, FEATURE_COLUMNS
from src.predictor import predict_url
from app import create_app

SAMPLES = [("https://www.southbankmosaics.com", 0.9969), ("https://www.voicefmradio.co.uk", 0.9997),
           ("https://www.globalreporting.org", 0.9997), ("https://www.nerdscandy.com", 0.9981),
           ("https://www.religionenlibertad.com", 0.9972)]

@pytest.mark.parametrize("url,expected", SAMPLES)
def test_notebook_samples(url, expected):
    assert predict_url(url)["legitimate_probability"] == pytest.approx(expected, abs=1e-4)

def test_columns_order():
    assert list(extract_features("https://www.nerdscandy.com")) == FEATURE_COLUMNS

@pytest.mark.parametrize("bad", ["", "   ", "ftp://x.com", "not a url", "http://", "https://a b.com", None, 5, "http://" + "a" * 3000])
def test_invalid(bad):
    with pytest.raises(InvalidURLError):
        extract_features(bad)

@pytest.fixture
def client():
    return create_app().test_client()

def test_health(client):
    assert client.get("/api/health").json == {"status": "ok"}

def test_scan_ok(client):
    r = client.post("/api/scan", json={"url": "https://www.nerdscandy.com"})
    assert r.status_code == 200
    j = r.json
    assert j["verdict"] == "Legitimate" and len(j["features"]) == 19 and j["reasons"]
    assert j["phishing_probability"] + j["legitimate_probability"] == pytest.approx(1, abs=1e-3)

def test_scan_bad(client):
    assert client.post("/api/scan", json={"url": "nope"}).status_code == 400
    assert client.post("/api/scan", data="x").status_code == 400
    assert client.post("/api/scan", json={}).status_code == 400

def test_reliability_flag(client):
    j = client.post("/api/scan", json={"url": "https://github.com/pallets/flask"}).json
    assert j["reliability"]["level"] == "low" and j["reliability"]["notes"]
    j2 = client.post("/api/scan", json={"url": "https://www.nerdscandy.com"}).json
    assert j2["reliability"]["level"] == "normal"

def test_model_info(client):
    j = client.get("/api/model-info").json
    assert j["evaluation"]["confusion_matrix"] == [[14492, 80], [8, 19373]]
    assert len(j["global_importance"]) == 8
