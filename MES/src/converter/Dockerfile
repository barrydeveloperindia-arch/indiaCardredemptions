
FROM ubuntu:22.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Update and install system dependencies
# Update and install system dependencies
# We use the 'daily' PPA to get a modern FreeCAD (0.21+ or 1.0) which has much better .sldprt support support
RUN apt-get update && apt-get install -y --no-install-recommends \
    software-properties-common \
    gpg-agent \
    && add-apt-repository ppa:freecad-maintainers/freecad-daily \
    && apt-get update && apt-get install -y --no-install-recommends \
    freecad \
    freecad-python3 \
    xvfb \
    mesa-utils \
    libxkbcommon-x11-0 \
    libxcb-xinerama0 \
    libxcb-icccm4 \
    libxcb-image0 \
    libxcb-keysyms1 \
    libxcb-randr0 \
    libxcb-render-util0 \
    libxcb-xfixes0 \
    python3-pip \
    python3-venv \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies for the API server
# We use --break-system-packages because we are in a container and want to use the system python
# Create virtual environment to satisfy PEP 668
# Create virtual environment to satisfy PEP 668
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Install Python dependencies for the API server
# Install Python dependencies for the API server
RUN /opt/venv/bin/pip install --no-cache-dir fastapi uvicorn python-multipart requests

# Copy application code
COPY . /app

# Expose the API port
EXPOSE 5000

# Run Uvicorn wrapped in xvfb-run
# checks libGL via xvfb
CMD ["xvfb-run", "--auto-servernum", "--server-args='-screen 0 1024x768x24'", "/opt/venv/bin/python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
