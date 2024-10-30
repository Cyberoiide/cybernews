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
        
        # Attendre que Elasticsearch soit prêt
        while True:
            try:
                self.es = Elasticsearch(['http://elasticsearch:9200'])
                self.es.ping()
                break  # Si ça fonctionne, sortir de la boucle
            except Exception:
                print("Attente de la connexion à Elasticsearch...")
                time.sleep(5)  # Attendre 5 secondes avant de réessayer

    def parse(self, response):
        articles = response.css('div.body-post.clear')
        
        for article in articles:
            title = article.css('h2.home-title::text').get()
            url = article.css('a.story-link::attr(href)').get()
            date_text = article.css('span.h-datetime::text').get()
            description = article.css('div.home-desc::text').get()
            tags = article.css('span.h-tags::text').getall()
            image_url = article.css('div.home-img img::attr(src)').get()

            # Conversion de la date
            date = datetime.strptime(date_text, '%b %d, %Y').isoformat()

            # Créer le document partiel
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

            # Passer au parsing du contenu complet de l'article
            if url and url.startswith("http"):
                yield response.follow(url, self.parse_article, meta={'doc': doc})

    def parse_article(self, response):
        doc = response.meta['doc']
        
        # Extraction du contenu complet de l'article
        content_paragraphs = response.css('div.articlebody.clear.cf p::text').getall()
        doc["content"] = " ".join(content_paragraphs)  # Concaténer les paragraphes
        
        # Envoi du document à Elasticsearch
        try:
            self.es.index(index="cybernews", document=doc)
        except Exception as e:
            self.logger.error(f"Erreur lors de l'indexation de l'article: {e}")
        
        yield doc
