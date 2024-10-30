'use client'

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Bookmark, ExternalLink, Flame, Share2, Star } from 'lucide-react'
import ArticleImage from './article-image'
import Link from 'next/link'

interface ArticleCardProps {
  article: {
    id: string
    title: string
    description: string
    date: string
    sources: string[]
    image: string
    category: string
    tags: string[]
    rating: number
    votes: number
    url: string
    originalUrl: string
  }
  onSave: (article: any) => void
}

export function ArticleCard({ article, onSave }: ArticleCardProps) {
  // Ensure tags is always an array
  const tags = Array.isArray(article.tags) ? article.tags : []
  
  // Ensure title exists
  const title = article.title || "Untitled Article"
  
  // Ensure description exists
  const description = article.description || "No description available"
  
  // Ensure date is formatted
  const date = article.date || "Invalid Date"

  return (
    <Card className="overflow-hidden border-gray-200">
      <Link href={article.url} className="block">
        <div className="flex">
          <div className="flex-shrink-0 w-48 relative">
            <ArticleImage
              src={article.image}
              alt={title}
              width={200}
              height={100}
              className="h-full w-full object-cover"
            />
          </div>
          <CardContent className="flex-1 p-4">
            <div className="flex items-center justify-between mb-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="cursor-pointer">
                      {article.sources.length} source{article.sources.length > 1 ? 's' : ''}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <ul>
                      {article.sources.map((source, index) => (
                        <li key={index}>{source}</li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {article.sources.length > 1 && (
                <Badge variant="destructive">
                  <Flame className="mr-1 h-3 w-3" />
                  Hot
                </Badge>
              )}
            </div>
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <p className="text-gray-600 mb-2">{description}</p>
            <p className="text-sm text-gray-500 mb-2">{date}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center">
              <Star className="text-yellow-400 mr-1" />
              <span>{article.rating.toFixed(1)}</span>
            </div>
          </CardContent>
        </div>
      </Link>
      <CardFooter className="bg-gray-50 px-4 py-3 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSave(article)}
          aria-label={`Save article: ${title}`}
        >
          <Bookmark className="mr-2 h-4 w-4" />
          Save
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(article.url, '_blank')}
          aria-label={`Read more about: ${title}`}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Read on CyberNews
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(article.originalUrl, '_blank')}
          aria-label={`View original article: ${title}`}
        >
          <Share2 className="mr-2 h-4 w-4" />
          View Original
        </Button>
      </CardFooter>
    </Card>
  )
}