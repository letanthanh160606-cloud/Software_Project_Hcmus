# Omni Platforms — Backend

## Create DB

```bash
psql -U postgres -h localhost -c "CREATE DATABASE omni_platforms_dev;"
vào file .env.example đổi passwork thành pass riêng
$env:DATABASE_URL = "postgresql://postgres:<password_thật>@localhost:5432/omni_platforms_dev"
psql "$env:DATABASE_URL" -f database/file_database.sql


## Setup

```bash
py -3.12 -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env 
```

Run the API:

```bash
uvicorn app.main:app --reload
```

## Tests

```bash
pytest
```
