# Cloudflare Worker Deployment Commands

## 🚀 Complete Deployment Guide

Follow these commands in order to deploy your production worker code.

---

## Step 1: Install Wrangler CLI

```bash
# Install globally
npm install -g wrangler

# Verify installation
wrangler --version
```

**Expected output:** `wrangler 3.x.x` or higher

---

## Step 2: Authenticate with Cloudflare

```bash
# Login to Cloudflare
wrangler login
```

**What happens:**
- Opens browser for authentication
- Grants Wrangler access to your Cloudflare account
- Saves credentials locally

---

## Step 3: Create Worker Project

```bash
# Create project directory
mkdir -p ~/cloudflare-workers/reflectivai-worker
cd ~/cloudflare-workers/reflectivai-worker

# Initialize worker project
wrangler init
```

**When prompted:**
- "Would you like to use TypeScript?" → **No** (your code is JavaScript)
- "Would you like to create a package.json?" → **Yes**
- "Would you like to install wrangler into package.json?" → **Yes**

---

## Step 4: Add Your Production Worker Code

### Option A: Copy from file

If you have your production code in a file:

```bash
# Create src directory
mkdir -p src

# Copy your production worker code
cp /path/to/your/production-worker.js src/index.js
```

### Option B: Create file and paste

```bash
# Create src directory
mkdir -p src

# Open editor
code src/index.js  # VS Code
# OR
vim src/index.js   # Vim
# OR
nano src/index.js  # Nano
```

**Then paste your entire production worker code** (the 1,300+ line code you provided).

---

## Step 5: Create wrangler.toml Configuration

```bash
# Create wrangler.toml
cat > wrangler.toml << 'EOF'
name = "reflectivai-worker"
main = "src/index.js"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]

# Public environment variables
[vars]
PROVIDER_URL = "https://api.groq.com/openai/v1/chat/completions"
PROVIDER_MODEL = "llama-3.3-70b-versatile"

# CORS origins - Add your domains
CORS_ORIGINS = "https://reflectivei.github.io,https://yxpzdb7o9z.preview.c24.airoapp.ai,https://reflectivai-app-prod.pages.dev,https://production.reflectivai-app-prod.pages.dev"

# KV namespace for session storage
# Replace YOUR_KV_NAMESPACE_ID with actual ID after creating namespace
[[kv_namespaces]]
binding = "SESS"
id = "YOUR_KV_NAMESPACE_ID"
EOF
```

---

## Step 6: Create KV Namespace

```bash
# Create KV namespace for session storage
wrangler kv:namespace create "SESS"
```

**Expected output:**
```
🌀 Creating namespace with title "reflectivai-worker-SESS"
✨ Success!
Add the following to your wrangler.toml:
[[kv_namespaces]]
binding = "SESS"
id = "abc123def456..."
```

**Copy the `id` value and update wrangler.toml:**

```bash
# Replace YOUR_KV_NAMESPACE_ID with the actual ID
sed -i 's/YOUR_KV_NAMESPACE_ID/abc123def456.../g' wrangler.toml

# OR manually edit wrangler.toml and replace the ID
```

---

## Step 7: Set Secrets (API Keys)

### Option A: Single Groq API Key

```bash
# Set primary Groq API key
wrangler secret put PROVIDER_KEY
```

**When prompted, paste your Groq API key** (starts with `gsk_`)

### Option B: Multiple Groq API Keys (Recommended for Load Balancing)

```bash
# Set multiple keys (semicolon or comma separated)
wrangler secret put PROVIDER_KEYS
```

**When prompted, paste your keys in this format:**
```
gsk_key1;gsk_key2;gsk_key3
```

### Optional: OpenAI Fallback Key

```bash
# Set OpenAI key (optional fallback)
wrangler secret put OPENAI_API_KEY
```

**When prompted, paste your OpenAI API key** (starts with `sk-`)

---

## Step 8: Verify Configuration

```bash
# List secrets (shows names only, not values)
wrangler secret list

# Expected output:
# [
#   {
#     "name": "PROVIDER_KEY",
#     "type": "secret_text"
#   }
# ]
# OR
# [
#   {
#     "name": "PROVIDER_KEYS",
#     "type": "secret_text"
#   }
# ]

# List KV namespaces
wrangler kv:namespace list

# Expected output:
# [
#   {
#     "id": "abc123def456...",
#     "title": "reflectivai-worker-SESS"
#   }
# ]
```

---

## Step 9: Deploy Worker

```bash
# Deploy to Cloudflare
wrangler deploy
```

