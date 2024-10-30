from fastapi import FastAPI, HTTPException, Query
from elasticsearch import Elasticsearch
from pydantic import BaseModel
from typing import List, Optional
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
def read_articles(
    tag: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    sort: str = Query(default="date", regex="^(date|relevance)$")
):
    try:
        # Build query
        must_conditions = []

        # Add tag filter if provided
        if tag:
            must_conditions.append({"term": {"tags.keyword": tag}})

        # Add search if provided
        if search:
            must_conditions.append({
                "multi_match": {
                    "query": search,
                    "fields": ["title^2", "content", "tags"],
                    "type": "best_fields",
                    "fuzziness": "AUTO"
                }
            })

        # Add date range if provided
        if start_date and end_date:
            must_conditions.append({
                "range": {
                    "date": {
                        "gte": start_date,
                        "lte": end_date
                    }
                }
            })

        # Build final query
        query = {
            "bool": {
                "must": must_conditions
            }
        } if must_conditions else {"match_all": {}}

        # Add sorting
        sort_config = [{"date": {"order": "desc"}}]
        if sort == "relevance" and search:
            sort_config = ["_score", {"date": {"order": "desc"}}]

        # Execute search
        res = es.search(index="cybernews", body={
            "query": query,
            "from": (page - 1) * size,
            "size": size,
            "sort": sort_config,
            "track_total_hits": True
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
            
            # Handle image URL
            image_url = source.get("image_url", ["/placeholder.svg?height=100&width=200"])[0]
            if isinstance(image_url, list) and image_url:
                image_url = image_url[0]
            if image_url and image_url.startswith('data:image/svg+xml;base64,'):
                image_url = "/placeholder.svg?height=100&width=200"
            
            article = {
                "id": hit["_id"],  # Use the original _id directly
                "title": title,
                "description": content[:200] + "..." if content else "",
                "date": format_date(date),
                "sources": ["The Hacker News"],
                "image": image_url,
                "category": "general",
                "tags": tag_list,
                "rating": 4.5,
                "comments": [],
                "url": url
            }
            
            # Determine category based on tags
            if any("financ" in t.lower() for t in tag_list):
                article["category"] = "finance"
            elif any(t.lower() in ["tech", "vulnerability", "security", "ai"] for t in tag_list):
                article["category"] = "technical"

            articles.append(article)

        return {
            "articles": articles,
            "total": res["hits"]["total"]["value"],
            "page": page,
            "size": size,
            "pages": (res["hits"]["total"]["value"] + size - 1) // size
        }
    except Exception as e:
        print(f"Error processing articles: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Failed to fetch articles",
                "error": str(e)
            }
        )

@app.get("/articles/{article_id}")
def read_article(article_id: str):
    try:
        # Fetch the article directly by its `_id`
        res = es.get(index="cybernews", id=article_id)
        
        # Access the document source if the article is found
        source = res["_source"]
        
        # Return the full article content
        return {"article": source}
    except Exception as e:
        # Handle cases where the article is not found or other exceptions
        raise HTTPException(status_code=404, detail="Article not found" if "NotFoundError" in str(e) else str(e))
