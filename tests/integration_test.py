import os
import sys
import time
import requests

# Retrieve API base URL from environment or default to local Nginx gateway proxy
BASE_URL = os.getenv("API_URL", "http://localhost/api/v1")

print(f"Starting E2E Integration Verification against Base URL: {BASE_URL}")

session = requests.Session()

# Step 1: Authentication Flow
print("\n--- Step 1: Authentication Flow ---")
login_url = f"{BASE_URL}/auth/login"
login_data = {
    "username": "admin",
    "password": "QuantumShield@2026"
}
try:
    response = session.post(login_url, data=login_data, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Response JSON: {response.json()}")
    assert response.status_code == 200, "Authentication failed!"
    print("Authentication Flow Verified Successfully.")
except Exception as e:
    print(f"Error during Authentication: {e}")
    sys.exit(1)

# Step 2: Get Current User (verify JWT session cookie)
print("\n--- Step 2: Session Identity Verification ---")
me_url = f"{BASE_URL}/auth/me"
try:
    response = session.get(me_url, timeout=5)
    print(f"Status Code: {response.status_code}")
    print(f"Response JSON: {response.json()}")
    assert response.status_code == 200, "Failed to retrieve identity!"
    assert response.json().get("username") == "admin", "User identity mismatch!"
    print("Session Identity Verified Successfully.")
except Exception as e:
    print(f"Error during Identity Verification: {e}")
    sys.exit(1)

# Step 3: Threat intelligence / AI Analyst Queries
print("\n--- Step 3: AI Threat Analyst Verification ---")
session_url = f"{BASE_URL}/analyst/new-session"
chat_url = f"{BASE_URL}/analyst/stream"
try:
    # 3.1: Create a new analyst session
    resp_sess = session.post(session_url, timeout=10)
    print(f"New Session Status Code: {resp_sess.status_code}")
    session_id = resp_sess.json().get("session_id")
    print(f"Session ID: {session_id}")
    assert resp_sess.status_code == 200, "Failed to create new analyst session!"
    assert session_id is not None, "Session ID not received!"

    # 3.2: Stream chat message
    chat_payload = {
        "message": "Verify quantum vulnerability indicators on active ECDSA certificates.",
        "session_id": session_id,
        "include_simulation_context": False,
        "include_report_context": False
    }
    response = session.post(chat_url, json=chat_payload, timeout=15, stream=True)
    print(f"Stream Status Code: {response.status_code}")
    assert response.status_code == 200, "AI Analyst stream connection failed!"

    # Read and print the SSE chunks
    print("Streaming AI response chunks:")
    has_done = False
    for line in response.iter_lines():
        if line:
            line_str = line.decode('utf-8')
            if line_str.startswith("data: "):
                event_data = line_str[6:].strip()
                print(f"Event: {event_data}")
                if '"type":"done"' in event_data or '"type": "done"' in event_data:
                    has_done = True
    assert has_done, "AI Analyst stream did not terminate with done event!"
    print("AI Threat Analyst Verification Successfully completed.")
except Exception as e:
    print(f"Error during AI Analyst query: {e}")
    sys.exit(1)

# Step 4: Quantum Attack Lab Shor's Simulation
print("\n--- Step 4: Shor's Cryptanalysis Simulation ---")
sim_url = f"{BASE_URL}/simulation/shor"
sim_payload = {
    "key_size": 15
}
job_id = None
try:
    response = session.post(sim_url, json=sim_payload, timeout=10)
    print(f"Status Code: {response.status_code}")
    data = response.json()
    print(f"Response JSON: {data}")
    assert response.status_code == 200, "Simulation trigger failed!"
    job_id = data.get("job_id")
    assert job_id is not None, "Job ID not received!"
    print(f"Simulation Job ID: {job_id}")
except Exception as e:
    print(f"Error during Shor's Simulation trigger: {e}")
    sys.exit(1)

# Step 5: Poll Simulation Status
print("\n--- Step 5: Polling Simulation Status ---")
status_url = f"{BASE_URL}/simulation/status/{job_id}"
completed = False
retries = 20
for attempt in range(retries):
    try:
        response = session.get(status_url, timeout=5)
        data = response.json()
        status = data.get("status")
        print(f"Attempt {attempt+1}/{retries}: Status = {status}")
        if status in ["COMPLETED", "SUCCESS"]:
            print(f"Simulation succeeded. Result details: {data}")
            completed = True
            break
        elif status == "FAILED":
            print(f"Simulation job failed: {data}")
            sys.exit(1)
        time.sleep(1)
    except Exception as e:
        print(f"Error checking simulation status: {e}")
        sys.exit(1)

if not completed:
    print("Simulation job timed out!")
    sys.exit(1)

# Step 6: Benchmark Center Flow
print("\n--- Step 6: Benchmark Suite Execution ---")
bench_run_url = f"{BASE_URL}/benchmark/run"
try:
    response = session.post(bench_run_url, json={}, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Response JSON: {response.json()}")
    assert response.status_code == 200, "Benchmark run triggering failed!"
    print("Benchmark started successfully.")
except Exception as e:
    print(f"Error starting benchmark: {e}")
    sys.exit(1)

# Step 7: Poll Benchmark Results
print("\n--- Step 7: Polling Benchmark Results ---")
bench_results_url = f"{BASE_URL}/benchmark/results"
completed = False
for attempt in range(retries):
    try:
        response = session.get(bench_results_url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"Attempt {attempt+1}/{retries}: Benchmark Completed! Results count: {len(data)}")
            print(f"First result algorithm: {data[0].get('algorithm') if data else 'None'}")
            completed = True
            break
        elif response.status_code == 404:
            print(f"Attempt {attempt+1}/{retries}: Status = PENDING/RUNNING")
        else:
            print(f"Attempt {attempt+1}/{retries}: Unexpected status code {response.status_code}")
        time.sleep(2)
    except Exception as e:
        print(f"Error checking benchmark status: {e}")
        sys.exit(1)

if not completed:
    print("Benchmark task timed out!")
    sys.exit(1)

# Step 8: JWT Algorithm Audit
print("\n--- Step 8: JWT Cryptographic Audit Verification ---")
audit_url = f"{BASE_URL}/classical/jwt/audit"
# Generate or mock a standard classical RS256 token representation
mock_jwt = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yX_SfQJWt8MY"
audit_payload = {
    "token": mock_jwt
}
try:
    response = session.post(audit_url, json=audit_payload, timeout=5)
    print(f"Status Code: {response.status_code}")
    print(f"Response JSON: {response.json()}")
    res_data = response.json()
    assert res_data.get("header", {}).get("alg") == "RS256", "Audited algorithm mismatch!"
    assert res_data.get("verdict") == "VULNERABLE", "Quantum risk evaluation mismatch!"
    print("JWT Cryptographic Audit Verified Successfully.")
except Exception as e:
    print(f"Error during JWT audit: {e}")
    sys.exit(1)

# Step 9: Classical SSL Domain Scan
print("\n--- Step 9: Classical SSL Domain Scan Verification ---")
scan_url = f"{BASE_URL}/classical/scan-domain"
scan_payload = {
    "domain": "google.com"
}
try:
    response = session.post(scan_url, json=scan_payload, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Response JSON: {response.json()}")
    assert response.status_code == 200, "Domain scanner failed!"
    data = response.json()
    assert data.get("domain") == "google.com", "Scanned domain mismatch!"
    assert "key_type" in data, "Key type missing from scan response!"
    print("Classical SSL Domain Scan Verified Successfully.")
except Exception as e:
    print(f"Error during domain scan: {e}")
    sys.exit(1)

# Step 10: AI Code Scanner & Refactoring Verification
print("\n--- Step 10: AI Code Scanner & Refactoring Verification ---")
scan_url = f"{BASE_URL}/ai/scan"
refactor_url = f"{BASE_URL}/ai/refactor"
code_snippet = "import cryptography.hazmat.primitives.asymmetric.rsa as rsa\nkey = rsa.generate_private_key(65537, 2048)"
try:
    # Test Scan
    scan_resp = session.post(scan_url, json={"filename": "test.py", "content": code_snippet}, timeout=5)
    print(f"Scan Status: {scan_resp.status_code}")
    assert scan_resp.status_code == 200, "AI Scan failed!"
    scan_data = scan_resp.json()
    findings = scan_data.get("findings", [])
    print(f"Scan findings: {findings}")
    assert len(findings) > 0, "No vulnerabilities found in vulnerable code!"

    # Test Refactor
    refactor_resp = session.post(refactor_url, json={"code": code_snippet, "findings": findings}, timeout=5)
    print(f"Refactor Status: {refactor_resp.status_code}")
    assert refactor_resp.status_code == 200, "AI Refactor failed!"
    refactor_data = refactor_resp.json()
    print(f"Refactor fixes: {refactor_data.get('fixes_applied')}")
    assert "refactored_code" in refactor_data, "Refactored code missing!"
    print("AI Code Scanner & Refactoring Verified Successfully.")
except Exception as e:
    print(f"Error during AI scan/refactor verification: {e}")
    sys.exit(1)

# Step 11: AI Roadmap & Batch Scanner Verification
print("\n--- Step 11: AI Roadmap & Batch Scanner Verification ---")
roadmap_url = f"{BASE_URL}/ai/roadmap"
batch_url = f"{BASE_URL}/ai/batch-scan"
try:
    # Test Roadmap
    roadmap_resp = session.post(roadmap_url, json={"findings": [{"line": 1, "technology": "RSA"}]}, timeout=5)
    print(f"Roadmap Status: {roadmap_resp.status_code}")
    assert roadmap_resp.status_code == 200, "AI Roadmap failed!"
    roadmap_data = roadmap_resp.json()
    print(f"Roadmap summary: {roadmap_data.get('summary')}")
    assert len(roadmap_data.get("phases", [])) > 0, "Roadmap phases missing!"

    # Test Batch Scan
    batch_resp = session.post(batch_url, json={"files": [{"filename": "f1.py", "content": "import rsa"}, {"filename": "f2.py", "content": "import hashlib.md5"}]}, timeout=5)
    print(f"Batch Scan Status: {batch_resp.status_code}")
    assert batch_resp.status_code == 200, "AI Batch Scan failed!"
    batch_data = batch_resp.json()
    print(f"Batch summary: {batch_data.get('summary')}")
    assert len(batch_data.get("results", [])) == 2, "Batch results count mismatch!"
    print("AI Roadmap & Batch Scanner Verified Successfully.")
except Exception as e:
    print(f"Error during AI roadmap/batch verification: {e}")
    sys.exit(1)

print("\n=============================================")
print("  ALL E2E INTEGRATION TESTS PASSED SUCCESSFULLY!  ")
print("=============================================")
sys.exit(0)
