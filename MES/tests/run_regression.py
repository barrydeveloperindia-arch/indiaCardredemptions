import os
import sys
import subprocess

# Define the tests to run
TESTS = [
    "tests/test_module_a.py",            # Dispatching Logic
    "tests/test_financials_v2.py",       # Invoicing (Authenticated)
    "tests/test_analysis_verification.py", # Part Analysis
    "tests/test_digital_traveler.py"     # Digital Traveler PDF
]

def run_test(test_path):
    print(f"\n[{test_path}] RUNNING...")
    try:
        # Run using python -m to ensure imports work relative to proj root
        # Adjust path: tests/test_module_a.py -> tests.test_module_a
        module_path = test_path.replace("/", ".").replace("\\", ".").replace(".py", "")
        
        result = subprocess.run(
            [sys.executable, "-m", module_path],
            capture_output=True,
            text=True,
            cwd=os.getcwd()
        )
        
        if result.returncode == 0:
            print(f"[{test_path}] ✅ PASS")
            # print(result.stdout) # Optional: print only on failure?
            return True
        else:
            print(f"[{test_path}] ❌ FAIL")
            print("--- STDOUT ---")
            print(result.stdout)
            print("--- STDERR ---")
            print(result.stderr)
            return False
    except Exception as e:
        print(f"[{test_path}] ❌ ERROR: {e}")
        return False

def main():
    print("=== STARTING REGRESSION SUITE ===")
    failed = []
    
    # 1. Run basic tests
    for test in TESTS:
        if not run_test(test):
            failed.append(test)
            
    print("\n=== SUMMARY ===")
    if failed:
        print(f"❌ {len(failed)} Tests Failed!")
        for f in failed:
            print(f" - {f}")
        sys.exit(1)
    else:
        print("✅ All Tests Passed!")
        sys.exit(0)

if __name__ == "__main__":
    main()
