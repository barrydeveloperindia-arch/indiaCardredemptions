import os
import sys

def verify_config():
    required_vars = [
        "SETU_CLIENT_ID",
        "SETU_CLIENT_SECRET",
        "SETU_PRIVATE_KEY",
        "SETU_PRODUCT_INSTANCE_ID" # Optional but good to check
    ]
    
    missing = []
    print("Verifying Account Aggregator Configuration...")
    print("-" * 40)
    
    for var in required_vars:
        value = os.environ.get(var)
        if not value:
            if var == "SETU_PRODUCT_INSTANCE_ID":
                print(f"[WARN] {var} is not set (might be optional based on setup).")
            else:
                print(f"[FAIL] {var} is missing.")
                missing.append(var)
        else:
            masked = value[:4] + "*" * (len(value)-4) if len(value) > 4 else "****"
            print(f"[OK]   {var} found ({masked})")
            
    try:
        import jwcrypto
        print("[OK]   jwcrypto library installed.")
    except ImportError:
        print("[FAIL] jwcrypto library NOT installed. Run 'pip install jwcrypto'.")
        missing.append("jwcrypto")

    print("-" * 40)
    if missing:
        print(f"FAILED: Please set the following environment variables: {', '.join(missing)}")
        sys.exit(1)
    else:
        print("SUCCESS: Configuration looks good.")
        sys.exit(0)

if __name__ == "__main__":
    verify_config()
