FROM python:3.11-slim

# Install system dependencies if any
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install poetry
RUN pip install "poetry>=2.0.0"

# Set working directory
WORKDIR /app

# Copy poetry config files
COPY pyproject.toml poetry.lock* ./

# Configure poetry to not use virtualenvs inside Docker
RUN poetry config virtualenvs.create false

# Copy source code and models
COPY src/ ./src/
COPY models/ ./models/

# Install dependencies (including torch)
# This will use the requirements from pyproject.toml
RUN poetry install --no-interaction --no-ansi

# Expose port
EXPOSE 8000

# Run the FastAPI server
ENV PYTHONPATH="/app/src"
CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8000"]
