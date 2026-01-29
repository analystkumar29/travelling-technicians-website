# 🔧 Supabase MCP Connection Error - Fix Guide

## ❌ Error: "MCP error -32000: Connection closed"

### Root Cause Identified

The MCP server requires a **Supabase Personal Access Token (PAT)** for the Management API, NOT the service role key used for database access.

**Wrong Configuration (Current):**
```json
{
  "env": {
    "SUPABASE_URL": "...",
    "SUPABASE_SERVICE_ROLE_KEY": "..."  // ❌ Wrong type of credential
  }
}
```

**Correct Configuration (Needed):**
```json
{
  "env": {
    "SUPABASE_ACCESS_TOKEN": "sbp_..."  // ✅ Personal Access Token
  }
}
```

---

## 📋 How to Get Your Personal Access Token

### Step 1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard/account/tokens
2. Or navigate: Supabase Dashboard → Your Profile (top right) → Access Tokens

### Step 2: Create a New Token
1. Click **"Generate new token"**
2. Give it a name: `MCP Server Token` or `Cline MCP`
3. Set scope: **Read** (for read-only access) or **Read & Write** (for full access)
4. Click **"Generate token"**

### Step 3: Copy the Token
- **IMPORTANT:** Copy the token immediately - you won't be able to see it again!
- Format: `sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- Keep it secure - this gives access to your Supabase account

---

## ⚙️ Configuration Options

The MCP server supports these parameters:

### Via Environment Variables:
```json
{
  "env": {
    "SUPABASE_ACCESS_TOKEN": "sbp_your_token_here"
  }
}
```

### Via Command-Line Args (in args array):
```json
{
  "args": [
    "/path/to/stdio.js",
    "--access-token", "sbp_your_token_here",
    "--project-ref", "uypdcusjyrfamohuwdxn",
    "--read-only"
  ]
}
```

---

## 🔒 Security Considerations

### Personal Access Token vs Service Role Key

| Token Type | Purpose | Scope |
|------------|---------|-------|
| **Personal Access Token (PAT)** | Management API | Projects, settings, logs, functions |
| **Service Role Key** | Database API | Direct database access via PostgREST |

The MCP server uses the **Management API** to:
- List tables and schemas
- View logs and advisors
- Deploy Edge Functions
- Generate TypeScript types
- Access project settings

It does **NOT** use the database connection directly.

---

## ✅ Next Steps

Once you have your Personal Access Token:

1. **Reply with your token** and I'll update the configuration
2. **Or** paste it yourself into the MCP settings file

The token should look like: `sbp_...` (starts with "sbp_")

---

## 🆘 Troubleshooting

### "Token invalid" error
- Make sure you copied the full token
- Check that it starts with `sbp_`
- Verify it hasn't been revoked in your dashboard

### "Permission denied" error
- Your token needs appropriate scopes
- Try generating a new token with Read & Write access

### "Project not found" error
- Remove the `--project-ref` parameter to access all projects
- Or verify your project ID is correct: `uypdcusjyrfamohuwdxn`

---

**Ready?** Get your token from: https://supabase.com/dashboard/account/tokens
