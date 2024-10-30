export interface Article {
    id: string;  // Changed from number to string to match Elasticsearch _id
    title: string;
    description: string;
    content: string;  // Added content field
    date: string;
    sources: string[];
    image: string;
    category: string;
    tags: string[];
    rating: number;
    comments: Comment[];
    votes: number;
    url: string;
    originalUrl: string;
  }
  
  export interface Comment {
    id: number;
    user: string;
    content: string;
    date: string;
  }
  
  export interface ArticlesResponse {
    articles: Article[];
    total: number;
  }