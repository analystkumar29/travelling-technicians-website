# 🔐 Admin Credentials Setup & Reset Guide

**Project:** The Travelling Technicians Website - Admin Panel  
**Date:** January 29, 2026

---

## 📋 How Admin Authentication Works

The admin panel uses **PBKDF2 password hashing** with a salt for secure credential storage. The system requires three environment variables:

```
ADMIN_USERNAME       - Username to login (defaults to 'admin')
ADMIN_PASSWORD_HASH  - Hashed password with salt
ADMIN_JWT_SECRET     - Secret key for JWT token generation
```

---

## 🔑 Default Admin Credentials (If Not Changed)

**Username:** `admin`  
**Password:** Depends on `ADMIN_PASSWORD_HASH` environment variable

---

## 🛠️ How to Reset Admin Credentials

### Option 1: Using Node.js (Recommended)

Create a file called `generate-admin-hash.js` in your project root:

```javascript
const crypto = require('crypto');

// Generate a password hash
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Your desired password
const password = process.argv[2] || 'admin123';
const hash = hashPassword(password);

console.log('✅ Generated Password Hash:');
console.log(hash);
console.log('\nAdd this to your .env.local or .env.production:');
console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
```

**Run it:**
```bash
node generate-admin-hash.js your-desired-password
```

**Example:**
```bash
node generate-admin-hash.js "MySecurePassword123!"
```

This will output something like:
```
ADMIN_PASSWORD_HASH="a1b2c3d4e5f6:abc123def456..."
```

### Option 2: Manual Setup

1. Go to your `.env.local` or `.env.production` file
2. Add these variables:

```env
# Admin Authentication
ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="salt:hash"
ADMIN_JWT_SECRET="your-secret-jwt-key-here"
```

3. Replace `salt:hash` with the output from Option 1

---

## 📝 Environment Variables Explained

### `ADMIN_USERNAME`
- The username to login with
- Default: `'admin'` (if not set)
- You can change this to any username you want

**Example:**
```env
ADMIN_USERNAME="manoj_admin"
```

### `ADMIN_PASSWORD_HASH`
- **REQUIRED** - Must be set for login to work
- Format: `salt:hash` where salt and hash are hex strings
- Generated using PBKDF2 with 10,000 iterations
- Use the generator script above to create this

**Do NOT set this to:**
- Plain text passwords
- MD5 hashes (insecure)
- Simple salts

### `ADMIN_JWT_SECRET`
- **REQUIRED** - Used to sign authentication tokens
- Should be a random, long string
- Tokens are valid for 7 days
- Keep this secret and never commit to Git

**Generate a secure secret:**
```bash
# On Mac/Linux
openssl rand -hex 32

# On Windows (PowerShell)
[System.Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**Example:**
```env
ADMIN_JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z"
```

---

## ✅ Complete Setup Example

Here's a complete .env.local setup:

```env
# Database Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Admin Authentication
ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="a1b2c3d4e5f6:abc123def456xyz789..."
ADMIN_JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"

# Other configs...
SENDGRID_API_KEY="your-sendgrid-key"
```

---

## 🚀 Step-by-Step to Login

### 1. Generate Password Hash
```bash
node generate-admin-hash.js "MyPassword123"
```

### 2. Copy the output
```
ADMIN_PASSWORD_HASH="a1b2c3d4:abc123..."
```

### 3. Add to .env.local
Edit `.env.local` and add:
```env
ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="a1b2c3d4:abc123..."
ADMIN_JWT_SECRET="your-secret-key"
```

### 4. Restart your development server
```bash
npm run dev
# or
yarn dev
```

### 5. Login
Go to: `http://localhost:3000/login`

**Username:** `admin`  
**Password:** `MyPassword123`

---

## 🔒 Security Best Practices

✅ **DO:**
- Use strong, complex passwords (mix of uppercase, lowercase, numbers, symbols)
- Keep `ADMIN_JWT_SECRET` secret and secure
- Regenerate password hash periodically
- Use different credentials for dev and production
- Store credentials in environment variables, NOT in code

