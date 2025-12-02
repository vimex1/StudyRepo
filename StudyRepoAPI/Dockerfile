FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

RUN pip install --upgrade pip wheel "poetry==2.1.2"

RUN poetry config virtualenvs.create false

COPY pyproject.toml poetry.lock ./
RUN poetry remove psycopg2
RUN poetry add psycopg2-binary==2.9.10
    

RUN poetry install --no-cache

COPY . .

EXPOSE 8000

