import requests
from elasticsearch import Elasticsearch

# Elasticsearch settings
elasticsearch_url = "http://localhost:9200"
index_name = "cybernews"  # Replace with your index name
es = Elasticsearch([{'scheme': 'http', 'host': 'localhost', 'port': 9200}])

# Step 1: Fetch duplicate URLs
duplicate_query = {
    "size": 0,
    "aggs": {
        "duplicate_urls": {
            "terms": {
                "field": "url.keyword",
                "size": 10000,  # Adjust based on expected number of duplicates
                "min_doc_count": 2
            }
        }
    }
}

# Perform the aggregation query
response = es.search(index=index_name, body=duplicate_query)
duplicates = [bucket['key'] for bucket in response['aggregations']['duplicate_urls']['buckets']]

# Step 2: For each duplicate URL, find the newer entries and delete them
for url in duplicates:
    # Fetch documents with this URL, sorted by date (assumes 'date' field exists)
    docs_query = {
        "query": {
            "term": {
                "url.keyword": url
            }
        },
        "sort": {
            "date": {
                "order": "asc"
            }
        }
    }

    # Perform the search to get all documents with the duplicate URL
    docs_response = es.search(index=index_name, body=docs_query)

    # Collect the IDs of documents to delete (skip the oldest one)
    ids_to_delete = [doc['_id'] for doc in docs_response['hits']['hits'][1:]]  # Skip the first (oldest)

    if ids_to_delete:
        # Step 3: Delete newer documents
        delete_query = {
            "query": {
                "terms": {
                    "_id": ids_to_delete
                }
            }
        }

        delete_response = es.delete_by_query(index=index_name, body=delete_query)
        print(f"Deleted {delete_response['deleted']} documents for URL: {url}")
    else:
        print(f"No duplicates to delete for URL: {url}")
