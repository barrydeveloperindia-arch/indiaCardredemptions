from datetime import datetime, timedelta
from jose import jwt

# Hardcoded from utils.py
SECRET_KEY = "englabs_super_secret_key_change_in_prod"
ALGORITHM = "HS256"

def generate():
    expire = datetime.utcnow() + timedelta(hours=24)
    token = jwt.encode({"sub": "admin", "role": "admin", "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)
    print(f"__TOKEN_START__{token}__TOKEN_END__")

if __name__ == "__main__":
    generate()
