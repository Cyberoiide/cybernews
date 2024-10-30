#!/bin/bash
echo "Waiting for Elasticsearch to start..."
until $(curl --output /dev/null --silent --head --fail http://localhost:9200); do
    printf '.'
    sleep 5
done

echo "Creating index with mappings..."
curl -X PUT "http://localhost:9200/cybernews" -H 'Content-Type: application/json' -d @/home/bosle/projects/v2_cybernews/data/elasticsearch/mappings.json
echo "Mappings applied."
