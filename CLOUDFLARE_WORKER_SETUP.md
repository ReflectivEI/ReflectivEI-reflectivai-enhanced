# Cloudflare Worker Duplication Guide

## Overview

This guide helps you create a **development copy** of your stable Cloudflare Worker, allowing you to test API changes without affecting your production environment.

---

## Why Duplicate Your Worker?

✅ **Safe Testing** - Modify API endpoints without breaking stable functionality
✅ **Parallel Development** - Work on new features while keeping production stable
✅ **Easy Rollback** - Keep your stable worker unchanged as a fallback
✅ **Version Control** - Maintain separate dev and production versions

---

## Step 1: Duplicate Your Worker in Cloudflare Dashboard

### Manual Duplication Process:

1. **Log into Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Navigate to **Workers & Pages**

2. **Find Your Stable Worker**
   - Locate your existing worker (e.g., `reflectivai-api`)
   - Click on the worker name to open it

3. **Copy the Worker Code**
   - Click **Quick Edit** or **Edit Code**
   - Select all code (Ctrl+A / Cmd+A)
   - Copy to clipboard (Ctrl+C / Cmd+C)

4. **Create New Worker**
   - Go back to Workers & Pages overview
   - Click **Create Application**
   - Select **Create Worker**
   - Name it: `reflectivai-api-dev` (or similar)
   - Click **Deploy**

5. **Paste Your Code**
   - Click **Quick Edit** on the new worker
   - Delete the default code
   - Paste your copied code (Ctrl+V / Cmd+V)
   - Click **Save and Deploy**

6. **Copy the New Worker URL**
   - You'll see a URL like: `https://reflectivai-api-dev.your-subdomain.workers.dev`
   - Copy this URL - you'll need it in Step 2

---

## Step 2: Update Frontend Configuration

### Update `.env` File

Replace the placeholder URL with your actual dev worker URL:

```bash
# Before:
VITE_API_BASE_URL=https://reflectivai-api-dev.your-subdomain.workers.dev

# After (example):
VITE_API_BASE_URL=https://reflectivai-api-dev.mycompany.workers.dev
```

### Verify Configuration

```bash
# Check that the URL is set correctly
cat .env | grep VITE_API_BASE_URL
```

---

## Step 3: Test the Connection

### Start the Development Server

```bash
npm run dev
```

### Test API Connection

1. Open the app in your browser
2. Navigate to the Dashboard (`/`)
3. Check the **API Status** indicator in the header
   - 🟢 Green = Connected to dev worker
   - 🔴 Red = Connection failed

### Test Specific Endpoints

- **Chat**: Go to `/chat` and send a message
- **Roleplay**: Go to `/roleplay` and start a scenario
- **Dashboard**: Check if daily insights load

---

## Step 4: Modify Your Dev Worker (Optional)

Now you can safely modify your dev worker without affecting the stable version.

### Common Modifications:

#### 1. Add New Endpoint

```javascript
// In your dev worker
if (url.pathname === '/api/new-feature') {
  return new Response(JSON.stringify({ message: 'New feature' }), {
    headers: corsHeaders,
  });
}
```

#### 2. Modify Existing Endpoint

```javascript
// Change response structure
if (url.pathname === '/api/chat/send') {
  // Add new fields to response
  return new Response(JSON.stringify({
    message: aiResponse,
    timestamp: Date.now(),
    sessionId: sessionId, // New field
  }), {
    headers: corsHeaders,
  });
}
```

#### 3. Update CORS Headers

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://yxpzdb7o9z.preview.c24.airoapp.ai',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

---

## Step 5: Switch Between Workers

### Use Dev Worker (Current Setup)

```bash
# .env
VITE_API_BASE_URL=https://reflectivai-api-dev.your-subdomain.workers.dev
```

### Use Stable Worker (Fallback)

```bash
# .env
VITE_API_BASE_URL=https://reflectivai-api.your-subdomain.workers.dev
```

### Quick Switch Script

