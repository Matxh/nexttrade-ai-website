# NexTrade AI — Chart Analyzer Website

Upload any trading chart screenshot → get an instant AI signal with entry, SL, TP, patterns, and full analysis.

## Quick Start (5 minutes)

### 1. Install Node.js
Download from https://nodejs.org (LTS version)

### 2. Get your Anthropic API key
Sign up at https://console.anthropic.com and create an API key.

### 3. Set up the project
```bash
# Install dependencies
npm install

# Copy the env file and add your API key
cp .env.example .env
# Open .env and replace: ANTHROPIC_API_KEY=your_actual_key_here
```

### 4. Run the server
```bash
npm start
```

Open your browser at **http://localhost:3000**

---

## How it works

1. User uploads a chart screenshot (drag/drop, browse, or Ctrl+V paste)
2. Browser sends the image to `/api/analyze` on YOUR server
3. Your server (with your API key) calls Anthropic securely
4. AI analyzes the chart and returns BUY/SELL/HOLD signal
5. Results display instantly in the UI

The API key stays on your server — it's never exposed to the browser.

---

## Deploy to the internet (free)

### Option A — Railway.app (easiest)
1. Push this folder to a GitHub repo
2. Go to railway.app → New Project → Deploy from GitHub
3. Add environment variable: `ANTHROPIC_API_KEY=your_key`
4. Done — Railway gives you a live URL

### Option B — Render.com
1. Push to GitHub
2. render.com → New Web Service → connect repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Add env var: `ANTHROPIC_API_KEY=your_key`

### Option C — VPS (DigitalOcean, Linode, etc.)
```bash
git clone your-repo
cd nexttrade-ai
npm install
cp .env.example .env && nano .env   # add your key
npm install -g pm2
pm2 start server.js --name nexttrade
pm2 startup && pm2 save
```

---

## Pages
- **/** — Landing page with features
- **/analyzer** (via nav) — The chart upload & analysis tool  
- **/how-it-works** (via nav) — Explanation page

## Tech stack
- **Frontend**: Vanilla HTML/CSS/JS (no build step needed)
- **Backend**: Node.js + Express
- **AI**: Claude Sonnet via Anthropic API (vision)
- **Fonts**: IBM Plex Mono + Barlow via Google Fonts

---

⚠️ **Disclaimer**: For educational use only. Not financial advice.
