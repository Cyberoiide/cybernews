'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bookmark, Share2, MessageCircle, Clock, Eye, ThumbsUp, Calendar } from 'lucide-react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

type Article = {
  title: string
  content: string
  date: string
  entities?: string[]
  ngrams?: string[]
  hash?: number
  url: string
  tags: string[]
  image_url: string
}

export default function ArticleDetail({ params }: { params: { id: string } }) {
  const [article, setArticle] = useState<Article | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`http://localhost:8010/articles/${params.id}`)
        const data = await response.json()
        if (data.article) {
          setArticle(data.article)
        }
      } catch (error) {
        console.error('Failed to fetch article:', error)
      }
    }

    fetchArticle()
  }, [params.id])

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Calculate estimated reading time
  const wordsPerMinute = 200
  const wordCount = article.content?.split(/\s+/).length || 0
  const readingTime = Math.ceil(wordCount / wordsPerMinute)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Articles
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="prose prose-gray dark:prose-invert lg:prose-lg max-w-none">
          <div className="space-y-8 mb-8">
            <div className="flex flex-wrap gap-2">
              {article.tags?.map((tag, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
              {article.title || "No Title Available"}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarFallback>THN</AvatarFallback>
                </Avatar>
                <span className="font-medium">The Hacker News</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time>{new Date(article.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{readingTime} min read</span>
              </div>
            </div>
          </div>

          {article.image_url && (
            <figure className="my-8">
              <Image
                src={article.image_url.startsWith("data:") ? "/placeholder.svg?height=600&width=1200" : article.image_url}
                alt={article.title}
                width={1200}
                height={600}
                className="rounded-xl object-cover w-full aspect-video"
                priority
              />
              <figcaption className="text-center text-sm text-muted-foreground mt-2">
                Featured image for {article.title}
              </figcaption>
            </figure>
          )}

          <div className="leading-relaxed space-y-6 text-lg">
            {article.content.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <Separator className="my-12" />

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Article Stats</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                  <span>1.2k views</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5 text-muted-foreground" />
                  <span>45 likes</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-muted-foreground" />
                  <span>12 comments</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discussion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <MessageCircle className="h-5 w-5" />
                  <span>Join the conversation! Be the first to comment on this article.</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Source</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    Read Original Article
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </article>
      </main>
    </div>
  )
}