**Expected output:**
```
Total Upload: XX.XX KiB / gzip: XX.XX KiB
Uploaded reflectivai-worker (X.XX sec)
Published reflectivai-worker (X.XX sec)
  https://reflectivai-worker.YOUR_SUBDOMAIN.workers.dev
Current Deployment ID: abc123def456...
```

**Copy your worker URL:** `https://reflectivai-worker.YOUR_SUBDOMAIN.workers.dev`

---

## Step 10: Test Worker Endpoints

```bash
# Set your worker URL
export WORKER_URL="https://reflectivai-worker.YOUR_SUBDOMAIN.workers.dev"

# Test health endpoint
curl "$WORKER_URL/health"

# Expected response:
# {"ok":true,"status":"ok","worker":"parity-v2","openaiConfigured":true,"message":"AI provider configured"}

# Test status endpoint
curl "$WORKER_URL/api/status"

# Test dashboard insights
curl "$WORKER_URL/api/dashboard/insights"

# Test chat endpoint (requires POST)
curl -X POST "$WORKER_URL/api/chat/send" \
  -H "Content-Type: application/json" \
  -d '{"message":"How do I handle objections from HCPs?"}'
```

---

## Step 11: Monitor Worker Logs

```bash
# View real-time logs
wrangler tail

# View logs with filters
wrangler tail --status error  # Only errors
wrangler tail --method POST   # Only POST requests
```

**Keep this running in a separate terminal while testing.**

---

## Step 12: Update Frontend Configuration

### A. Update .env File

```bash
# Navigate to your frontend project
cd /path/to/ReflectivEI-reflectivai-enhanced

# Add worker URL to .env
echo "VITE_WORKER_URL=https://reflectivai-worker.YOUR_SUBDOMAIN.workers.dev" >> .env

# Verify
cat .env | grep VITE_WORKER_URL
```

### B. Disable Mock API

```bash
# Edit src/lib/mockApi.ts
code src/lib/mockApi.ts
```

**Change line 1:**
```typescript
// Before:
export const MOCK_API_ENABLED = true;

// After:
export const MOCK_API_ENABLED = false;
```

**OR use sed:**
```bash
sed -i 's/MOCK_API_ENABLED = true/MOCK_API_ENABLED = false/' src/lib/mockApi.ts
```

### C. Rebuild and Deploy Frontend

```bash
# Rebuild
npm run build

# Commit changes
git add .
git commit -m "feat: integrate Cloudflare Worker backend"

# Push to GitHub (triggers deployment)
git push origin main
```

---

## Step 13: Verify End-to-End Integration

### A. Wait for GitHub Actions Deployment

```bash
# Check deployment status
gh run list --limit 1

# OR visit:
# https://github.com/ReflectivEI/ReflectivEI-reflectivai-enhanced/actions
```

### B. Test Live Site

1. **Open deployed site:** https://reflectivei.github.io/ReflectivEI-reflectivai-enhanced/
2. **Clear browser cache:** Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
3. **Open DevTools:** F12 → Network tab
4. **Test Dashboard:**
   - Navigate to Dashboard
   - Check Network tab for requests to `reflectivai-worker.YOUR_SUBDOMAIN.workers.dev`
   - Verify 200 status codes
   - Check AI Daily Insights card loads with real data
5. **Test Chat:**
   - Navigate to Chat page
   - Send a message: "How do I handle objections?"
   - Verify AI response appears
   - Check Network tab for POST to `/api/chat/send`
6. **Test Roleplay:**
   - Navigate to Roleplay page
   - Start a scenario
   - Send a message
   - Verify HCP response with EQ metrics

### C. Check for Errors

```bash
# In browser DevTools Console, check for:
# ✅ No CORS errors
# ✅ No 404 errors
# ✅ No 401 Unauthorized errors
# ✅ Requests show worker URL, not mock API

# In worker logs (wrangler tail), check for:
# ✅ Incoming requests logged
# ✅ No error messages
# ✅ Session IDs generated
```

---

## 🔧 Troubleshooting Commands

### Issue: CORS Errors

```bash
# Update CORS_ORIGINS in wrangler.toml
code wrangler.toml

# Add your domain to CORS_ORIGINS
# Then redeploy:
wrangler deploy
```

### Issue: 401 Unauthorized

```bash
# Verify secrets are set
wrangler secret list

# Re-add API key
wrangler secret put PROVIDER_KEY

# Test Groq API key manually
curl -H "Authorization: Bearer YOUR_GROQ_KEY" \
  https://api.groq.com/openai/v1/models
```

