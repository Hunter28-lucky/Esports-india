# Supabase MCP (Model Context Protocol) Setup

## What is Supabase MCP?

The Supabase MCP server allows AI assistants (like GitHub Copilot) to interact with your Supabase database directly. It provides tools to:

- Execute SQL queries
- Apply database migrations
- Manage tables, branches, and Edge Functions
- Check advisors for security/performance issues
- Generate TypeScript types from your schema

## Setup Instructions

### 1. GitHub Copilot (Built-in)

The Supabase MCP server is **already available** in GitHub Copilot. No additional installation needed!

You can use it by asking Copilot to:
- "List all tournaments in the database"
- "Create a new migration to add a column"
- "Generate TypeScript types from my Supabase schema"
- "Check for security advisors in my project"

### 2. Authentication

The MCP server uses your Supabase credentials. You have:

1. **Project ID**: `bdcwmkeluowefvcekwqq` (from `lib/supabase.ts`)
2. **Supabase Access Token**: `sbp_6be6ee4c8f62020d1f65f33f93538e8fb40dd9fb`

#### Setting up the token in VS Code:

The Supabase MCP server should automatically prompt for authentication when you use it. If not, the token is stored in your system's MCP configuration.

**Note**: The token provided appears to be a personal access token. If you encounter permission errors:
- Ensure the token has full project access
- Verify you're the owner/admin of project `bdcwmkeluowefvcekwqq`
- Regenerate the token with all permissions enabled at [Supabase Dashboard](https://supabase.com/dashboard/account/tokens)

### 3. Available MCP Tools

The Supabase MCP provides these tools:

#### Database Operations
- `execute_sql` - Run SQL queries
- `apply_migration` - Apply DDL migrations
- `list_migrations` - View migration history
- `list_tables` - List tables in schemas
- `list_extensions` - View installed extensions

#### Project Management
- `list_projects` - List all your Supabase projects
- `get_project` - Get project details
- `create_project` - Create new projects
- `pause_project` / `restore_project` - Manage project state

#### Branches (for Preview Environments)
- `list_branches` - List development branches
- `create_branch` - Create a new branch
- `merge_branch` - Merge branch to production
- `reset_branch` - Reset branch state
- `delete_branch` - Delete a branch

#### Edge Functions
- `list_edge_functions` - List deployed functions
- `get_edge_function` - Get function code
- `deploy_edge_function` - Deploy new functions

#### Security & Performance
- `get_advisors` - Check for security/performance issues
- `generate_typescript_types` - Generate types from schema
- `get_logs` - Fetch service logs

## Usage Examples

### Example 1: Query Tournaments
```typescript
// Ask Copilot: "List all upcoming tournaments"
// MCP will execute:
SELECT * FROM tournaments 
WHERE status = 'upcoming' 
ORDER BY start_time ASC;
```

### Example 2: Add a Migration
```typescript
// Ask Copilot: "Add a 'description' column to tournaments table"
// MCP will create migration:
ALTER TABLE tournaments ADD COLUMN description TEXT;
```

### Example 3: Generate Types
```typescript
// Ask Copilot: "Generate TypeScript types for my database schema"
// MCP will fetch your schema and generate types
```

### Example 4: Security Check
```typescript
// Ask Copilot: "Check for security issues in my database"
// MCP will run security advisors and report RLS policy issues
```

## Project-Specific Configuration

For this Esports Tournament Platform:

- **Project ID**: `bdcwmkeluowefvcekwqq`
- **Project URL**: `https://bdcwmkeluowefvcekwqq.supabase.co`
- **Main Tables**: `users`, `tournaments`, `tournament_participants`, `matches`, `transactions`
- **RLS Enabled**: All tables have Row-Level Security

## Best Practices

1. **Always authenticate** before running queries (RLS is enabled)
2. **Use migrations** for DDL changes (via `apply_migration`)
3. **Check advisors regularly** for security/performance issues
4. **Generate types** after schema changes to keep TypeScript in sync
5. **Use branches** for testing migrations before production

## Troubleshooting

### "Authentication required" errors
- Generate a Supabase access token: [Dashboard → Account → Access Tokens](https://supabase.com/dashboard/account/tokens)
- The MCP server needs this to authenticate API calls

### "Project not found" errors
- Verify project ID: `bdcwmkeluowefvcekwqq`
- Check your Supabase account has access to this project

### RLS policy violations
- Queries through MCP respect RLS policies
- Use service role key for admin operations (via Supabase dashboard)

### Switching Supabase Accounts in MCP

If you connected the wrong Supabase account:

#### Option 1: Using VS Code Command Palette (Recommended)
1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type: "GitHub Copilot: Reset Extension"
3. Restart VS Code
4. The MCP will prompt for authentication again on next use

#### Option 2: Clear MCP Authentication Manually
1. **Close VS Code completely**
2. **Delete MCP auth cache**:
   - **macOS**: 
     ```bash
     rm -rf ~/Library/Application\ Support/Code/User/globalStorage/github.copilot-chat/mcpServers/supabase
     ```
   - **Linux**:
     ```bash
     rm -rf ~/.config/Code/User/globalStorage/github.copilot-chat/mcpServers/supabase
     ```
   - **Windows**:
     ```powershell
     Remove-Item -Recurse -Force "$env:APPDATA\Code\User\globalStorage\github.copilot-chat\mcpServers\supabase"
     ```
3. **Restart VS Code**
4. **Generate new token** from correct account:
   - Login to correct Supabase account
   - Go to [Dashboard → Account → Access Tokens](https://supabase.com/dashboard/account/tokens)
   - Create new token with "Full Access"
5. **Trigger MCP authentication**:
   - Ask Copilot: "List my Supabase projects"
   - Provide the new token when prompted

#### Option 3: Using Terminal Command
```bash
# Navigate to your project
cd /Users/krishyogi/Desktop/Esports-india/tournament-website

# Clear the MCP cache
rm -rf ~/Library/Application\ Support/Code/User/globalStorage/github.copilot-chat/mcpServers/supabase

# Restart VS Code
```

#### Verifying the Switch
After reconnecting, verify with:
1. Ask Copilot: "List all my Supabase projects"
2. Check if project `bdcwmkeluowefvcekwqq` appears in the list
3. Try: "Show me tables in the public schema"

**Current Status**: Connected to account with token `sbp_6be6ee4c8f62020d1f65f33f93538e8fb40dd9fb` (needs to be cleared)

## Resources

- [Supabase MCP Documentation](https://mcp.supabase.com/mcp)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)

## Integration with Copilot Instructions

This MCP server integrates with the `.github/copilot-instructions.md` to provide:
- Database schema awareness
- Table/column autocomplete
- Query validation
- Migration suggestions
- Security recommendations

When asking Copilot about database operations, it will automatically use the Supabase MCP to provide accurate, project-specific suggestions.
