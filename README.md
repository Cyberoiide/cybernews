# 📊 Project Scoping Report: Cybersecurity News Monitoring Platform

---

## 🚀 1. Context and Main Idea

The project aims to develop a **cybersecurity news platform** that automatically collects news articles from various online sources. The goal is to **gather all relevant information in one place**, preventing users from navigating multiple sites to stay informed. Whether it’s technical news, general updates, financial news, or other cybersecurity-related topics, the platform will provide centralized access to all this information.

The platform will merge articles on the same subject using an optimized deduplication approach, minimizing resource usage. Artificial intelligence (AI) will be employed to summarize the merged articles and present them concisely and clearly. Additionally, users will be able to vote on the **"relevance" or "hotness"** of articles, highlighting the most important or popular information.

Users will also have the ability to create their own articles on new developments not yet published elsewhere. An intelligent verification and merging system will be in place to avoid redundancies, ensuring that information remains fresh and unique.

---

## 🎯 2. Objectives and Scope

- **Automated Information Collection**: Crawl web pages on cybersecurity to retrieve relevant articles.
- **Optimized Article Merging**: Use a multi-step approach to effectively identify and merge similar articles.
- **AI Summarization and Rewriting**: Utilize AI to summarize and rewrite merged articles, preserving key information and original sources.
- **User Interactions**: Allow users to create and customize their own articles, with an optimized redundancy-checking system.
- **Real-Time Updates**: Display articles dynamically and in real-time.
- **Automatic Tag Generation**: Use AI to automatically generate relevant tags for each article.
- **Article Recommendations**: Integrate a recommendation system based on user preferences.
- **Article Ratings**: Enable subscribed users to rate the relevance and reliability of articles.
- **Bookmarks and Social Sharing**: Provide the ability to save articles as favorites and share them on social media.
- **Article Sentiment Analysis**: Use AI to analyze the general sentiment of articles (non-priority feature).

---

## 🔍 3. Optimized Approach for Article Deduplication

To ensure effective deduplication without overloading resources, a multi-step approach will be adopted:

- **Metadata-Based Pre-filtering**: Initial comparison of articles using metadata such as titles, publication dates, authors, and sources.
- **Named Entity Extraction and Comparison**: Use named entity recognition techniques to identify articles mentioning the same companies, people, or key events.
- **Hashing and N-grams**: Apply hashing functions and extract N-grams for quick textual content comparison.
- **Advanced Similarity Analysis**: For remaining articles, use more sophisticated similarity algorithms, such as cosine similarity on TF-IDF vectors.
- **Selective AI Application**: Use advanced AI models only for cases where previous steps did not yield a conclusion.

---

## 🏗️ 4. Microservices Architecture

To ensure the efficiency and speed of the solution, a **microservices architecture** will be adopted, with each component of the system divided into independent services:

- **Crawling Service**: Retrieving articles from the web.
- **Pre-filtering Service**: Initial comparison based on metadata and N-grams.
- **Advanced Deduplication Service**: Applying similarity algorithms and AI for article merging.
- **AI Service**: Summarizing and rewriting merged articles, generating automatic tags, sentiment analysis, and recommendations.
- **User Management Service**: Managing user-created articles, authentication, and authorization.
- **Moderation Service**: Moderating user-generated content.
- **Rating and Recommendation Service**: Managing article ratings and providing recommendations based on user interactions.

---

## 💻 5. Technologies and Tools

- **Containerization with Docker**: Each microservice will be containerized for better portability and ease of deployment.
- **Orchestration with Kubernetes**: Managing containers to ensure scalability and resilience of the system.
- **Database**: Use of suitable databases (e.g., **PostgreSQL** for relational data and **Elasticsearch** for full-text search).
- **Languages and Frameworks**:
    - **Golang (Go)** for high-performance services, such as the crawler.
    - **Python** with frameworks like **FastAPI** for AI services.
    - **React** for the frontend, allowing seamless integration with backend APIs.

---

## 🌟 6. Key Features

### 6.1 Automated Information Collection

- **Web Crawler**: Use **Colly** (Golang) to crawl web pages at regular intervals, respecting site policies (robots.txt).
- **Crawl Scheduling**: Set up scheduled tasks to avoid overloading source servers.
- **Request Rate Management**: Control request rates to avoid being blocked by target sites.

### 6.2 Optimized Article Deduplication

- **Storage of Metadata and Pre-calculated Features**: Store key metadata, N-grams, and hashes for each article in the database.
- **Fast Pre-filtering**: Initial comparison based on metadata to quickly identify candidate articles for duplication.
- **Comparison of N-grams and Hashes**: Use this data for quick comparison without analyzing the entire content.
- **In-depth Analysis with AI**: Apply advanced models only to articles requiring further verification.

### 6.3 AI Summarization and Rewriting

- **Use of Appropriate NLP Models**: Integrate models like **GPT-4** or open-source alternatives to summarize and rewrite merged articles.
- **Quality Control**: Implement validations to ensure the accuracy and relevance of generated summaries.
- **Automatic Tag Generation**: AI generates relevant tags for each article to facilitate search and classification.

### 6.4 User Article Creation

- **Writing Interface**: Intuitive interface for users to create their own articles.
- **Optimized Redundancy Checking**: Apply multi-step approaches to verify similarities with existing articles before publication.
- **Change Management**: Allow users to modify or delete their articles.

### 6.5 User Management and Moderation

- **Secure Authentication**: Use **JWT** to secure communications and user sessions.
- **Personalized Dashboard**: Personal space for users to manage their contributions and favorites.
- **Moderation System**: Manual and AI-assisted moderation to ensure content quality.

---

## ⚙️ 7. Development and Deployment

- **Modular Development**: Microservices will be developed independently for better task management.
- **Testing**: Set up unit, integration, and performance tests to ensure system quality.
- **Cloud Deployment**: Use managed services like **AWS EKS** or **Google Kubernetes Engine** for deployment.
- **CI/CD**: Implement continuous integration and deployment pipelines to automate updates.

---

## 🔒 8. Security and Compliance

- **Data Security**: Encrypt sensitive data in transit and at rest.
- **Attack Protection**: Implement application firewalls and secure coding practices.
- **Regulatory Compliance**: Adhere to regulations like GDPR for personal data management.

---

## 🏁 9. Conclusion

The project aims to create an efficient, scalable, and resource-optimized cybersecurity monitoring platform. By adopting a strategic approach to article deduplication and utilizing appropriate technologies, we ensure a quality user experience while managing resources and system performance effectively.
