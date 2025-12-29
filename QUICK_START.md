# ReflectivAI - Quick Start Guide

## ✅ Your App is Ready!

The ReflectivAI application is now fully configured with local mock API endpoints. You can test all features immediately!

---

## 🚀 How to Access Your App

### Option 1: Preview URL (Recommended)

**Open this URL in your browser:**

```
https://yxpzdb7o9z.preview.c24.airoapp.ai
```

This is your public preview URL that's accessible from anywhere.

### Option 2: Local URL

```
http://localhost:20000
```

This works if you're running the app locally.

---

## 🎯 What You Can Test Right Now

### 1. **Dashboard** (Home Page)
- Daily tips and insights
- Focus areas with scores
- Recent activity stats
- Suggested exercises

### 2. **AI Coach Chat** (`/chat`)
- Send messages to the AI coach
- Get intelligent responses
- Clear chat history
- Context filters (disease state, specialty, etc.)

### 3. **Roleplay Simulator** (`/roleplay`)
- Practice HCP conversations
- Get live EQ metrics
- Receive detailed feedback
- Multiple scenarios available

### 4. **Other Pages**
- `/frameworks` - EI frameworks library
- `/modules` - Training modules
- `/exercises` - Practice exercises
- `/knowledge` - Knowledge base
- `/heuristics` - Communication templates
- `/ei-metrics` - EQ metrics dashboard
- `/data-reports` - Analytics and reports
- `/sql` - Natural language to SQL

---

## 🔍 Checking if It's Working

### Look for the API Status Indicator

In the header of the application, you should see:

- **🟢 Green badge "Connected"** = Everything is working!
- **🔴 Red badge "Disconnected"** = Something is wrong

If you see green, you're good to go!

---

## 🧪 Mock API Features

### What's Been Set Up:

✅ **8 Mock API Endpoints**
- Status check
- Chat (send, messages, clear)
- Roleplay (start, respond, end)
- Dashboard insights

✅ **Realistic Mock Data**
- 5 different AI coach responses
- 5 different HCP responses
- Random EQ metrics (60-100 range)
- Simulated delays (800ms for chat, 1000ms for roleplay)

✅ **Full Functionality**
- Chat works end-to-end
- Roleplay works with live metrics
- Dashboard loads insights
- All pages are functional

---

## 🐛 Troubleshooting

### Issue: Page won't load

**Solution:**
1. Check that the dev server is running
2. Try refreshing the page (Ctrl+R or Cmd+R)
3. Clear browser cache and reload (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: API Status shows "Disconnected"

**Solution:**
1. The server might be restarting - wait 10 seconds and refresh
2. Check browser console (F12) for errors
3. Verify `.env` has `VITE_API_BASE_URL=http://localhost:20000`

### Issue: Chat or Roleplay not responding

**Solution:**
1. Open browser console (F12) and check for errors
2. Look at the Network tab to see if API calls are being made
3. Refresh the page and try again

---

## 📚 Documentation

For detailed testing instructions, see:

- **`MOCK_API_TESTING.md`** - Complete testing guide
- **`CLOUDFLARE_WORKER_SETUP.md`** - How to set up a real Cloudflare Worker (when ready)
- **`INTEGRATION_COMPLETE.md`** - Technical details about the integration

---

## 🎉 Next Steps

1. **Open the preview URL** in your browser
2. **Test the dashboard** - Make sure it loads
3. **Try the chat** - Send a message to the AI coach
4. **Start a roleplay** - Practice with Dr. Sarah Mitchell
5. **Explore other pages** - Check out frameworks, modules, etc.

---

## 💡 Important Notes

- **Mock API is for testing only** - Data doesn't persist between sessions
- **Responses are random** - Each request gets a different response
- **No Cloudflare Worker needed** - Everything works locally
- **Easy to switch** - When ready, update `.env` to use real Cloudflare Worker

---

## 🆘 Need Help?

If something isn't working:

1. Check the browser console (F12) for errors
2. Look at the Network tab to see API calls
3. Verify the API Status indicator is green
4. Try refreshing the page
5. Check the documentation files for more details

---

**Your ReflectivAI app is ready to use! Open the preview URL and start testing! 🚀**
