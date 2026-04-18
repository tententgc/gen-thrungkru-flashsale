FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /srv

# System libs required by LightGBM + Prophet
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libgomp1 && \
    rm -rf /var/lib/apt/lists/*

COPY pyproject.toml ./
RUN pip install --no-cache-dir -e .

COPY app ./app

EXPOSE 8080

ENV MODEL_DIR=/models
VOLUME ["/models"]

CMD ["uvicorn", "app.server:app", "--host", "0.0.0.0", "--port", "8080"]
