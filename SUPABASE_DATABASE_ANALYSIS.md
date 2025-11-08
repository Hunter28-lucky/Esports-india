# Complete Supabase Database Schema & Analysis

## 📊 Project Overview

**Project ID**: `bdcwmkeluowefvcekwqq`  
**URL**: `https://bdcwmkeluowefvcekwqq.supabase.co`  
**Type**: PostgreSQL with Row-Level Security (RLS)  
**Auth**: Google OAuth + Supabase Auth

---

## 🗂️ Database Structure

### 1. **users** Table (0 rows currently)

**Purpose**: Stores user profiles linked to Supabase Auth

**Schema**:
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  wallet_balance INTEGER DEFAULT 0,          -- Starting: ₹2450
  total_kills INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_tournaments INTEGER DEFAULT 0,
  total_winnings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features**:
- Links to Supabase Auth (`auth.users`)
- Tracks gaming statistics (kills, wins, tournaments)
- Wallet system for payments and prizes
- Auto-updated timestamp via trigger

**RLS Policies**:
- ✅ Users can view their own profile
- ✅ Users can update their own profile
- ✅ Users can insert their own profile

---

### 2. **tournaments** Table (1 row currently)

**Purpose**: Stores all tournament information

**Current Data**:
- **Tournament**: "go go hunt"
  - ID: `1155d028-bfa9-4fed-bb32-f618a8ee426d`
  - Game: Free Fire
  - Entry Fee: ₹100
  - Prize Pool: ₹5,000
  - Max Players: 50
  - Current Players: 1
  - Status: upcoming
  - Start Time: 2025-09-22 13:02:00 UTC
  - Room ID: null (will be set before tournament starts)
  - Room Password: null (will be set before tournament starts)
  - Image URL: null

**Schema**:
```sql
CREATE TABLE tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  game TEXT NOT NULL,                        -- Free Fire, BGMI, PUBG, Valorant
  entry_fee INTEGER NOT NULL,                -- Amount in ₹
  prize_pool INTEGER NOT NULL,               -- Total prize amount
  max_players INTEGER NOT NULL,
  current_players INTEGER DEFAULT 0,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  room_id TEXT,                              -- Game room ID (set by admin)
  room_password TEXT,                        -- Game room password (set by admin)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  image_url TEXT                             -- Tournament banner image
);
```

**Status Flow**:
1. `upcoming` → Tournament created, accepting registrations
2. `live` → Tournament started, room ID/password revealed
3. `completed` → Tournament finished, prizes distributed

**RLS Policies**:
- ✅ All authenticated users can view tournaments

---

### 3. **tournament_participants** Table (1 row currently)

**Purpose**: Links users to tournaments they've joined

**Current Data**:
- Participant ID: `6f1a43d6-0609-4d73-9798-9347e27b9e74`
- Tournament: "go go hunt" (`1155d028-bfa9-4fed-bb32-f618a8ee426d`)
- User: `c17169b6-640e-455d-9cfd-e06a46494268`
- Joined: 2025-09-21 05:40:20 UTC
- Placement: null (not yet determined)
- Kills: null (not yet recorded)
- Prize Won: ₹0

**Schema**:
```sql
CREATE TABLE tournament_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  placement INTEGER,                         -- Final rank (1st, 2nd, 3rd, etc.)
  kills INTEGER,                             -- Total kills in tournament
  prize_won INTEGER DEFAULT 0,               -- Prize amount won
  UNIQUE(tournament_id, user_id)            -- Prevents duplicate joins
);
```

**Key Features**:
- CASCADE DELETE: Removes participants if tournament/user deleted
- UNIQUE constraint: One user can only join a tournament once
- Results stored after tournament completion

**RLS Policies**:
- ✅ Users can view their own tournament participation

---

### 4. **matches** Table (0 rows currently)

**Purpose**: Records individual match results

**Schema**:
```sql
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game TEXT NOT NULL,
  placement INTEGER NOT NULL,
  kills INTEGER DEFAULT 0,
  prize_won INTEGER DEFAULT 0,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Usage**:
- Created when tournament completes
- Stores final results for leaderboard
- Used for match history display

**RLS Policies**:
- ✅ Users can view their own matches

---

### 5. **transactions** Table (0 rows currently)

**Purpose**: Records all financial transactions

**Schema**:
```sql
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'tournament_entry', 'prize_win')),
  amount INTEGER NOT NULL,                   -- Amount in ₹
  description TEXT NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Transaction Types**:
