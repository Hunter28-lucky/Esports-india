import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Trophy,
  Users,
  BookOpen,
  BarChart3,
  Gamepad2,
  Target,
  Crown,
  Zap,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  User,
} from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <nav className="flex flex-wrap justify-center gap-6 md:gap-8">
            <Link
              href="/tournaments"
              className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors font-medium"
            >
              <Trophy className="h-5 w-5" />
              <span>Tournaments</span>
            </Link>
            <Link
              href="/community"
              className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors font-medium"
            >
              <Users className="h-5 w-5" />
              <span>Community</span>
            </Link>
            <Link
              href="/blog"
              className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors font-medium"
            >
              <BookOpen className="h-5 w-5" />
              <span>Gaming Blog</span>
            </Link>
            <Link
              href="/profile"
              className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors font-medium"
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Link>
          </nav>
        </div>

        <Separator className="mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Gamepad2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">GameArena Pro</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              India's premier esports platform for competitive gaming. Join tournaments, win prizes, and build your
              gaming career.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://facebook.com/gamearena" aria-label="Facebook">
                  <Facebook className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://twitter.com/gamearena" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://instagram.com/gamearena" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://youtube.com/gamearena" aria-label="YouTube">
                  <Youtube className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Tournaments */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Tournaments</h3>
            <nav className="space-y-2">
              <Link
                href="/tournaments/free-fire"
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Target className="h-4 w-4 mr-2" />
                Free Fire Tournaments
              </Link>
              <Link
                href="/tournaments/bgmi"
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Crown className="h-4 w-4 mr-2" />
                BGMI Championships
              </Link>
              <Link
                href="/tournaments/valorant"
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Zap className="h-4 w-4 mr-2" />
                Valorant Matches
              </Link>
              <Link
                href="/tournaments/pubg"
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Trophy className="h-4 w-4 mr-2" />
                PUBG Tournaments
              </Link>
              <Link
                href="/tournaments/schedule"
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Tournament Schedule
              </Link>
            </nav>
          </div>

          {/* Community & Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Community</h3>
            <nav className="space-y-2">
              <Link
                href="/leaderboard"
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Leaderboard
              </Link>
              <Link
                href="/teams"
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Users className="h-4 w-4 mr-2" />
                Find Teams
              </Link>
              <Link
                href="/blog"
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Gaming Blog
              </Link>
              <Link
                href="/guides"
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Gaming Guides
              </Link>
              <Link
                href="/discord"
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Discord Community
              </Link>
            </nav>
          </div>

          {/* Support & Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Support</h3>
            <nav className="space-y-2">
              <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Help Center
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact Us
              </Link>
              <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/refund" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Refund Policy
              </Link>
            </nav>

            <div className="space-y-2 pt-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mr-2" />
                support@gamearena.pro
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mr-2" />
                +91 98765 43210
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Newsletter Signup */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold text-foreground mb-2">Stay Updated</h4>
            <p className="text-sm text-muted-foreground">Get the latest tournament updates and gaming news</p>
          </div>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input type="email" placeholder="Enter your email" />
            <Button type="submit">Subscribe</Button>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2025 GameArena Pro. All rights reserved. Made with ❤️ for Indian gamers.
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <Link href="/sitemap" className="hover:text-foreground transition-colors">
              Sitemap
            </Link>
            <span>•</span>
            <Link href="/accessibility" className="hover:text-foreground transition-colors">
              Accessibility
            </Link>
            <span>•</span>
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              Mumbai, India
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
