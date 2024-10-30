'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { Search, Bookmark, ExternalLink, Flame, Clock, Send, MessageCircle, X, PlusCircle, Check, Star, Share2, Bell } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type Article = {
  id: number
  title: string
  description: string
  date: string
  sources: string[]
  image: string
  category: string
  tags: string[]
  rating: number
  comments: Comment[]
}

type Comment = {
  id: number
  user: string
  content: string
  date: string
}

type ChatMessage = {
  type: 'user' | 'ai'
  content: string
}

const fetchArticles = async (category = 'all', searchTerm = '', page = 1, sort = 'date') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: '10',
      sort: ['date', 'relevance'].includes(sort) ? sort : 'date' // Ensure valid sort value
    });

    if (category !== 'all') {
      params.append('tag', category);
    }

    if (searchTerm) {
      params.append('search', searchTerm);
    }

    console.log(`Request params: ${params.toString()}`);

    const response = await fetch(`http://localhost:8010/articles?${params}`);

    if (!response.ok) {
      console.error(`HTTP Status: ${response.status} - ${response.statusText}`);
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      articles: data.articles.map((article: any) => ({
        ...article,
        image: article.image || '/placeholder.svg?height=100&width=200'
      })),
      total: data.total,
      pages: data.pages
    };
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return { articles: [], total: 0, pages: 0 };
  }
};



const categories = [
  { id: 'all', name: 'All' },
  { id: 'general', name: 'General' },
  { id: 'finance', name: 'Finance' },
  { id: 'technical', name: 'Technical' },
]

const aiResponses = [
  "That's an interesting question about cybersecurity. Based on recent trends, ...",
  "Regarding your inquiry, it's important to note that cybersecurity threats are constantly evolving. ...",
  "Your question touches on a critical aspect of modern digital security. Let me explain ...",
  "I understand your concern about this cybersecurity issue. Here's what you need to know: ...",
  "That's a great question! In the context of current cyber threats, ...",
]

