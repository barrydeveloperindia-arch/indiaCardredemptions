# Dockerfile for Englabs MES Backend
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
# libgl1-mesa-glx and libglib2.0-0 are often needed for GUI-less CAD/CV tools
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    libgl1 \
    libglib2.0-0 \
    libxrender1 \
    libxext6 \
    libsm6 \
    freecad \
    mesa-utils \
    xvfb \
    libxkbcommon-x11-0 \
    libxcb-icccm4 \
    libxcb-image0 \
    libxcb-keysyms1 \
    libxcb-randr0 \
    libxcb-render-util0 \
    libxcb-xinerama0 \
    libxcb-xinput0 \
    libxcb-xfixes0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . /app

# Set path
ENV PYTHONPATH=/app

# Expose API port
EXPOSE 8000

# Run command
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
