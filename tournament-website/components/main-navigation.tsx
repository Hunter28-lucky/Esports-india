import type React from "react"
import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Trophy, Users, BookOpen, BarChart3, User, Target, Crown, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export function MainNavigation() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Tournaments</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/tournaments"
                    prefetch={false}
                  >
                    <Trophy className="h-6 w-6" />
                    <div className="mb-2 mt-4 text-lg font-medium">Live Tournaments</div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Join competitive tournaments for Free Fire, BGMI, Valorant and more. Win cash prizes daily.
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <ListItem href="/tournaments/free-fire" title="Free Fire Tournaments">
                <Target className="h-4 w-4 mr-2" />
                Daily Free Fire competitions with instant payouts
              </ListItem>
              <ListItem href="/tournaments/bgmi" title="BGMI Championships">
                <Crown className="h-4 w-4 mr-2" />
                Battle Royale tournaments for BGMI players
              </ListItem>
              <ListItem href="/tournaments/valorant" title="Valorant Matches">
                <Zap className="h-4 w-4 mr-2" />
                Tactical FPS tournaments and scrimmages
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Community</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <ListItem href="/leaderboard" title="Leaderboard">
                <BarChart3 className="h-4 w-4 mr-2" />
                Top players and tournament rankings
              </ListItem>
              <ListItem href="/teams" title="Teams">
                <Users className="h-4 w-4 mr-2" />
                Find teammates and join esports teams
              </ListItem>
              <ListItem href="/discord" title="Discord Community">
                <Users className="h-4 w-4 mr-2" />
                Join our Discord server for live chat
              </ListItem>
              <ListItem href="/forums" title="Gaming Forums">
                <BookOpen className="h-4 w-4 mr-2" />
                Discuss strategies and game updates
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/blog"
              prefetch={false}
              className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Gaming Blog
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/profile"
              prefetch={false}
              className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const ListItem = ({
  className,
  title,
  children,
  href,
  ...props
}: {
  className?: string
  title: string
  children: React.ReactNode
  href: string
}) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          prefetch={false}
          {...props}
        >
          <div className="text-sm font-medium leading-none flex items-center">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground flex items-center">{children}</p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}
