import type { Metadata } from "next"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, ArrowRight, Trophy, Target, Zap } from "lucide-react"
import { BreadcrumbNavigation } from "@/components/breadcrumb-navigation"

export const metadata: Metadata = {
  title: "Esports Blog - Gaming Tips, Tournament Guides & News | GameArena Pro",
  description:
    "Get the latest esports news, gaming tips, tournament strategies, and guides for Free Fire, BGMI, PUBG, and Valorant. Learn how to earn money playing games in India.",
  keywords: [
    "esports blog",
    "gaming tips",
    "tournament guides",
    "Free Fire tips",
    "BGMI strategies",
    "earn money gaming",
    "esports news India",
    "competitive gaming guides",
  ],
  openGraph: {
    title: "Esports Blog - Gaming Tips & Tournament Guides",
    description: "Get the latest esports news, gaming tips, and tournament strategies for competitive gaming in India.",
    url: "/blog",
    type: "website",
  },
}

const blogPosts = [
  {
    id: "how-to-join-free-fire-tournaments",
    title: "How to Join Free Fire Tournaments in India - Complete Guide 2025",
    excerpt:
      "Learn step-by-step how to join Free Fire tournaments, win cash prizes, and become a competitive esports player in India. Tips from pro gamers included.",
    author: "GameArena Pro Team",
    publishDate: "2025-01-15",
    readTime: "8 min read",
    category: "Tournament Guide",
    image: "/free-fire-championship-tournament-esports.jpg",
    tags: ["Free Fire", "tournaments", "esports", "gaming tips"],
  },
  {
    id: "earn-money-playing-bgmi",
    title: "How to Earn Money Playing BGMI - Top 10 Strategies for 2025",
    excerpt:
      "Discover proven methods to earn money playing BGMI tournaments. From competitive gaming to streaming, learn how to monetize your gaming skills effectively.",
    author: "Pro Gaming Expert",
    publishDate: "2025-01-12",
    readTime: "12 min read",
    category: "Money Making",
    image: "/pubg-mobile-pro-tournament-esports.jpg",
    tags: ["BGMI", "earn money", "competitive gaming", "esports career"],
  },
  {
    id: "top-esports-tournaments-2025",
    title: "Top Esports Tournaments 2025 - Biggest Prize Pools in Indian Gaming",
    excerpt:
      "Complete list of the biggest esports tournaments in India for 2025. Prize pools, registration dates, and how to participate in each tournament.",
    author: "Tournament Analyst",
    publishDate: "2025-01-10",
    readTime: "15 min read",
    category: "Tournament News",
    image: "/valorant-masters-tournament-esports.jpg",
    tags: ["esports tournaments", "prize pools", "competitive gaming", "Indian esports"],
  },
  {
    id: "valorant-pro-tips-competitive",
    title: "Valorant Pro Tips for Competitive Gaming - Rank Up Fast",
    excerpt:
      "Master Valorant with these pro tips and strategies. Learn advanced techniques, team coordination, and game sense to dominate competitive matches.",
    author: "Valorant Pro Player",
    publishDate: "2025-01-08",
    readTime: "10 min read",
    category: "Gaming Tips",
    image: "/valorant-masters-tournament-esports.jpg",
    tags: ["Valorant", "pro tips", "competitive gaming", "rank up"],
  },
  {
    id: "mobile-gaming-setup-competitive",
    title: "Best Mobile Gaming Setup for Competitive Esports 2025",
    excerpt:
      "Build the perfect mobile gaming setup for competitive esports. Device recommendations, accessories, and optimization tips for peak performance.",
    author: "Gaming Hardware Expert",
    publishDate: "2025-01-05",
    readTime: "7 min read",
    category: "Gaming Setup",
    image: "/free-fire-championship-tournament-esports.jpg",
    tags: ["mobile gaming", "gaming setup", "competitive gaming", "hardware"],
  },
  {
    id: "esports-career-guide-india",
    title: "Complete Esports Career Guide for Indian Gamers 2025",
    excerpt:
      "Everything you need to know about building an esports career in India. From amateur to professional gaming, sponsorships, and earning potential.",
    author: "Esports Career Coach",
    publishDate: "2025-01-03",
    readTime: "20 min read",
    category: "Career Guide",
    image: "/pubg-mobile-pro-tournament-esports.jpg",
    tags: ["esports career", "professional gaming", "Indian esports", "gaming industry"],
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        <BreadcrumbNavigation items={[{ label: "Gaming Blog" }]} />
      </div>

      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Esports Blog & Gaming Guides</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Master competitive gaming with expert tips, tournament strategies, and the latest esports news from
              India's premier gaming platform
            </p>
          </div>
        </div>
      </header>

      {/* Featured Post */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Featured Article
          </h2>
          <Card className="overflow-hidden bg-card border-primary/30 hover:border-primary/50 transition-colors">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src={blogPosts[0].image || "/placeholder.svg"}
                  alt={blogPosts[0].title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-6 md:p-8">
                <div className="flex items-center gap-4 mb-4">
                  <Badge className="bg-primary/20 text-primary border-primary/30">{blogPosts[0].category}</Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(blogPosts[0].publishDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{blogPosts[0].readTime}</span>
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{blogPosts[0].title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">{blogPosts[0].excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{blogPosts[0].author}</span>
                  </div>
                  <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link href={`/blog/${blogPosts[0].id}`}>
                      Read Full Guide
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Blog Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
            <Target className="w-6 h-6 text-accent" />
            Latest Gaming Guides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.slice(1).map((post) => (
              <Card
                key={post.id}
                className="overflow-hidden bg-card border-border hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="relative">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 left-3 bg-black/70 text-white border-0">{post.category}</Badge>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(post.publishDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-3 line-clamp-2">{post.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{post.author}</span>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/blog/${post.id}`}>Read More</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Tournament Guides", count: 12, color: "bg-primary/20 text-primary border-primary/30" },
              { name: "Gaming Tips", count: 8, color: "bg-green-500/20 text-green-400 border-green-500/30" },
              { name: "Money Making", count: 6, color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
              { name: "Esports News", count: 15, color: "bg-red-500/20 text-red-400 border-red-500/30" },
            ].map((category) => (
              <Card key={category.name} className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="font-semibold text-foreground mb-2">{category.name}</h3>
                <Badge className={category.color}>{category.count} articles</Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
