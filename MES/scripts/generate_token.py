from datetime import timedelta
from src.auth.utils import create_access_token

def generate_admin_token():
    # Create a token valid for 24 hours
    access_token = create_access_token(
        data={"sub": "admin", "role": "admin"},
        expires_delta=timedelta(hours=24)
    )
    print(f"\n[TOKEN_START]\n{access_token}\n[TOKEN_END]")

if __name__ == "__main__":
    generate_admin_token()
