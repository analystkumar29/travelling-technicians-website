# Supabase MCP - Usage Examples

## 🎬 Live Demo Examples

Here are practical examples of how you can use the Supabase MCP server in your workflow:

---

## Example 1: Check Database Schema

**What you want to know:** What tables exist in my Supabase database?

**How to ask me:**
```
"List all tables in my Supabase database"
```

**What happens:**
- MCP calls `list_tables` on your Supabase project
- Returns all available tables in the public schema
- Shows table names, columns, and data types
- Useful for: Schema exploration, documentation, debugging

---

## Example 2: Generate TypeScript Types

**What you want to know:** I want TypeScript interfaces for all my tables

**How to ask me:**
```
"Generate TypeScript types for my Supabase database schema and save them"
```

**What happens:**
- MCP generates strongly-typed TypeScript interfaces
- Matches your actual database schema exactly
- Includes all fields and constraints
- Can be saved to a file like `types/database.ts`
- Useful for: Type safety, IDE autocomplete, development speed

---

## Example 3: Query Project Information

**What you want to know:** What's my project's API endpoint?

**How to ask me:**
```
"Get my Supabase project URL"
```

**What happens:**
- MCP returns your project's public API URL
- Shows publishable/anon keys
- Useful for: Configuration, documentation, debugging connection issues

---

## Example 4: Review Database Migrations

**What you want to know:** What migrations have been applied?

**How to ask me:**
```
"List all database migrations that have been applied to my project"
```

**What happens:**
- MCP shows all migrations in order
- Shows timestamps and migration names
- Useful for: Understanding schema evolution, debugging migration issues

---

## Example 5: Check Project Health

**What you want to know:** Are there any issues with my Supabase project?

**How to ask me:**
```
"Get security and performance advisories for my Supabase project"
```

**What happens:**
- MCP retrieves advisor notices
- Shows potential issues: security gaps, performance problems, unused features
- Useful for: Proactive maintenance, security audits

---

## Example 6: View Logs

**What you want to know:** Are there any API errors?

**How to ask me:**
```
"Get the API logs from my Supabase project"
```

**What happens:**
- MCP retrieves recent API service logs
- Can filter by service: api, postgres, auth, storage, functions, realtime
- Shows errors, warnings, info messages
- Useful for: Debugging, monitoring, troubleshooting

---

## Example 7: Search Documentation

**What you want to know:** How do I set up Row Level Security?

**How to ask me:**
```
"Search the Supabase documentation for Row Level Security examples"
```

**What happens:**
- MCP searches Supabase docs
- Returns relevant articles and guides
- Shows links and key information
- Useful for: Learning, best practices, implementation guides

---

## Example 8: List Edge Functions

**What you want to know:** What Edge Functions do I have deployed?

**How to ask me:**
```
"List all Edge Functions in my Supabase project"
```

**What happens:**
- MCP shows all deployed Edge Functions
- Shows function names, creation dates, status
- Useful for: Inventory, debugging, monitoring deployments

---

## Real-World Workflow

Here's how you might use the MCP in a real development scenario:

### Scenario: Adding a new feature to the booking system

1. **Start:** "Generate TypeScript types for my database schema"
   - Get up-to-date types for the `bookings` table
   
2. **Build:** Use the types in your React component for type safety

3. **Debug:** "Get the API logs to see if there are any errors"
   - Check if your API calls are failing
   
4. **Review:** "Get security advisories for my project"
   - Ensure your new feature doesn't introduce vulnerabilities

5. **Document:** "List all tables in my Supabase database"
   - Verify the schema is as expected

---

## Security & Best Practices

✅ **All operations are read-only** - No data can be accidentally modified
✅ **Project scoped** - Limited to your specific project
✅ **Manual approval** - You approve each action before it runs
✅ **Transparent** - See exactly what the MCP is doing

---

## Comparison: Custom Server vs Official Server

You now have access to **both**:

### Custom Local Server (`travelling-technicians-supabase`)
- Uses your Supabase credentials locally
- Custom tools: `query_table`, `insert_row`, `update_rows`, `delete_rows`
- Full control, but requires node server to run
- Good for: Direct database operations

### Official Cloud Server (`github.com/supabase-community/supabase-mcp`)
- Cloud-hosted by Supabase
- Rich toolset: docs search, logs, advisors, TypeScript generation
- Always available, no local setup needed
- Read-only mode for safety
- Good for: Information gathering, debugging, documentation

---

## 🚀 Next Steps

Try asking me one of these questions:

- "List all tables in my Supabase database"
- "Generate TypeScript types for my schema"
- "Get my Supabase project URL"
- "Check for security advisories in my project"
- "Search the Supabase docs for authentication"
- "Get the API logs from my project"
- "List all my Edge Functions"

The MCP server will handle it automatically! 🎉