You can create npm scripts for easy switching:

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "dev:stable": "VITE_API_BASE_URL=https://reflectivai-api.workers.dev vite",
    "dev:test": "VITE_API_BASE_URL=https://reflectivai-api-dev.workers.dev vite"
  }
}
```

---

## Worker Environment Variables

If your worker uses environment variables (secrets), you need to copy them to the dev worker:

### In Cloudflare Dashboard:

1. Go to your **stable worker**
2. Click **Settings** → **Variables**
3. Note down all environment variables
4. Go to your **dev worker**
5. Click **Settings** → **Variables**
6. Add the same variables

### Common Variables:

- `OPENAI_API_KEY` - OpenAI API key for AI responses
- `DATABASE_URL` - Database connection string
- `API_SECRET` - Internal API authentication
- `SESSION_SECRET` - Session encryption key

---

## Troubleshooting

### Issue: "API Status: Disconnected"

**Possible Causes:**
1. Worker URL is incorrect in `.env`
2. Worker is not deployed
3. CORS headers are missing
4. Worker has runtime errors

**Solutions:**
1. Verify URL in `.env` matches your worker URL
2. Check worker logs in Cloudflare Dashboard
3. Add CORS headers to all responses
4. Check worker code for syntax errors

### Issue: "CORS Error"

**Solution:** Add CORS headers to your worker:

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Or specific domain
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS preflight
if (request.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}

// Add to all responses
return new Response(JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json',
    ...corsHeaders,
  },
});
```

### Issue: "Worker responds but frontend shows errors"

**Possible Causes:**
1. Response format doesn't match frontend expectations
2. Missing required fields in response
3. Wrong HTTP status codes

**Solutions:**
1. Check browser console for specific errors
2. Compare response structure with `cloudflare-worker-api.md`
3. Ensure status codes match (200 for success, 400 for errors, etc.)

---

## Best Practices

### 1. Version Your Workers

```
reflectivai-api          → Stable/Production
reflectivai-api-dev      → Development/Testing
reflectivai-api-staging  → Pre-production (optional)
```

### 2. Use Environment-Specific URLs

```bash
# Development
VITE_API_BASE_URL=https://reflectivai-api-dev.workers.dev

# Staging
VITE_API_BASE_URL=https://reflectivai-api-staging.workers.dev

# Production
VITE_API_BASE_URL=https://reflectivai-api.workers.dev
```

### 3. Document API Changes

When you modify the dev worker, document changes:

```markdown
## API Changes in Dev Worker

### Added Endpoints:
- `POST /api/new-feature` - Description

### Modified Endpoints:
- `POST /api/chat/send` - Added `sessionId` field to response

### Breaking Changes:
- `GET /api/roleplay/session` - Changed response structure
```

### 4. Test Before Promoting to Stable

Before copying dev worker changes to stable:

- ✅ Test all endpoints
- ✅ Verify error handling
- ✅ Check CORS configuration
- ✅ Test with real data
- ✅ Review logs for errors

---

## Promoting Dev Changes to Stable

When your dev worker is ready:

1. **Backup Stable Worker**
   - Copy stable worker code to a file
   - Save as `worker-backup-YYYY-MM-DD.js`

2. **Copy Dev Worker Code**
   - Open dev worker in Cloudflare Dashboard
   - Copy all code

3. **Update Stable Worker**
   - Open stable worker
   - Paste dev worker code
   - Click **Save and Deploy**

4. **Test Stable Worker**
   - Update `.env` to use stable worker URL
   - Run full test suite
   - Verify all features work

5. **Rollback if Needed**
   - If issues occur, paste backup code
   - Deploy backup version

---

## Quick Reference

### Current Configuration

```bash
# Frontend uses DEV worker
VITE_API_BASE_URL=https://reflectivai-api-dev.your-subdomain.workers.dev

# Stable worker (reference only)
VITE_API_BASE_URL_STABLE=https://reflectivai-api.your-subdomain.workers.dev
```

### Worker URLs

- **Dev Worker**: `https://reflectivai-api-dev.your-subdomain.workers.dev`
- **Stable Worker**: `https://reflectivai-api.your-subdomain.workers.dev`

### Testing Checklist

- [ ] API Status shows connected
- [ ] Chat sends and receives messages
- [ ] Roleplay scenarios load
- [ ] Dashboard insights display
- [ ] No CORS errors in console
- [ ] All endpoints respond correctly

---

## Next Steps

1. **Create your dev worker** in Cloudflare Dashboard
2. **Copy the worker URL** and update `.env`
3. **Test the connection** by running `npm run dev`
4. **Start modifying** your dev worker safely

---

**Your stable worker remains untouched! 🎉**
