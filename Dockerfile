FROM python:3.13-slim

WORKDIR /app

# Bağımlılıkları yükle
COPY apps/api/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Proje dosyalarını kopyala
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# PYTHONPATH ayarla (packages/ klasörünü bulsun)
ENV PYTHONPATH=/app/packages

# Çalışma dizini API
WORKDIR /app/apps/api

# Port
EXPOSE 8000

# Başlat — main.py içinde PORT env okunur
ENTRYPOINT ["python", "main.py"]
