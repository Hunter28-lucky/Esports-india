# GitHub Copilot Instructions - Esports Tournament Platform

## Project Overview
This is an **Indian esports tournament platform** built with **Next.js 15, React 19, TypeScript, Supabase, and Tailwind CSS**. Players join paid tournaments (Free Fire, BGMI, PUBG, Valorant), pay entry fees via ZapUPI payment gateway, and win cash prizes. The platform includes wallet management, real-time leaderboards, and an admin panel for tournament management.

## Architecture & Key Directories

### Primary Codebase Location
**Active development is in `tournament-website/`** (not `Tournament website /` with space - that's likely an old duplicate). All references should point to `tournament-website/`.

### Structure
- **`tournament-website/app/`**: Next.js 15 App Router pages (route handlers in `app/api/`)
- **`tournament-website/components/`**: React components (UI components in `components/ui/`)
- **`tournament-website/lib/`**: Utilities and Supabase client (`lib/supabase.ts`)
- **`scripts/database-schema.sql`**: Main database schema reference
- **`Android/`**: Android payment integration samples (ZapUPI API examples)

### Key Components
- **`game-arena-dashboard.tsx`**: Main dashboard orchestrator (~1773 lines) - handles navigation, state, and renders all sections
- **`admin-panel.tsx`**: Tournament CRUD operations, requires admin authentication
- **`auth-provider.tsx`**: Supabase auth context with Google OAuth
- **`payment-portal.tsx`**: ZapUPI payment integration with polling verification
- **`tournament-waiting-room.tsx`**: Pre-tournament lobby showing room IDs/passwords

## Technology Stack

### Core Dependencies
- **Next.js 15.2.4** with App Router (not Pages Router)
- **React 19** with TypeScript strict mode
- **Supabase** (`@supabase/supabase-js`) for auth + PostgreSQL database
- **Radix UI** for accessible components
- **Tailwind CSS v4** with `tailwindcss-animate`
- **Zod** for form validation with `react-hook-form`

### Import Aliases
Use `@/*` for all imports (e.g., `@/components/ui/button`, `@/lib/supabase`)

## Database & Supabase

### Core Tables
```sql
users (id, email, full_name, avatar_url, wallet_balance, total_kills, total_wins, total_tournaments, total_winnings)
tournaments (id, name, game, entry_fee, prize_pool, max_players, current_players, status, start_time, room_id, room_password)
tournament_participants (id, tournament_id, user_id, joined_at, placement, kills, prize_won)
matches (id, tournament_id, user_id, game, placement, kills, prize_won)
transactions (id, user_id, type, amount, description, status)
```

### Row-Level Security (RLS) Critical
**All tables have RLS enabled.** Common issues:
- Queries fail if user not authenticated → Always check `await supabase.auth.getUser()` first
- Admin operations need service role key or explicit policies
- Reference `SUPABASE_SETUP.sql` for policy definitions

### Supabase Client
```typescript
// Import from lib/supabase.ts - already configured
import { supabase } from "@/lib/supabase"
```

**Connection details** (hardcoded in `lib/supabase.ts`):
- URL: `https://bdcwmkeluowefvcekwqq.supabase.co`
- Uses anon key (do not expose service role key in client code)

## Authentication

### Google OAuth Setup
**Critical:** Requires specific redirect URLs configured in both Google Cloud Console and Supabase:
- Dev: `http://localhost:3002/auth/callback` (note port 3002, not 3000)
- Production: Update in `GOOGLE_OAUTH_SETUP.md`

### Auth Flow
1. User clicks "Sign in with Google" → `signInWithGoogle()` in `auth-provider.tsx`
2. Redirects to `/auth/callback` → handled by `app/auth/callback/page.tsx`
3. On success, creates user profile in `users` table if missing (starting wallet: ₹2450)
4. Auth context provides `user`, `loading`, `isAdmin` state

### Check Admin Access
```typescript
const { user, isAdmin } = useAuth()
if (!isAdmin) return <div>Access Denied</div>
```

## Payment Integration (ZapUPI)

### Payment Flow
1. User initiates payment → `payment-portal.tsx` calls `/api/create-payment`
2. Backend (`app/api/create-payment/route.ts`) creates order with ZapUPI API
3. User redirected to ZapUPI payment page
4. After payment, frontend **polls** `/api/verify-payment` every 10s (max 30 attempts)
5. On success, updates wallet balance or tournament entry

### ZapUPI Credentials
Stored in env vars (fallback to hardcoded):
```env
ZAPUPI_TOKEN_KEY=c104bb9e5a72a5bc9bbd8b15ee18641f
ZAPUPI_SECRET_KEY=9b2ed95f353a62ca2af39a25bf29b4e4
```

### API Endpoints
- `POST /api/create-payment` - Creates ZapUPI order
- `POST /api/verify-payment` - Checks payment status
- `POST /api/payment-webhook` - Webhook for ZapUPI callbacks

### Android Integration
Reference `Android/CreateOrder.txt` for OkHttp3 Java implementation example.

## Component Patterns

### Client Components
**All interactive components use `"use client"`** - this is a Next.js 15 App Router requirement for state/effects.

### Form Handling
Use `react-hook-form` + `zod` + Radix UI Select/Input:
```typescript
const form = useForm<FormSchema>({
  resolver: zodResolver(schema),
})
```

### Toast Notifications
```typescript
import { useToast } from "@/hooks/use-toast"
const { toast } = useToast()
toast({ title: "Success", description: "Action completed" })
```

### Haptic Feedback (Mobile)
```typescript
import { useHaptic } from "@/hooks/use-haptic"
const { triggerHaptic } = useHaptic()
triggerHaptic("selection") // or "impact", "notification"
```

## Development Workflow

### Commands
```bash
npm run dev      # Dev server (defaults to :3000, may use :3002 for OAuth)
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint check
```

### Build Configuration
- **TypeScript errors ignored in builds** (`ignoreBuildErrors: true` in `next.config.mjs`)
- **ESLint ignored in builds** (`ignoreDuringBuilds: true`)
- This allows rapid iteration but requires manual QA

### Type Safety
- Use strict TypeScript (`strict: true` in `tsconfig.json`)
- Many components have `// @ts-nocheck` for rapid prototyping - remove when stabilizing
- Define interfaces for props (e.g., `interface AdminPanelProps { ... }`)

## Common Patterns & Conventions

### Default Game Images
```typescript
// Pattern used in admin-panel.tsx
const defaultImageForGame = (game?: string) => {
  if (game.includes('pubg')) return '/pubg-mobile-pro-tournament-esports.jpg'
  if (game.includes('free fire')) return '/free-fire-championship-tournament-esports.jpg'
  if (game.includes('valorant')) return '/valorant-masters-tournament-esports.jpg'
  return '/placeholder.jpg'
}
```

### Tournament Status Values
```typescript
status: 'upcoming' | 'live' | 'completed'
```

### Transaction Types
```typescript
type: 'deposit' | 'withdrawal' | 'tournament_entry' | 'prize_win'
```

### Error Handling
```typescript
try {
  const { data, error } = await supabase.from('table').select()
  if (error) throw error
  // Handle data
} catch (error) {
  console.error('[v0]', error) // Use [v0] prefix for logs
  toast({ title: "Error", description: error.message, variant: "destructive" })
}
```

## SEO & Metadata

### Page Metadata
Include comprehensive metadata for SEO (see `app/layout.tsx`):
- Keywords: "esports India", "Free Fire tournament", "BGMI", "earn money gaming"
- OpenGraph + Twitter cards
- Structured data for tournaments (`components/structured-data.tsx`)

### Public Assets
Game images in `/public/` (e.g., `/free-fire-championship-tournament-esports.jpg`)

## Troubleshooting Common Issues

### "RLS policy violation" errors
- Ensure user is authenticated before queries
- Check policies in `SUPABASE_SETUP.sql` or `*_RLS_FIX.sql` files

### Google OAuth not working
- Verify redirect URLs match exactly (port 3002!)
- Check `GOOGLE_OAUTH_SETUP.md` for complete setup

### Payment verification timeout
- ZapUPI test payments may not trigger webhook
- Use polling mechanism (already implemented in `payment-portal.tsx`)

### Build failures
- TypeScript/ESLint errors ignored by default - check manually
- Supabase env vars required for API routes

## Admin Operations

### Creating Tournaments
Use `admin-tournament-creator.tsx` component or directly via `admin-panel.tsx`:
- Set `image_url` (use game-specific defaults)
- `room_id` and `room_password` populated before tournament starts
- `status` transitions: `upcoming` → `live` → `completed`

### Updating Tournament Status
Modify `admin-panel.tsx` - edit functionality includes inline updates.

## Supabase MCP Integration

### Available Tools
The Supabase MCP server is enabled for this project, providing direct database access:
- Query execution and schema inspection
- Migration management
- Edge Function deployment
- Security/performance advisors
- TypeScript type generation

See `SUPABASE_MCP_SETUP.md` for complete documentation.

### Usage Pattern
```typescript
// Example: Ask to query tournaments
"Show me all upcoming tournaments"
// MCP executes: SELECT * FROM tournaments WHERE status = 'upcoming'

// Example: Create migration
"Add a 'featured' boolean column to tournaments"
// MCP creates migration with ALTER TABLE statement
```

## Notes for AI Agents

1. **Always reference `tournament-website/` directory** (active codebase)
2. **Check authentication first** when debugging query errors (RLS!)
3. **Payment flows are asynchronous** - use polling, not synchronous checks
4. **Mobile-first design** - components use responsive Tailwind classes
5. **v0.app origins** - This project was scaffolded with v0.app (see README.md)
6. **Duplicate folders exist** - `Tournament website /` (with space) appears to be old/duplicate
7. **Use Supabase MCP** for database operations instead of manual queries when possible
