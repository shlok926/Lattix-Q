import statistics

def compute_stats(times: list[float]) -> dict:
    if not times:
        return {"mean": 0, "median": 0, "p95": 0, "p99": 0, "min": 0, "max": 0}
        
    sorted_times = sorted(times)
    n = len(sorted_times)
    
    return {
        "mean": statistics.mean(times),
        "median": statistics.median(times),
        "p95": sorted_times[int(n * 0.95)] if n > 0 else 0,
        "p99": sorted_times[int(n * 0.99)] if n > 0 else 0,
        "min": sorted_times[0],
        "max": sorted_times[-1]
    }
