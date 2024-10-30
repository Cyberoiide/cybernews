from fastapi import FastAPI, HTTPException
from elasticsearch import Elasticsearch
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import hashlib

app = FastAPI()
es = Elasticsearch("http://elasticsearch:9200")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def format_date(date_str: str) -> str:
    try:
        date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        return date.strftime("%B %d, %Y %I:%M %p")
    except:
        return date_str

@app.get("/articles")
def read_articles(tag: str = None, start_date: str = None, end_date: str = None, page: int = 1, size: int = 10):
    try:
        # Build query
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

        # Execute search
        res = es.search(index="cybernews", body={
            "query": query,
            "from": (page - 1) * size,
            "size": size
        })

        # Transform results to match frontend expectations
        articles = []
        for hit in res["hits"]["hits"]:
            source = hit["_source"]
            
            # Generate a stable numeric ID using MD5 hash
            md5_hash = hashlib.md5(hit["_id"].encode()).hexdigest()
            numeric_id = int(md5_hash[:8], 16) % 100000

            # Extract first value from array fields
            title = source.get("title", [""])[0] if isinstance(source.get("title"), list) else source.get("title", "")
            content = source.get("content", [""])[0] if isinstance(source.get("content"), list) else source.get("content", "")
            date = source.get("date", [""])[0] if isinstance(source.get("date"), list) else source.get("date", "")
            tags = source.get("tags", [""])[0] if isinstance(source.get("tags"), list) else source.get("tags", "")
            url = source.get("url", [""])[0] if isinstance(source.get("url"), list) else source.get("url", "")
            
            # Split tags if they contain "/"
            tag_list = [t.strip() for t in tags.split("/")] if isinstance(tags, str) else [tags] if tags else []
            
            article = {
                "id": numeric_id,
                "title": title,
                "description": content[:200] + "..." if content else "",
                "date": format_date(date),
                "sources": ["The Hacker News"],  # All articles are from THN
                "image": source.get("image_url", ["/placeholder.svg?height=100&width=200"])[0],
                "category": "general",  # Default category
                "tags": tag_list,
                "rating": 4.5,  # Default rating
                "comments": []  # No comments initially
            }
            
            # Determine category based on tags
            if any("financ" in tag.lower() for tag in tag_list):
                article["category"] = "finance"
            elif any(tag.lower() in ["tech", "vulnerability", "security"] for tag in tag_list):
                article["category"] = "technical"

            articles.append(article)

        return {
            "articles": articles,
            "total": res["hits"]["total"]["value"]
        }
    except Exception as e:
        print(f"Error processing articles: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
