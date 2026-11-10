"""Parity of the extractor against Member 1's sample (data/sample_10k.csv).

Known, documented limits: ~21% of the dataset's PHISHING rows were computed on
the full URL instead of URL-minus-last-character (not predictable from text),
so exact URLLength parity is expected only on the other rows.
"""
import os
import numpy as np
import pandas as pd
import pytest
from src.feature_extraction import extract_features, FEATURE_COLUMNS, InvalidURLError
from src.predictor import get_model

CSV = os.path.join(os.path.dirname(__file__), "..", "data", "sample_10k.csv")
pytestmark = pytest.mark.skipif(not os.path.exists(CSV), reason="sample_10k.csv not present")


@pytest.fixture(scope="module")
def frames():
    df = pd.read_csv(CSV)
    rows, idx = [], []
    for i, u in enumerate(df.URL):
        try:
            rows.append(extract_features(u)); idx.append(i)
        except InvalidURLError:
            pass
    return pd.DataFrame(rows), df.iloc[idx].reset_index(drop=True)


def test_legit_rows_match_exactly(frames):
    mine, ref = frames
    legit = (ref.label == 1).values
    for c in ["URLLength", "NoOfLettersInURL", "NoOfOtherSpecialCharsInURL", "DomainLength",
              "NoOfSubDomain", "IsHTTPS", "NoOfDegitsInURL", "TLDLength"]:
        assert (mine[c][legit] == ref[c][legit]).all(), c


def test_most_columns_match_95pct_on_dropped_char_rows(frames):
    mine, ref = frames
    grp = ((ref.URLLength - ref.URL.str.len()) == -1).values
    for c in FEATURE_COLUMNS:
        a, b = mine[c][grp], ref[c][grp]
        ok = (a == b.astype(str)) if c == "TLD" else ((a - b).abs() < 1e-3)
        assert ok.mean() >= 0.99, (c, ok.mean())


def test_model_verdicts_match_stored_features(frames):
    mine, ref = frames
    m = get_model()
    p1 = m.predict_proba(mine[FEATURE_COLUMNS])[:, 1] >= 0.5
    p2 = m.predict_proba(ref[FEATURE_COLUMNS])[:, 1] >= 0.5
    assert (p1 == p2).mean() >= 0.998


def test_end_to_end_accuracy_on_sample(frames):
    mine, ref = frames
    pred = get_model().predict_proba(mine[FEATURE_COLUMNS])[:, 1] >= 0.5
    assert (pred == ref.label.values.astype(bool)).mean() >= 0.995