❌ **DON'T:**
- Commit `.env.local` to Git (add to .gitignore)
- Use simple passwords like "admin" or "password"
- Share credentials via email or chat
- Use the same credentials across environments
- Expose `ADMIN_JWT_SECRET` in frontend code

---

## 🐛 Troubleshooting

### Error: "Server configuration error - contact administrator"
**Cause:** `ADMIN_PASSWORD_HASH` is not set  
**Solution:** Generate and add password hash to .env.local

### Error: "Invalid credentials"
**Possible causes:**
1. Wrong username
2. Wrong password
3. Incorrect password hash format (should be `salt:hash`)

### Error: "Too many failed attempts. Please wait 15 minutes."
**Cause:** 5 failed login attempts in 15 minutes  
**Solution:** Wait 15 minutes and try again

### Session expires immediately
**Cause:** `ADMIN_JWT_SECRET` is not set or changed  
**Solution:** Ensure `ADMIN_JWT_SECRET` is consistent and set in .env.local

---

## 📱 Login Form

The login page is at: `/login`

**Features:**
- ✅ Rate limiting (5 attempts per 15 minutes)
- ✅ Secure password hashing (PBKDF2)
- ✅ JWT token generation
- ✅ 7-day session expiration
- ✅ Secure HTTP-only cookies

---

## 🔄 Changing Admin Password

To change your admin password:

1. Generate new hash:
```bash
node generate-admin-hash.js "NewPassword123"
```

2. Update `.env.local`:
```env
ADMIN_PASSWORD_HASH="new_salt:new_hash"
```

3. Restart the server

4. Login with new password

---

## 💾 Production Deployment

For production, set these environment variables in your hosting platform:

### Vercel
1. Go to your project settings
2. Click "Environment Variables"
3. Add:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD_HASH`
   - `ADMIN_JWT_SECRET`

### Heroku
```bash
heroku config:set ADMIN_USERNAME="admin"
heroku config:set ADMIN_PASSWORD_HASH="salt:hash"
heroku config:set ADMIN_JWT_SECRET="secret-key"
```

### Docker
Add to `.env.production`:
```env
ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="salt:hash"
ADMIN_JWT_SECRET="secret-key"
```

---

## 📊 What Happens on Login

```
1. User enters username & password
   ↓
2. Frontend sends to POST /api/management/login
   ↓
3. Backend validates username matches ADMIN_USERNAME
   ↓
4. Backend hashes input password with stored salt
   ↓
5. Compares hash with stored ADMIN_PASSWORD_HASH
   ↓
6. If match: Generates JWT token (7-day expiry)
   ↓
7. Token stored in secure HTTP-only cookie
   ↓
8. User can access admin panel (/management)
   ↓
9. Token auto-verified on each request
   ↓
10. After 7 days: Session expires, login required
```

---

## 🔐 Session Management

- **Token Lifetime:** 7 days
- **Storage:** Secure HTTP-only cookie
- **Session Check:** On every admin page load
- **Logout:** Clears cookie, redirects to login
- **Rate Limiting:** 5 attempts per 15 minutes per IP

---

## ✅ Verification Checklist

Before going live:

- [ ] `ADMIN_USERNAME` is set and different from default
- [ ] `ADMIN_PASSWORD_HASH` is generated and set
- [ ] `ADMIN_JWT_SECRET` is a random, long string
- [ ] `.env.local` is in .gitignore
- [ ] Can login successfully
- [ ] Can access admin panel after login
- [ ] Sessions persist for 7 days
- [ ] Logout clears authentication
- [ ] Wrong password shows error
- [ ] Rate limiting blocks after 5 attempts

---

## 📞 Support

If you're still having issues:

1. Check that all three environment variables are set
2. Verify password hash format: `salt:hash` (colon-separated)
3. Ensure server is restarted after env var changes
4. Check browser console for JavaScript errors
5. Check server logs for error messages

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Generate password hash | `node generate-admin-hash.js "password"` |
| Generate JWT secret | `openssl rand -hex 32` |
| View login page | Go to `/login` |
| Access admin panel | Go to `/management` (after login) |
| Logout | Click "Logout" in admin panel |
| Change password | Re-run hash generator and update .env |

---

**Admin authentication is now fully configured! 🎉**

