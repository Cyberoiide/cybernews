import scrapy
import json
from datetime import datetime
from elasticsearch import Elasticsearch
import time

class TheHackerNewsSpider(scrapy.Spider):
    name = "thehackernews_spider"
    start_urls = ['https://thehackernews.com/']
    
    def __init__(self, *args, **kwargs):
        super(TheHackerNewsSpider, self).__init__(*args, **kwargs)
        
        # Wait for Elasticsearch to be ready
        while True:
            try:
                self.es = Elasticsearch(['http://elasticsearch:9200'])
                self.es.ping()
                break
            except Exception:
                print("Waiting for Elasticsearch connection...")
                time.sleep(5)

    def parse(self, response):
        articles = response.css('div.body-post.clear')
        
        for article in articles:
            title = article.css('h2.home-title::text').get()
            url = article.css('a.story-link::attr(href)').get()
            date_text = article.css('span.h-datetime::text').get()
            description = article.css('div.home-desc::text').get()
            tags = article.css('span.h-tags::text').getall()
            image_url = article.css('div.home-img img::attr(src)').get()

            # Convert date
            date = datetime.strptime(date_text, '%b %d, %Y').isoformat()

            # Create partial document
            doc = {
                "title": title,
                "content": description,
                "date": date,
                "entities": [],
                "ngrams": [],
                "hash": hash(title),
                "url": url,
                "tags": tags,
                "image_url": image_url
            }

            # Proceed to parse full article content
            if url and url.startswith("http"):
                yield response.follow(url, self.parse_article, meta={'doc': doc})

    def parse_article(self, response):
        doc = response.meta['doc']
        
        # Extract full article content
        content_paragraphs = response.css('div.articlebody.clear.cf p::text').getall()
        doc["content"] = " ".join(content_paragraphs)
        
        # Check if the article already exists in Elasticsearch
        existing_doc = self.es.search(index="cybernews", body={
            "query": {
                "term": {
                    "url.keyword": doc["url"]
                }
            }
        })

        # If the article doesn't exist, index it
        if existing_doc['hits']['total']['value'] == 0:
            try:
                self.es.index(index="cybernews", document=doc, id=doc["url"])
                self.logger.info(f"Indexed article: {doc['title']}")
            except Exception as e:
                self.logger.error(f"Error indexing article: {e}")
        else:
            self.logger.info(f"Article already exists: {doc['title']}")
        
        yield doc