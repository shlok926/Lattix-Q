import io
import pandas as pd
from app.core.runner import AlgoBenchmark

def to_csv(results: list[dict]) -> str:
    df = pd.DataFrame(results)
    output = io.StringIO()
    df.to_csv(output, index=False)
    return output.getvalue()

def to_json(results: list[dict]) -> dict:
    return {"data": results}
