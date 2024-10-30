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

const initialNewsArticles: Article[] = [
  { 
    id: 1, 
    title: "New Ransomware Strain Targets Healthcare Sector", 
    description: "A sophisticated ransomware attack is spreading rapidly through healthcare institutions, encrypting critical patient data and demanding substantial ransoms. Cybersecurity experts warn of potential life-threatening consequences if systems remain locked.", 
    date: "2024-10-28",
    sources: ["CyberSecurityNews", "HealthTechGuardian", "MedicalCyberWatch"],
    image: "/placeholder.svg?height=100&width=200",
    category: "general",
    tags: ["ransomware", "healthcare", "cybersecurity"],
    rating: 4.5,
    comments: [
      { id: 1, user: "CyberExpert", content: "This is a critical issue that needs immediate attention.", date: "2024-10-28" }
    ]
  },
  { 
    id: 2, 
    title: "Critical Vulnerability Found in Popular IoT Devices", 
    description: "Security researchers have uncovered a severe vulnerability affecting millions of IoT devices, potentially allowing hackers to gain unauthorized access to home networks and personal data.", 
    date: "2024-10-27",
    sources: ["TechSecurityWatch", "IoTGuardian"],
    image: "/placeholder.svg?height=100&width=200",
    category: "technical",
    tags: ["IoT", "vulnerability", "cybersecurity"],
    rating: 4.2,
    comments: []
  },
  { 
    id: 3, 
    title: "AI-Powered Phishing Attacks on the Rise", 
    description: "Cybercriminals are increasingly using AI to create more convincing phishing emails, making it harder for traditional spam filters to detect. Experts advise heightened vigilance and advanced email security measures.", 
    date: "2024-10-26",
    sources: ["AISecurityInsights", "PhishingAlertNetwork"],
    image: "/placeholder.svg?height=100&width=200",
    category: "general",
    tags: ["AI", "phishing", "email security"],
    rating: 4.7,
    comments: []
  },
  { 
    id: 4, 
    title: "Major Cryptocurrency Exchange Hacked", 
    description: "A leading cryptocurrency exchange has reported a significant security breach, resulting in the theft of millions of dollars worth of digital assets. The incident has sent shockwaves through the crypto market.", 
    date: "2024-10-25",
    sources: ["CryptoNewsDaily", "BlockchainGuardian"],
    image: "/placeholder.svg?height=100&width=200",
    category: "finance",
    tags: ["cryptocurrency", "hack", "financial security"],
    rating: 4.8,
    comments: []
  },
  { 
    id: 5, 
    title: "New EU Cybersecurity Regulations Proposed", 
    description: "The European Union has proposed new, stringent cybersecurity regulations aimed at protecting critical infrastructure and enhancing data privacy. Tech companies express concerns over implementation challenges.", 
    date: "2024-10-24",
    sources: ["EUPolicyWatch", "CyberLawInsider"],
    image: "/placeholder.svg?height=100&width=200",
    category: "general",
    tags: ["EU", "regulations", "data privacy"],
    rating: 4.0,
    comments: []
  },
  { 
    id: 6, 
    title: "Quantum Encryption Breakthrough Announced", 
    description: "Scientists have announced a major breakthrough in quantum encryption technology, potentially revolutionizing secure communications. Experts suggest this could render current encryption methods obsolete.", 
    date: "2024-10-23",
    sources: ["QuantumTechReview", "CryptoFuturist"],
    image: "/placeholder.svg?height=100&width=200",
    category: "technical",
    tags: ["quantum", "encryption", "future tech"],
    rating: 4.9,
    comments: []
  },
  { 
    id: 7, 
    title: "Global Cybersecurity Skills Shortage Worsens", 
    description: "A new report highlights the growing global shortage of cybersecurity professionals, with millions of positions remaining unfilled. Industry leaders call for increased education and training initiatives.", 
    date: "2024-10-22",
    sources: ["CyberWorkforceWatch", "TechEducationToday"],
    image: "/placeholder.svg?height=100&width=200",
    category: "general",
    tags: ["skills shortage", "cybersecurity jobs", "education"],
    rating: 4.3,
    comments: []
  },
  { 
    id: 8, 
    title: "New AI Tool Detects Deepfake Videos with 99% Accuracy", 
    description: "Researchers have developed an AI-powered tool capable of detecting deepfake videos with unprecedented accuracy. The technology could be crucial in combating misinformation and digital fraud.", 
    date: "2024-10-21",
    sources: ["AINewsDaily", "DeepfakeDetector"],
    image: "/placeholder.svg?height=100&width=200",
    category: "technical",
    tags: ["AI", "deepfake", "misinformation"],
    rating: 4.6,
    comments: []
  },
  { 
    id: 9, 
    title: "Major Bank Faces Regulatory Action Over Data Breach", 
    description: "A leading international bank is facing severe regulatory action and potential fines following a massive data breach that exposed millions of customers' personal and financial information.", 
    date: "2024-10-20",
    sources: ["FinanceSecurityWatch", "BankingNewsNetwork"],
    image: "/placeholder.svg?height=100&width=200",
    category: "finance",
    tags: ["data breach", "banking", "regulatory action"],
    rating: 4.4,
    comments: []
  },
  { 
    id: 10, 
    title: "Open-Source Security Initiative Gains Momentum", 
    description: "A collaborative open-source security initiative, aimed at improving the security of critical software dependencies, has gained significant traction with major tech companies pledging support and resources.", 
    date: "2024-10-19",
    sources: ["OpenSourceAdvocate", "TechCollaborationNews"],
    image: "/placeholder.svg?height=100&width=200",
    category: "technical",
    tags: ["open-source", "software security", "collaboration"],
    rating: 4.1,
    comments: []
  }
]

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
  const [newsArticles, setNewsArticles] = useState<Article[]>(initialNewsArticles)
  const [searchTerm, setSearchTerm] = useState('')
  const [savedArticles, setSavedArticles] = useState<Article[]>([])
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all'])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isChatOpen, setIsChatOpen] = useState(false)
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

  const currentArticles = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return filteredAndSortedArticles.slice(indexOfFirstItem, indexOfLastItem)
  }, [filteredAndSortedArticles, currentPage, itemsPerPage])

  const pageCount = Math.ceil(filteredAndSortedArticles.length / itemsPerPage)

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
      article.id === originalArticle.id ?   mergedArticle : article
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

  useEffect(() => {
    // Simulating real-time notifications
    const interval = setInterval(() => {
      const randomArticle = newsArticles[Math.floor(Math.random() * newsArticles.length)]
      setNotifications(prev => [...prev, `New update for "${randomArticle.title}"`])
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [newsArticles])

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
                    onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
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
                    onChange={(e) => setNewArticle({...newArticle, description: e.target.value})}
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
                    onChange={(e) => setNewArticle({...newArticle, category: e.target.value})}
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
                    onChange={(e) => setNewArticle({...newArticle, tags: e.target.value.split(',').map(tag => tag.trim())})}
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
                  <Image
                    src={article.image}
                    alt={article.title}
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