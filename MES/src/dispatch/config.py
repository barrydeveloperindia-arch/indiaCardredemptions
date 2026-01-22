from pydantic import BaseSettings

class DispatchConfig(BaseSettings):
    LLM_MODEL: str = "llama-3-70b-instruct"
    LLM_ENDPOINT: str = "http://localhost:8000/v1"
    VECTOR_DB_PATH: str = "dispatch_history"

    class Config:
        env_file = ".env"

settings = DispatchConfig()
