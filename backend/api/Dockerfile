# Utiliser une image de base Python
FROM python:3.9-slim

# Définir le répertoire de travail
WORKDIR /app

# Copier les requirements et installer les dépendances
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copier les fichiers de l’API
COPY . /app

# Définir la commande de lancement pour l’API
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
