# Supabase MCP Server - Authentication Setup

## 🔍 Issue Identified & Fixed

The Supabase MCP server had an **invalid schema configuration** which has now been corrected. 

**What was wrong:**
- ❌ HTTP-based servers don't support `disabled` and `autoApprove` properties
- ❌ These properties are only valid for local command-based servers

**Status:** 
- ✅ Server endpoint is reachable (`https://mcp.supabase.com/mcp`)
- ✅ Configuration schema is now correct
- ⚠️  OAuth authentication is pending (401 Unauthorized)

---

## 🔧 How to Complete Authentication

The Supabase MCP server uses OAuth 2.1 for secure authentication. Follow these steps:

### Option 1: Restart VS Code (Recommended)
1. **Save all your work**
2. **Quit VS Code completely** (Cmd+Q on macOS)
3. **Reopen VS Code**
4. **You should see an OAuth prompt** asking you to authenticate with Supabase
5. **Click "Authenticate"** and follow the browser flow
6. **Select your organization** that contains the project `uypdcusjyrfamohuwdxn`
7. **Grant permissions** to the MCP server

### Option 2: Trigger Authentication Manually
1. Open the **Command Palette** (Cmd+Shift+P)
2. Search for **"MCP: Reconnect All Servers"** or **"Cline: Restart MCP Servers"**
3. This should trigger the OAuth flow
4. Follow the authentication prompts

### Option 3: Check MCP Server Status
1. Look for an **MCP status indicator** in VS Code (usually bottom right)
2. Click on it to see server connection status
3. If the Supabase server shows "Not authenticated", click to initiate OAuth

---

## 📋 What Happens During OAuth

1. **Browser opens** with Supabase login
2. **You log in** with your Supabase account
3. **Select organization** containing your project
4. **Grant permissions** to the MCP server
5. **Cline receives** an authentication token
6. **Server connects** automatically

---

## ✅ Verify Connection

After authentication, you should be able to ask me:

- "List all tables in my Supabase database"
- "Generate TypeScript types for my schema"
- "Get my Supabase project URL"

If the server is connected, I'll be able to execute these commands.

---

## 🔒 Security Notes

- OAuth tokens are stored securely by VS Code
- Tokens automatically refresh when needed
- You can revoke access anytime from your Supabase dashboard
- The server is in **read-only mode** for safety

---

## 🆘 Troubleshooting

If authentication fails:

1. **Check your Supabase account** - Make sure you have access to the project
2. **Verify organization membership** - Confirm you're a member of the organization
3. **Clear VS Code cache**:
   ```bash
   rm -rf ~/Library/Application\ Support/Code/User/globalStorage/saoudrizwan.claude-dev/
   ```
   Then restart VS Code and reconfigure

4. **Check network connectivity** - Ensure you can access `https://mcp.supabase.com`

---

## 📖 Additional Resources

- [Supabase MCP Documentation](https://supabase.com/docs/guides/getting-started/mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP OAuth Flow](https://modelcontextprotocol.io/docs/concepts/authentication)

---

**Next Step:** Please restart VS Code (Cmd+Q, then reopen) to trigger the OAuth authentication flow! 🚀

---

## 📝 What Was Fixed

**Before (Invalid Schema):**
```json
{
  "mcpServers": {
    "github.com/supabase-community/supabase-mcp": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?read_only=true&project_ref=uypdcusjyrfamohuwdxn",
      "disabled": false,      // ❌ Invalid for HTTP servers
      "autoApprove": []       // ❌ Invalid for HTTP servers
    }
  }
}
```

**After (Correct Schema):**
```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?read_only=true&project_ref=uypdcusjyrfamohuwdxn"
    }
  }
}
```

The schema is now valid and ready for OAuth authentication!
