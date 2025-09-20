import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { Link, Button } from "@radix-ui/themes"
import { Gamepad2 } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "GameArena Pro - India's Premier Esports Tournament Platform | Free Fire, BGMI, Valorant",
  description:
    "Join India's top esports tournaments and earn money playing Free Fire, BGMI, PUBG, and Valorant. Compete with pro gamers, win cash prizes, and become an esports champion.",
  keywords: [
    "esports",
    "Indian esports",
    "Free Fire tournament",
    "BGMI tournament",
    "PUBG tournament",
    "Valorant tournament",
    "online gaming tournaments",
    "competitive gaming India",
    "earn money gaming",
    "gaming money",
    "play games and earn money",
    "best esports tournaments",
    "esports India",
    "gaming tournaments 2025",
    "pro gaming India",
  ],
  authors: [{ name: "GameArena Pro" }],
  creator: "GameArena Pro",
  publisher: "GameArena Pro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://gamearena-pro.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "GameArena Pro - India's Premier Esports Tournament Platform",
    description:
      "Join India's top esports tournaments and earn money playing Free Fire, BGMI, PUBG, and Valorant. Compete with pro gamers and win cash prizes.",
    url: "/",
    siteName: "GameArena Pro",
    images: [
      {
        url: "/free-fire-championship-tournament-esports.jpg",
        width: 1200,
        height: 630,
        alt: "GameArena Pro - Premier Esports Tournament Platform",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GameArena Pro - India's Premier Esports Tournament Platform",
    description: "Join India's top esports tournaments and earn money playing Free Fire, BGMI, PUBG, and Valorant.",
    images: ["/free-fire-championship-tournament-esports.jpg"],
    creator: "@GameArenaPro",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "gaming",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 py-3 md:py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-1 md:space-x-2">
                  <Gamepad2 className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  <span className="text-lg md:text-2xl font-bold text-foreground">
                    <span className="hidden sm:inline">GameArena Pro</span>
                    <span className="sm:hidden">GameArena</span>
                  </span>
                </Link>
                <div className="flex items-center space-x-2 md:space-x-4">
                  <Button variant="ghost" size="2" className="text-xs md:text-sm px-2 md:px-3">
                    About
                  </Button>
                  <Button size="2" className="text-xs md:text-sm px-2 md:px-3">
                    <span className="hidden sm:inline">Contact</span>
                    <span className="sm:hidden">Help</span>
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="min-h-screen">{children}</main>

          <SiteFooter />

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
