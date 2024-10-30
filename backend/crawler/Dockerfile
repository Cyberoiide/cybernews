FROM python:3.9-slim

WORKDIR /app

# Installer les dépendances
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copier le projet Scrapy
COPY . /app

# Commande pour exécuter le spider
CMD ["scrapy", "crawl", "thehackernews_spider"]