export default function CyberNewsDashboard() {
  const [newsArticles, setNewsArticles] = useState<Article[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [savedArticles, setSavedArticles] = useState<Article[]>([])
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all'])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [totalPages, setTotalPages] = useState(1);
  const [newArticle, setNewArticle] = useState<Omit<Article, 'id' | 'sources' | 'rating' | 'comments'>>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    image: '/placeholder.svg?height=100&width=200',
    category: 'general',
    tags: []
  })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [similarArticles, setSimilarArticles] = useState<Article[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [notifications, setNotifications] = useState<string[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState('en')

  const filteredAndSortedArticles = useMemo(() => {
    let filtered = newsArticles.filter(article =>
      (article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategories.includes('all') || selectedCategories.includes(article.category))
    )

    switch (sortBy) {
      case 'hot':
        return filtered.sort((a, b) => b.sources.length - a.sources.length)
      case 'new':
        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      case 'top':
        return filtered.sort((a, b) => b.rating - a.rating)
      default:
        return filtered
    }
  }, [newsArticles, searchTerm, sortBy, selectedCategories])

  // Remove client-side filtering and sorting since it's now handled by the API
  const currentArticles = newsArticles;

  // Update pagination to use API's total pages
  const pageCount = totalPages;


  const handleSaveArticle = (article: Article) => {
    setSavedArticles(prev => {
      if (!prev.some(saved => saved.id === article.id)) {
        return [...prev, article]
      }
      return prev
    })
  }

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      setChatMessages(prev => [...prev, { type: 'user', content: currentMessage }])
      setTimeout(() => {
        const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]
        setChatMessages(prev => [...prev, { type: 'ai', content: randomResponse }])
      }, 1000)
      setCurrentMessage('')
    }
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev =>
      category === 'all' ? ['all'] : prev.includes(category)
        ? prev.filter(c => c !== category && c !== 'all')
        : [...prev.filter(c => c !== 'all'), category]
    )
    setCurrentPage(1)
  }

  const handleCreateArticle = () => {
    const similarityThreshold = 0.7 // Adjust this value to change sensitivity
    const similar = newsArticles.filter(article =>
      calculateSimilarity(article.title, newArticle.title) > similarityThreshold ||
      calculateSimilarity(article.description, newArticle.description) > similarityThreshold
    )
    setSimilarArticles(similar)

    if (similar.length === 0) {
      const newId = Math.max(...newsArticles.map(a => a.id)) + 1
      const createdArticle: Article = {
        ...newArticle,
        id: newId,
        sources: ['User Generated'],
        rating: 0,
        comments: []
      }
      setNewsArticles(prev => [...prev, createdArticle])
      setIsCreateDialogOpen(false)
      setNewArticle({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        image: '/placeholder.svg?height=100&width=200',
        category: 'general',
        tags: []
      })
      setNotifications(prev => [...prev, `New article "${createdArticle.title}" has been created.`])
    }
  }

  const calculateSimilarity = (str1: string, str2: string): number => {
    const set1 = new Set(str1.toLowerCase().split(' '))
    const set2 = new Set(str2.toLowerCase().split(' '))
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    return intersection.size / Math.max(set1.size, set2.size)
  }

  const mergeSimilarArticles = (originalArticle: Article, similarArticle: Omit<Article, 'id' | 'sources' | 'rating' | 'comments'>) => {
    const mergedArticle: Article = {
      ...originalArticle,
      sources: [...new Set([...originalArticle.sources, 'User Generated'])],
      description: `${originalArticle.description}\n\nAdditional info: ${similarArticle.description}`,
      tags: [...new Set([...originalArticle.tags, ...similarArticle.tags])]
    }
    setNewsArticles(prev => prev.map(article =>
      article.id === originalArticle.id ? mergedArticle : article
    ))
    setIsCreateDialogOpen(false)
    setSimilarArticles([])
    setNotifications(prev => [...prev, `Article "${mergedArticle.title}" has been updated with new information.`])
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleLogin = () => {
    // Simulating login process
    setIsLoggedIn(true)
    setNotifications(prev => [...prev, "Welcome back! You've successfully logged in."])
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setSavedArticles([])
    setNotifications([])
  }

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang)
    // In a real app, this would trigger a translation of the UI and content
    setNotifications(prev => [...prev, `Language changed to ${lang.toUpperCase()}`])
  }

  // Update useEffect to handle pagination
  useEffect(() => {
    const loadArticles = async () => {
      const selectedCategory = selectedCategories.includes('all') ? '' : selectedCategories[0];
      const sortParam = sortBy === 'new' ? 'date' : sortBy === 'hot' ? 'sources' : 'rating';
      const result = await fetchArticles(selectedCategory, searchTerm, currentPage, sortParam);
      setNewsArticles(result.articles);
      setTotalPages(result.pages);
    };

    loadArticles();
  }, [selectedCategories, searchTerm, currentPage, sortBy]);



  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      <header className="bg-black text-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">CyberNews Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              placeholder="Search news..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 text-white border-gray-700"
              aria-label="Search news articles"
            />
            <Button variant="outline" size="icon" className="bg-gray-800 border-gray-700" aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="bg-gray-800 border-gray-700">
                  <Bell className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {notifications.map((notification, index) => (
                  <DropdownMenuItem key={index}>{notification}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-gray-800 border-gray-700">
                  {selectedLanguage.toUpperCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => handleLanguageChange('en')}>English</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleLanguageChange('es')}>Español</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleLanguageChange('fr')}>Français</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {isLoggedIn ? (
              <Button onClick={handleLogout} variant="outline" className="bg-gray-800 border-gray-700">
                Logout
              </Button>
            ) : (
              <Button onClick={handleLogin} variant="outline" className="bg-gray-800 border-gray-700">
                Login
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <Tabs defaultValue="all">
            <TabsList>
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={cn(
                    "data-[state=active]:bg-black data-[state=active]:text-white",
                    selectedCategories.includes(cat.id) && "bg-gray-200"
                  )}
                  aria-label={`Toggle ${cat.name} category`}
                >
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-black text-white">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Article
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Article</DialogTitle>
                <DialogDescription>
                  Add a new cybersecurity article to the dashboard.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={newArticle.title}
                    onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newArticle.description}
                    onChange={(e) => setNewArticle({ ...newArticle, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <select
                    id="category"
                    value={newArticle.category}
                    onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                    className="col-span-3"
                  >
                    {categories.filter(cat => cat.id !== 'all').map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tags" className="text-right">
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    value={newArticle.tags.join(', ')}
                    onChange={(e) => setNewArticle({ ...newArticle, tags: e.target.value.split(',').map(tag => tag.trim()) })}
                    className="col-span-3"
                    placeholder="Enter tags separated by commas"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateArticle}>Create Article</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex justify-end mb-4">
          <Tabs defaultValue={sortBy} className="mb-6">
            <TabsList>
              <TabsTrigger
                value="hot"
                onClick={() => setSortBy('hot')}
                className="data-[state=active]:bg-black data-[state=active]:text-white"
                aria-label="Sort by hot topics"
              >
                <Flame className="mr-2 h-4 w-4" />
                Hot
              </TabsTrigger>
              <TabsTrigger
                value="new"
                onClick={() => setSortBy('new')}
                className="data-[state=active]:bg-black data-[state=active]:text-white"
                aria-label="Sort by newest"
              >
                <Clock className="mr-2 h-4 w-4" />
                New
              </TabsTrigger>
              <TabsTrigger
                value="top"
                onClick={() => setSortBy('top')}
                className="data-[state=active]:bg-black data-[state=active]:text-white"
                aria-label="Sort by top rated"
              >
                <Star className="mr-2 h-4 w-4" />
                Top Rated
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="space-y-6">
          {currentArticles.map((article) => (
            <Card key={article.id} className="overflow-hidden border-gray-200">
              <div className="flex">
                <div className="flex-shrink-0 w-48">
                  {article.image && (article.image.startsWith('http://') || article.image.startsWith('https://') || article.image.startsWith('/')) ? (
                    <Image
                      src={article.image}
                      alt={article.title}
                      width={200}
                      height={100}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100px', backgroundColor: '#f0f0f0' }}></div> // Placeholder
                  )}
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
                  <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
                  <p className="text-gray-600 mb-2">{article.description}</p>
                  <p className="text-sm text-gray-500 mb-2">{article.date}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {article.tags.map((tag, index) => (
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
              <CardFooter className="bg-gray-50 px-4 py-3 flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSaveArticle(article)}
                  aria-label={`Save article: ${article.title}`}
                >
                  <Bookmark className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={`Read more about: ${article.title}`}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Read More
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={`Share article: ${article.title}`}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              onClick={() => handlePageChange(page)}
              variant={currentPage === page ? "default" : "outline"}
            >
              {page}
            </Button>
          ))}
        </div>
      </main>
      <Popover open={isChatOpen} onOpenChange={setIsChatOpen}>
        <PopoverTrigger asChild>
          <Button
            className="fixed bottom-4 right-4 rounded-full w-12 h-12 p-0 bg-black text-white hover:bg-gray-800"
            onClick={() => setIsChatOpen(true)}
            aria-label="Open AI Assistant chat"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 h-96 p-0" align="end">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-3 bg-black text-white">
              <h2 className="text-lg font-semibold">AI Assistant</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChatOpen(false)}
                aria-label="Close AI Assistant chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`mb-4 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block p-2 rounded-lg ${msg.type === 'user' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}>
                    {msg.content}
                  </span>
                </div>
              ))}
            </ScrollArea>
            <div className="p-3 bg-gray-100">
              <div className="flex items-center">
                <Textarea
                  placeholder="Ask about cybersecurity..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  className="flex-1 resize-none"
                  aria-label="Type your message to the AI Assistant"
                />
                <Button
                  onClick={handleSendMessage}
                  className="ml-2 bg-black text-white hover:bg-gray-800"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Dialog open={similarArticles.length > 0} onOpenChange={() => setSimilarArticles([])}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Similar Articles Found</DialogTitle>
            <DialogDescription>
              We found some articles that are similar to the one you're trying to create. Would you like to merge your article with an existing one?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {similarArticles.map((article) => (
              <div key={article.id} className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{article.title}</h3>
                  <p className="text-sm text-gray-500">{article.description.substring(0, 100)}...</p>
                </div>
                <Button onClick={() => mergeSimilarArticles(article, newArticle)}>
                  <Check className="mr-2 h-4 w-4" />
                  Merge
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => {
              handleCreateArticle()
              setSimilarArticles([])
            }}>
              Create as New Article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}