1. `deposit` - User adds money to wallet (via ZapUPI)
2. `withdrawal` - User withdraws money from wallet
3. `tournament_entry` - User pays tournament entry fee
4. `prize_win` - User receives tournament prize

**Status Flow**:
- `pending` → Payment initiated
- `completed` → Payment successful
- `failed` → Payment failed/cancelled

**RLS Policies**:
- ✅ Users can view their own transactions

---

## 🔐 Security Features

### Row-Level Security (RLS)
All tables have RLS enabled. Key points:

1. **Authentication Required**: Most queries require authenticated user
2. **Data Isolation**: Users can only see their own data (except tournaments)
3. **Admin Access**: Requires service role key or special policies

### Common RLS Issues:
```typescript
// ❌ This will fail if user not authenticated
const { data } = await supabase.from('users').select()

// ✅ Always check auth first
const { data: { user } } = await supabase.auth.getUser()
if (user) {
  const { data } = await supabase.from('users').select().eq('id', user.id)
}
```

---

## 🔄 Data Relationships

```
auth.users (Supabase Auth)
    ↓
  users ←──────┐
    ↓          │
    ├─────→ tournament_participants ←──── tournaments
    │              ↓
    ├─────→ matches ←──────────────────┘
    │              
    └─────→ transactions
```

**Key Relationships**:
- Users extend Supabase Auth users (linked by UUID)
- Tournaments have many participants
- Participants create matches after tournament
- All financial activity recorded in transactions

---

## 📈 Current Database State

| Table | Rows | Status |
|-------|------|--------|
| users | 0 | Empty (no registered users yet) |
| tournaments | 1 | 1 active tournament: "go go hunt" |
| tournament_participants | 1 | 1 user joined |
| matches | 0 | No completed matches |
| transactions | 0 | No transactions yet |

---

## 🎮 Business Logic Flow

### 1. User Registration
```
1. User signs in with Google OAuth
2. Auth creates record in auth.users
3. App creates profile in users table (wallet: ₹2450)
4. User can now browse tournaments
```

### 2. Tournament Entry
```
1. User selects tournament
2. Checks wallet_balance >= entry_fee
3. Creates transaction (type: 'tournament_entry')
4. Deducts from wallet_balance
5. Creates tournament_participants record
6. Increments tournament.current_players
```

### 3. Tournament Lifecycle
```
1. Admin creates tournament (status: 'upcoming')
2. Users join and pay entry fees
3. Admin sets room_id and room_password before start
4. Admin changes status to 'live'
5. Players see room credentials in waiting room
6. After game, admin enters results
7. Creates match records for each participant
8. Updates tournament_participants with placement/kills
9. Creates transactions (type: 'prize_win') for winners
10. Status changed to 'completed'
```

### 4. Wallet Operations
```
Deposit:
  1. User initiates payment via ZapUPI
  2. Creates transaction (status: 'pending')
  3. Payment gateway processes
  4. Webhook/polling verifies payment
  5. Updates transaction (status: 'completed')
  6. Adds to wallet_balance

Withdrawal:
  Similar flow but subtracts from balance
```

---

## 🛠️ Helper Scripts

Created scripts for database operations:

```bash
# Query Supabase
node scripts/query-supabase.js projects     # Project info
node scripts/query-supabase.js tables       # Table counts
node scripts/query-supabase.js tournaments  # All tournaments
node scripts/query-supabase.js users        # All users

# Full inspection
node scripts/inspect-supabase.js            # Complete schema + data
```

---

## ⚠️ Important Notes

1. **No Users Yet**: The users table is empty, meaning no one has signed up via OAuth yet
2. **One Participant**: Someone joined the tournament but may not have a user profile record
3. **Missing Images**: Tournament has no image_url set
4. **No Transactions**: No payment activity yet
5. **Room Credentials**: Need to be set by admin before tournament starts

---

## 🔑 Access Credentials

**Anon Key** (client-side, RLS-protected):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkY3dta2VsdW93ZWZ2Y2Vrd3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNDA0MDQsImV4cCI6MjA3MTYxNjQwNH0.q5X6DKts-HTmF9gbZ3lJlIQwRnXqk_IpSeKfyrloQhE
```

**MCP Access Token**:
```
sbp_29f49a0db72d3a0a19dbd32ad85c4f737668e709
```

---

## 📚 References

- Schema: `/scripts/database-schema.sql`
- RLS Policies: `/tournament-website/SUPABASE_SETUP.sql`
- Supabase Client: `/tournament-website/lib/supabase.ts`
- Type Definitions: `/tournament-website/lib/supabase.ts` (interfaces)
