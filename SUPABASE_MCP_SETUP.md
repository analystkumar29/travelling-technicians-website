# Supabase MCP Server Setup
## The Travelling Technicians - Database Access via MCP

**Date**: December 24, 2025  
**Status**: ✅ Configured and Connected  
**Server Name**: `travelling-technicians-supabase`

---

## 🎯 What is This?

You now have a **Supabase MCP (Model Context Protocol) server** connected to your project! This gives you (and AI assistants) direct database access through standardized tools and resources.

### Benefits

✅ **Direct Database Access** - Query, insert, update, and delete data  
✅ **AI-Friendly Interface** - AI assistants can work with your database naturally  
✅ **Type-Safe Operations** - Structured tools with clear parameters  
✅ **Resource Browsing** - View table data as MCP resources  
✅ **Secure** - Uses your service role key for admin access

---

## 📊 Available MCP Tools

The server provides 5 powerful tools for database operations:

### 1. **query_table** - Query Database Tables

Query any table with filters, pagination, and sorting.

**Example Usage:**
```typescript
// Query pending bookings
{
  "table": "bookings",
  "filters": { "status": "pending" },
  "limit": 10,
  "order_by": "created_at",
  "order_ascending": false
}
```

**Parameters:**
- `table` (required): Table name to query
- `columns` (optional): Columns to select (default: "*")
- `filters` (optional): Filter conditions (e.g., `{"status": "pending"}`)
- `limit` (optional): Max rows to return (default: 100)
- `offset` (optional): Rows to skip (default: 0)
- `order_by` (optional): Column to order by
- `order_ascending` (optional): Order direction (default: false)

---

### 2. **insert_row** - Insert New Records

Add new rows to any table.

**Example Usage:**
```typescript
// Create a new device model
{
  "table": "device_models",
  "data": {
    "name": "iPhone 15 Pro",
    "brand_id": 1,
    "status": "draft",
    "is_active": true
  }
}
```

**Parameters:**
- `table` (required): Table name
- `data` (required): Object with column-value pairs to insert

---

### 3. **update_rows** - Update Existing Records

Update rows that match filter conditions.

**Example Usage:**
```typescript
// Publish a device model
{
  "table": "device_models",
  "data": { "status": "published", "is_active": true },
  "filters": { "id": 123 }
}
```

**Parameters:**
- `table` (required): Table name
- `data` (required): Object with fields to update
- `filters` (required): Conditions to identify rows (e.g., `{"id": 123}`)

---

### 4. **delete_rows** - Delete Records

Delete rows matching filter conditions.

**Example Usage:**
```typescript
// Delete archived models
{
  "table": "device_models",
  "filters": { "status": "archived" }
}
```

**Parameters:**
- `table` (required): Table name
- `filters` (required): Conditions to identify rows to delete

**⚠️ Warning:** Be careful with delete operations! Always use specific filters.

---

### 5. **execute_rpc** - Call Database Functions

Execute Supabase stored procedures/functions.

**Example Usage:**
```typescript
// Call a custom function
{
  "function_name": "publish_model",
  "params": { "p_model_id": 123 }
}
```

**Parameters:**
- `function_name` (required): Name of the stored procedure
- `params` (optional): Parameters to pass to the function

---

## 📁 Available MCP Resources

The server exposes database tables as browsable resources:

### Static Resources

Access common tables directly:
- `supabase://tables/bookings` - All bookings
- `supabase://tables/device_models` - Device models
- `supabase://tables/brands` - Brands
- `supabase://tables/device_types` - Device types
- `supabase://tables/services` - Services
- `supabase://tables/dynamic_pricing` - Pricing data
- `supabase://tables/pricing_tiers` - Pricing tiers
- `supabase://tables/testimonials` - Customer testimonials
- `supabase://tables/faqs` - FAQ entries

### Dynamic Resources (Templates)

Access any table or get row counts:
- `supabase://tables/{table}` - Access any table
- `supabase://tables/{table}/count` - Get row count for any table

**Examples:**
- `supabase://tables/bookings/count` - Get total bookings
- `supabase://tables/audit_logs` - View audit logs

---

## 🔧 Configuration Details

### Server Location
```
/Users/manojkumar/Documents/Cline/MCP/supabase-server/
```

### Configuration File
```
/Users/manojkumar/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

### Environment Variables
- **SUPABASE_URL**: `https://ussjnyphwtmhpovmahnb.supabase.co`
- **SUPABASE_SERVICE_KEY**: Configured (service role key with admin access)

---

## 💡 Usage Examples

### Example 1: Check Pending Bookings

Ask an AI assistant:
> "Can you show me all pending bookings from the last 7 days?"