### Issue: Worker Not Responding

```bash
# Check deployment status
wrangler deployments list

# View recent logs
wrangler tail --since 5m

# Redeploy
wrangler deploy
```

### Issue: Mock API Still Active

```bash
# Verify MOCK_API_ENABLED is false
grep -n "MOCK_API_ENABLED" src/lib/mockApi.ts

# Verify VITE_WORKER_URL is set
grep "VITE_WORKER_URL" .env

# Rebuild
npm run build

# Clear browser cache
# Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
```

### Issue: KV Namespace Not Found

```bash
# List KV namespaces
wrangler kv:namespace list

# Verify ID in wrangler.toml matches
grep "id =" wrangler.toml

# If mismatch, update wrangler.toml with correct ID
```

---

## 📊 Monitoring Commands

```bash
# View real-time logs
wrangler tail

# View deployments
wrangler deployments list

# View secrets (names only)
wrangler secret list

# View KV namespaces
wrangler kv:namespace list

# View KV keys (session IDs)
wrangler kv:key list --namespace-id YOUR_KV_NAMESPACE_ID

# View specific session data
wrangler kv:key get "sess:SESSION_ID" --namespace-id YOUR_KV_NAMESPACE_ID
```

---

## 🔄 Update Commands

### Update Worker Code

```bash
# Edit src/index.js
code src/index.js

# Deploy changes
wrangler deploy
```

### Update Environment Variables

```bash
# Update public variables in wrangler.toml
code wrangler.toml

# Deploy changes
wrangler deploy
```

### Update Secrets

```bash
# Update secret
wrangler secret put PROVIDER_KEY

# Delete secret
wrangler secret delete PROVIDER_KEY
```

### Rollback Deployment

```bash
# List deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback --message "Rollback to previous version"
```

---

## 🧹 Cleanup Commands

```bash
# Delete worker
wrangler delete

# Delete KV namespace
wrangler kv:namespace delete --namespace-id YOUR_KV_NAMESPACE_ID

# Delete all secrets
wrangler secret delete PROVIDER_KEY
wrangler secret delete PROVIDER_KEYS
wrangler secret delete OPENAI_API_KEY
```

---

## 📋 Quick Reference

### Essential Commands

```bash
# Deploy
wrangler deploy

# View logs
wrangler tail

# Test health
curl https://reflectivai-worker.YOUR_SUBDOMAIN.workers.dev/health

# List deployments
wrangler deployments list

# List secrets
wrangler secret list
```

### Environment Variables

**Secrets (via wrangler secret put):**
- `PROVIDER_KEY` - Single Groq API key
- `PROVIDER_KEYS` - Multiple Groq keys (semicolon separated)
- `OPENAI_API_KEY` - OpenAI fallback key (optional)

**Public (in wrangler.toml):**
- `PROVIDER_URL` - API endpoint (default: Groq)
- `PROVIDER_MODEL` - Model name (default: llama-3.3-70b-versatile)
- `CORS_ORIGINS` - Allowed origins (comma separated)

**KV Namespace:**
- `SESS` - Session storage binding

---

## ✅ Success Checklist

- [ ] Wrangler CLI installed
- [ ] Authenticated with Cloudflare
- [ ] Worker project created
- [ ] Production code added to src/index.js
- [ ] wrangler.toml configured
- [ ] KV namespace created and ID updated
- [ ] Groq API key(s) set as secrets
- [ ] Worker deployed successfully
- [ ] Health endpoint returns 200
- [ ] Dashboard insights endpoint works
- [ ] Chat endpoint responds with AI
- [ ] Frontend .env updated with worker URL
- [ ] Mock API disabled
- [ ] Frontend rebuilt and deployed
- [ ] Live site uses worker (not mock API)
- [ ] No CORS errors in browser console
- [ ] No 404 or 401 errors
- [ ] Worker logs show requests

---

## 🎉 You're Done!

Your Cloudflare Worker is deployed and integrated with your frontend.

**Worker URL:** `https://reflectivai-worker.YOUR_SUBDOMAIN.workers.dev`  
**Frontend URL:** `https://reflectivei.github.io/ReflectivEI-reflectivai-enhanced/`

**Next Steps:**
- Monitor worker logs for errors
- Test all features (Chat, Roleplay, Dashboard)
- Add custom domain (optional)
- Set up analytics (optional)

---

**Created:** December 29, 2025  
**Status:** Ready to deploy  
**Worker Version:** Production (1,300+ lines)
