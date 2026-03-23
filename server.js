require('dotenv').config();
const express = require('express');
const multer  = require('multer');
const fetch   = require('node-fetch');
const path    = require('path');

const app    = express();
const upload = multer({ limits: { fileSize: 20 * 1024 * 1024 } });

app.use(express.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname, 'public')));

/* ── ANALYZE endpoint ── */
app.post('/api/analyze', async (req, res) => {
  const { imageBase64, imageMime, symbol, timeframe } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'No image provided' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set in .env file' });
  }

  const systemPrompt = `You are an elite price action trader and technical analyst with 20+ years of professional trading experience. You specialize in reading raw price structure without relying on lagging indicators.

ANALYSIS FRAMEWORK — apply all of these to the chart:

1. MARKET STRUCTURE
   - Identify trend: Uptrend (HH+HL), Downtrend (LH+LL), or Ranging
   - Detect Break of Structure (BOS) or Change of Character (CHoCH)
   - Note if price is in expansion, retracement, or consolidation phase

2. KEY LEVELS
   - Major support and resistance zones (previous swing highs/lows)
   - Order blocks: last bearish candle before a bullish impulse (demand), last bullish candle before a bearish impulse (supply)
   - Fair Value Gaps (FVG/imbalances): 3-candle gaps where middle candle left a gap
   - Round numbers / psychological levels if visible

3. CANDLESTICK PATTERNS — identify any present:
   - Reversal: Pin Bar, Engulfing (bullish/bearish), Doji, Hammer, Shooting Star, Morning/Evening Star, Tweezer Top/Bottom
   - Continuation: Inside Bar, Marubozu, Three White Soldiers / Three Black Crows
   - Note the pattern quality: strong wick rejection, large body, or small indecision

4. MOMENTUM & VOLUME (if indicators are visible on chart)
   - RSI: overbought (>70), oversold (<30), divergence
   - MACD: crossover, histogram direction, divergence
   - Volume: confirming or diverging from price move
   - Moving averages: price position relative to MAs, MA crossovers

5. CONFLUENCE SCORING — only give BUY/SELL when 3+ factors align:
   - Trend alignment = +1
   - Key level confluence = +1
   - Candlestick confirmation = +1
   - Momentum confirmation = +1
   - Volume confirmation = +1
   - Use HOLD if 1-2 factors align; use WAIT if price is mid-range with no clear setup

6. ENTRY, STOP LOSS, TAKE PROFIT LOGIC
   - Entry: on confirmed candle close, or at retest of key level
   - Stop Loss: beyond the nearest swing point or order block (not arbitrary)
   - TP1: next key level or 1:1.5 minimum R:R
   - Never place SL inside a key zone

CONFIDENCE RULES:
   - 85-95%: 4-5 confluences, clear structure, strong candle signal
   - 70-84%: 3 confluences, good structure
   - 55-69%: 2 confluences, some ambiguity
   - 40-54%: 1 confluence or conflicting signals — use HOLD/WAIT

Return ONLY a raw JSON object — no markdown fences, no preamble.

Required JSON:
{
  "verdict": "BUY" or "SELL" or "HOLD" or "WAIT",
  "confidence": <integer 40-95>,
  "summary": "<2-3 sentence plain English signal explanation including the primary reason for the signal>",
  "entry": "<specific price level or zone, e.g. '42,150 – 42,200 zone'>",
  "sl": "<specific price level with reasoning, e.g. 'Below 41,800 swing low'>",
  "tp1": "<specific price level, e.g. '43,500 resistance zone'>",
  "rr": "<e.g. 1:2.5>",
  "rrLabel": "<Excellent (>1:3) | Favorable (1:2-3) | Acceptable (1:1.5-2) | Poor (<1:1.5)>",
  "marketStructure": "<Uptrend | Downtrend | Ranging | Transition>",
  "keyLevel": "<describe the most important level price is interacting with>",
  "factors": [
    {"name":"Trend","score":<0-100>},
    {"name":"Volume","score":<0-100>},
    {"name":"Momentum","score":<0-100>},
    {"name":"Structure","score":<0-100>},
    {"name":"Price Action","score":<0-100>}
  ],
  "patterns": [{"name":"<pattern name>","type":"bull" or "bear" or "neutral"}],
  "fullAnalysis": "<3-5 sentences: describe market structure, the key level being tested, confluence factors present, the specific entry trigger, and what would invalidate the trade>"
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: imageMime || 'image/png', data: imageBase64 }
            },
            {
              type: 'text',
              text: `Analyze this ${timeframe || '1H'} timeframe chart for ${symbol || 'this asset'}. Apply the full price action framework: identify market structure, key levels, candlestick patterns, and confluences. Only give a BUY or SELL if 3+ factors align. Provide specific entry, SL, and TP levels with rationale.`
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || `API error ${response.status}` });
    }

    const data = await response.json();
    const raw  = (data.content || []).map(c => c.text || '').join('').trim();

    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/^```json\s*/,'').replace(/^```\s*/,'').replace(/```\s*$/,'').trim());
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
      else throw new Error('Could not parse AI response as JSON');
    }

    res.json(parsed);

  } catch (err) {
    console.error('Analyze error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

/* ── Catch-all → serve index.html ── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  NexTrade AI running at http://localhost:${PORT}\n`);
});