The assistant will use the `query_table` tool:
```typescript
{
  "table": "bookings",
  "filters": { "status": "pending" },
  "order_by": "created_at",
  "order_ascending": false,
  "limit": 20
}
```

### Example 2: Create a New Device Model

Ask an AI assistant:
> "Create a new device model for iPhone 16 Pro"

The assistant will use the `insert_row` tool:
```typescript
{
  "table": "device_models",
  "data": {
    "name": "iPhone 16 Pro",
    "brand_id": 1,
    "status": "draft",
    "is_active": true
  }
}
```

### Example 3: Publish Multiple Models

Ask an AI assistant:
> "Publish all draft models for Samsung"

The assistant will:
1. Query draft Samsung models
2. Use `update_rows` to publish them

### Example 4: Get Database Statistics

Ask an AI assistant:
> "How many active device models do we have?"

The assistant can use the resource:
```
supabase://tables/device_models/count
```

---

## 🚀 How to Use

### In Conversations with AI

Simply ask natural language questions about your database:
- "Show me all iPhone models"
- "How many pending bookings are there?"
- "Create a new FAQ entry"
- "Update the status of booking #123 to confirmed"
- "Delete all archived testimonials"

### Direct Tool Invocation

AI assistants with MCP access can invoke tools directly when appropriate.

---

## 🔒 Security Notes

### What You Should Know

1. **Service Role Key**: The MCP server uses your Supabase service role key, which has **full admin access** to your database
2. **Stored Securely**: Credentials are stored in your local MCP settings file
3. **Local Only**: The MCP server runs locally on your machine
4. **No External Exposure**: Your database credentials are not exposed to the internet

### Best Practices

✅ **Use Filters**: Always use specific filters when updating or deleting  
✅ **Test First**: Test queries with small limits before bulk operations  
✅ **Backup**: Ensure you have database backups before destructive operations  
✅ **Monitor**: Review the SQL migration file before applying changes  

---

## 🛠️ Maintenance

### Rebuilding the Server

If you make changes to the server code:

```bash
cd /Users/manojkumar/Documents/Cline/MCP/supabase-server
npm run build
```

### Updating Configuration

Edit the MCP settings file:
```bash
/Users/manojkumar/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

### Checking Server Logs

The server logs to stderr. Check for connection issues in the MCP server logs section of your IDE.

---

## 📋 Troubleshooting

### Issue: Server Not Connected

**Check:**
1. Verify the build directory exists: `/Users/manojkumar/Documents/Cline/MCP/supabase-server/build/`
2. Ensure credentials are correct in MCP settings
3. Check server logs for error messages

**Solution:**
```bash
cd /Users/manojkumar/Documents/Cline/MCP/supabase-server
npm run build
```

### Issue: Database Connection Error

**Check:**
1. Supabase project is active
2. Service role key is valid
3. Network connectivity

**Solution:**
Verify credentials in your Supabase dashboard under Settings → API

### Issue: Permission Denied

**Check:**
1. Using service role key (not anon key)
2. Row Level Security policies if applicable

---

## 🔄 Integration with Existing Project

### Your Project Already Uses Supabase

Your project uses Supabase through the traditional JavaScript client in `src/utils/supabaseClient.ts`.

**Now you have BOTH:**
1. **Traditional approach** (in code): For your Next.js application
2. **MCP approach** (via tools): For AI-assisted database operations

They both work with the same database, so changes made through MCP tools will be reflected in your application.

### No Conflicts

The MCP server and your application can work together seamlessly:
- **Application code**: Uses `@supabase/supabase-js` client
- **MCP tools**: Uses the same Supabase API through MCP protocol
- **Same database**: Both access the same PostgreSQL database

---

## 📞 Next Steps

### Try It Out!

Ask an AI assistant questions like:
- "Show me all device models in the database"
- "How many bookings do we have?"
- "Create a test FAQ entry"
- "What tables are available in my database?"

### Combine with Other Features

Use MCP tools alongside:
- Your existing Admin Panel (`/management/*`)
- Your API routes (`/api/management/*`)
- Direct Supabase client in your code

---

## 🎉 Summary

You now have:
✅ **Supabase MCP server** installed and configured  
✅ **5 database tools** available for operations  
✅ **9 resource endpoints** for viewing table data  
✅ **Direct database access** through natural language  
✅ **Admin-level permissions** via service role key  

**The MCP server is ready to use!** Try asking an AI assistant to interact with your database.

---

**Questions or Issues?**
- Check the troubleshooting section above
- Review server logs in your IDE's MCP section
- Ensure your Supabase project is active and accessible

**Server Status**: 🟢 Connected and Ready
