import os
import re
import sys

# Directory Configs
BASE_DIR = r"c:\Users\SAM\Documents\Antigravity\indiaCardredemptions\indiaCardRedemptions"
SRC_DIR = os.path.join(BASE_DIR, "src")
TESTS_DIR = os.path.join(SRC_DIR, "__tests__")

# Regex Matches
FEATURE_DECLARATION_RX = re.compile(r"@feature\s+(FT-\d+_[A-Za-z0-9_]+)")
TEST_COVERAGE_RX = re.compile(r"\[(FT-\d+_[A-Za-z0-9_]+)\]")

def scan_features():
    declared_features = {}
    for root, dirs, files in os.walk(SRC_DIR):
        # Skip test directories and node_modules
        if "__tests__" in root or "node_modules" in root:
            continue
            
        for file in files:
            if file.endswith((".ts", ".tsx")):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        content = f.read()
                        matches = FEATURE_DECLARATION_RX.findall(content)
                        for match in matches:
                            declared_features[match] = os.path.relpath(filepath, SRC_DIR)
                except Exception as e:
                    print(f"Warning: Could not read {filepath}: {e}")
    return declared_features

def scan_tests():
    covered_features = set()
    if not os.path.exists(TESTS_DIR):
        return covered_features
        
    for root, dirs, files in os.walk(TESTS_DIR):
        for file in files:
            if file.endswith((".ts", ".tsx")):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        content = f.read()
                        matches = TEST_COVERAGE_RX.findall(content)
                        for match in matches:
                            covered_features.add(match)
                except Exception as e:
                    print(f"Warning: Could not read {filepath}: {e}")
    return covered_features

def main():
    print("====================================================")
    print("[TDD COMPLIANCE MONITOR] VERIFYING FEATURE COVERAGE")
    print("====================================================")
    
    features = scan_features()
    tests = scan_tests()
    
    print(f"Found {len(features)} declared feature annotations in codebase.")
    print(f"Found {len(tests)} test suites matching feature bracket patterns.")
    
    untested = []
    for feature_id, file_path in features.items():
        if feature_id not in tests:
            untested.append((feature_id, file_path))
            
    if untested:
        print("\n[FAIL] TDD COMPLIANCE FAILURE: Untested features detected!")
        for feat_id, path in untested:
            print(f"  - [{feat_id}] in file: {path} (Requires a test case in src/__tests__ with '[{feat_id}]' in describe/it)")
        print("\nBuild aborted. Please write the required test specs first.")
        sys.exit(1)
    else:
        print("\n[SUCCESS] TDD COMPLIANCE: All declared features are mapped to tests!")
        sys.exit(0)

if __name__ == "__main__":
    main()
