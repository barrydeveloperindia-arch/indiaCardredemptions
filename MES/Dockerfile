# Dockerfile for Englabs MES Backend
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y libpq-dev gcc

# Copy requirements
# (In a real scenario, you'd have a requirements.txt, generating it inline for simplicity)
RUN echo "fastapi\nuvicorn\nsqlalchemy\npsycopg2-binary\npydantic\nrequests\npython-jose[cryptography]\nbcrypt\npython-multipart" > requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY ./src /app/src

# Set path
ENV PYTHONPATH=/app

# Expose API port
EXPOSE 8000

# Run command
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
