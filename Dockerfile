FROM python:3.13-slim

WORKDIR /app

# Bağımlılıkları yükle
COPY apps/api/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Proje dosyalarını kopyala
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
COPY .env.example ./.env.example

# Çalışma dizini API
WORKDIR /app/apps/api

# Port
EXPOSE 8000

# Başlat — Railway $PORT env verir
CMD python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
