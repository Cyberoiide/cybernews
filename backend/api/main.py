from fastapi import FastAPI, HTTPException
from elasticsearch import Elasticsearch
from pydantic import BaseModel
from typing import List

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
es = Elasticsearch("http://elasticsearch:9200")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Remplacez par votre domaine en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Article(BaseModel):
    title: str
    content: str
    date: str
    tags: List[str]
    url: str
    image_url: str
    category: str
    entities: List[dict]
    hash: str
    ngrams: str


@app.on_event("startup")
async def startup_event():
    # Utilisation de l'indice "cybernews"
    if not es.indices.exists(index="cybernews"):
        es.indices.create(index="cybernews", body={
            "mappings": {
                "properties": {
                    "title": {"type": "text"},
                    "content": {"type": "text"},
                    "date": {"type": "date"},
                    "tags": {"type": "keyword"},
                    "url": {"type": "text"},
                    "image_url": {"type": "text"},
                    "category": {"type": "text"},
                }
            }
        })


@app.post("/articles")
def create_article(article: Article):
    try:
        # Création de l'article pour Elasticsearch
        doc = {
            "title": article.title,
            "content": article.content,
            "date": article.date,
            "tags": article.tags,
            "url": article.url,
            "image_url": article.image_url,
            "category": article.category,
            "entities": article.entities,
            "hash": article.hash,
            "ngrams": article.ngrams
        }

        # Indexation de l'article dans "cybernews"
        res = es.index(index="cybernews", document=doc)

        return {"result": "Article created", "_id": res['_id']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/articles")
def read_articles(tag: str = None, start_date: str = None, end_date: str = None, page: int = 1, size: int = 10):
    query = {"match_all": {}}
    if tag:
        query = {"term": {"tags.keyword": tag}}
    if start_date and end_date:
        query = {
            "bool": {
                "must": [
                    {"range": {"date": {"gte": start_date, "lte": end_date}}}
                ]
            }
        }
    try:
        # Récupération des articles avec pagination et filtrage
        res = es.search(index="cybernews", body={
            "query": query,
            "from": (page - 1) * size,
            "size": size
        })
        articles = [hit["_source"] for hit in res["hits"]["hits"]]
        return {"articles": articles, "total": res["hits"]["total"]["value"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
