# Mock API Testing Guide

## Overview

Your ReflectivAI application is now configured with **local mock API endpoints** that simulate the Cloudflare Worker functionality. This allows you to test all features immediately without needing to set up a real Cloudflare Worker.

---

## ✅ What's Been Set Up

### Mock API Endpoints Created

All endpoints are now available locally at `http://localhost:20000/api/*`:

#### 1. **Status Endpoint**
- **GET** `/api/status`
- Returns API health status
- Used by the API Status indicator in the header

#### 2. **Chat Endpoints**
- **POST** `/api/chat/send` - Send message to AI coach
- **GET** `/api/chat/messages` - Get chat history
- **POST** `/api/chat/clear` - Clear chat history

#### 3. **Roleplay Endpoints**
- **POST** `/api/roleplay/start` - Start roleplay session
- **POST** `/api/roleplay/respond` - Send response in roleplay
- **POST** `/api/roleplay/end` - End roleplay session

#### 4. **Dashboard Endpoints**
- **GET** `/api/dashboard/insights` - Get daily tips and insights

### Configuration

The `.env` file has been updated to use local mock API:

```bash
VITE_API_BASE_URL=http://localhost:20000
```

---

## 🚀 How to Test

### Step 1: Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:20000`

### Step 2: Open the Application

Navigate to: `http://localhost:20000` or your preview URL: https://yxpzdb7o9z.preview.c24.airoapp.ai

### Step 3: Test Each Feature

#### ✅ Dashboard Page (`/`)

**What to test:**
- Daily tip card displays
- Focus areas show with scores
- Recent activity stats appear
- Suggested exercises load

**Expected behavior:**
- Mock data loads immediately
- No API errors in console
- API Status indicator shows green (connected)

---

#### ✅ Chat Page (`/chat`)

**What to test:**
1. View existing chat history (3 mock messages)
2. Type a message and send it
3. Receive AI coach response (random from 5 mock responses)
4. Clear chat history button

**Expected behavior:**
- Messages appear in chat interface
- AI responses have ~800ms delay (simulated processing)
- Each response is different (randomly selected)
- Clear button resets the chat

**Sample messages to try:**
- "How do I handle objections?"
- "Tell me about DISC profiles"
- "I need help with a difficult HCP"

---

#### ✅ Roleplay Page (`/roleplay`)

**What to test:**
1. Select a scenario from the list
2. Click "Start Roleplay"
3. View HCP profile (Dr. Sarah Mitchell - Cardiologist)
4. Read initial HCP message
5. Type your response
6. Receive HCP reply with live EQ metrics
7. Continue conversation (5-8 exchanges)
8. End roleplay session
9. View feedback summary

**Expected behavior:**
- Roleplay starts with ~500ms delay
- HCP responds with ~1000ms delay (simulated thinking)
- Live EQ metrics update after each exchange:
  - Empathy: 70-100
  - Active Listening: 65-95
  - Adaptability: 60-90
  - Emotional Regulation: 75-100
  - Social Awareness: 70-100
  - Relationship Management: 65-95
- Feedback shows strengths and improvements
- Session summary displays overall score and metrics

**Sample responses to try:**
- "Thank you for your time, Dr. Mitchell. I'd like to share some recent clinical data..."
- "I understand your concern about safety. Let me address that directly..."
- "What specific outcomes are most important for your patients?"

---

## 🔍 Debugging Tips

### Check API Status

Look at the header of the application:
- **Green badge** = API connected
- **Red badge** = API disconnected

### Browser Console

Open Developer Tools (F12) and check the Console tab:
- No errors = Everything working
- CORS errors = Check VITE_API_BASE_URL in .env
- 404 errors = Endpoint might be missing

### Network Tab

Open Developer Tools → Network tab:
- Filter by "Fetch/XHR"
- Watch API calls in real-time
- Check request/response data

### Common Issues

#### Issue: API Status shows "Disconnected"

**Solution:**
1. Verify dev server is running (`npm run dev`)
2. Check `.env` has `VITE_API_BASE_URL=http://localhost:20000`
3. Restart dev server if needed

#### Issue: Chat doesn't respond

**Solution:**
1. Check browser console for errors
2. Verify `/api/chat/send` endpoint exists
3. Check request payload in Network tab

#### Issue: Roleplay won't start

**Solution:**
1. Ensure scenario is selected
2. Check `/api/roleplay/start` endpoint
3. Verify scenarioId is being sent

---

## 📊 Mock Data Details

### Chat Responses (5 variations)

1. "That's a great question! In pharmaceutical sales, building trust with HCPs is crucial..."
2. "I understand your concern. When approaching objections, it's important to listen actively..."
3. "Excellent point! The DISC framework can really help here..."
4. "Let's break this down using the Signal Intelligence™ framework..."
5. "That's a common challenge in life sciences sales. Have you considered using the SPIN selling technique..."

### HCP Roleplay Responses (5 variations)

1. "I see. Can you provide more specific data on the efficacy compared to current standard of care?"
2. "That's interesting, but I'm concerned about the side effect profile. What does the safety data show?"
3. "I appreciate the information. How does this fit into the current treatment guidelines?"
4. "The data looks promising, but what about the cost? Will my patients' insurance cover this?"
5. "I'd need to see more long-term data before I feel comfortable prescribing this to my patients."

### EQ Metrics (Random ranges)

- **Empathy**: 70-100
- **Active Listening**: 65-95
- **Adaptability**: 60-90
- **Emotional Regulation**: 75-100
- **Social Awareness**: 70-100
- **Relationship Management**: 65-95

---

## 🔄 Switching to Real Cloudflare Worker

When you're ready to use your actual Cloudflare Worker:

### Step 1: Update `.env`

```bash
# Comment out mock API
# VITE_API_BASE_URL=http://localhost:5173

# Uncomment and add your worker URL
VITE_API_BASE_URL=https://your-worker.your-subdomain.workers.dev
```

### Step 2: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
# Start again
npm run dev
```

### Step 3: Test Connection

- Check API Status indicator (should be green)
- Test chat functionality
- Test roleplay functionality

---

## ✅ Testing Checklist

### Initial Setup
- [ ] Dev server is running (`npm run dev`)
- [ ] `.env` has `VITE_API_BASE_URL=http://localhost:20000`
- [ ] Browser is open to `http://localhost:20000` or preview URL
- [ ] API Status indicator shows green

### Dashboard Page
- [ ] Daily tip displays
- [ ] Focus areas show with scores
- [ ] Recent activity stats appear
- [ ] Suggested exercises load
- [ ] No console errors

### Chat Page
- [ ] Chat history loads (3 messages)
- [ ] Can send new message
- [ ] AI responds within ~1 second
- [ ] Response is relevant
- [ ] Clear button works

### Roleplay Page
- [ ] Can select scenario
- [ ] Roleplay starts successfully
- [ ] HCP profile displays
- [ ] Initial message appears
- [ ] Can send response
- [ ] HCP replies with delay
- [ ] EQ metrics update live
- [ ] Can end session
- [ ] Feedback summary displays

---

## 🎉 Success!

You now have a fully functional ReflectivAI application with mock API endpoints. You can:

✅ Test all features immediately
✅ See how the app works without a Cloudflare Worker
✅ Develop and iterate on the frontend
✅ Switch to real Cloudflare Worker when ready

---

## 📞 Next Steps

1. **Test the application** using this guide
2. **Report any issues** you find
3. **When ready**, set up your Cloudflare Worker using `CLOUDFLARE_WORKER_SETUP.md`
4. **Switch to real API** by updating `.env`

Happy testing! 🚀
