# Dockerfile for Englabs MES Backend
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y libpq-dev gcc

# Copy requirements
# (In a real scenario, you'd have a requirements.txt, generating it inline for simplicity)
RUN echo "fastapi\nuvicorn\nsqlalchemy\npsycopg2-binary\npydantic\nrequests\npython-jose[cryptography]\nbcrypt\npython-multipart\npasslib" > requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
# Copy all source code (including scripts)
COPY . /app

# Set path
ENV PYTHONPATH=/app

# Expose API port
EXPOSE 8000

# Run command
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
