# -*- coding: utf-8 -*-
import base64, os
A='/tmp'
def b64(name):
    with open(os.path.join(A,f'pdf_{name}.png'),'rb') as f:
        return 'data:image/png;base64,'+base64.b64encode(f.read()).decode()
IMG={k:b64(k) for k in ['header','cockpit','intent','modal','market','safety']}

CSS="""
@page{size:A4;margin:0;}
*{box-sizing:border-box;margin:0;padding:0;}
html,body{background:#ffffff;color:#33333f;
  font-family:-apple-system,'Helvetica Neue','Segoe UI',Arial,sans-serif;
  -webkit-print-color-adjust:exact;print-color-adjust:exact;font-size:11px;}
.page{width:210mm;min-height:297mm;padding:20mm 18mm 18mm;page-break-after:always;position:relative;background:#ffffff;}
.page:last-child{page-break-after:auto;}
.rhead{position:absolute;top:9mm;left:18mm;right:18mm;display:flex;justify-content:space-between;align-items:center;
  font:700 8.5px ui-monospace,Menlo,monospace;letter-spacing:.06em;color:#9a9aa8;text-transform:uppercase;border-bottom:1px solid #ececf1;padding-bottom:5px;}
.rhead b{color:#e07b10;}
.foot{position:absolute;bottom:10mm;left:18mm;right:18mm;display:flex;justify-content:space-between;
  font:600 8.5px ui-monospace,Menlo,monospace;color:#a6a6b2;border-top:1px solid #ececf1;padding-top:6px;}
.secnum{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:7px;background:#f7931a;color:#fff;font:800 13px ui-monospace,Menlo,monospace;margin-right:10px;vertical-align:middle;}
h2{font-size:19px;font-weight:800;color:#1a1a25;letter-spacing:-.2px;display:flex;align-items:center;margin-bottom:3px;}
h3{font-size:13px;font-weight:800;color:#c2410c;margin:14px 0 4px;}
p{font-size:11px;line-height:1.6;color:#41414f;margin:6px 0;}
b,strong{color:#1a1a25;}
.lead{font-size:12.5px;line-height:1.55;color:#2b2b38;}
.orange{color:#c2410c;font-weight:700;}.purple{color:#6d28d9;font-weight:700;}.green{color:#1a8a4a;font-weight:700;}.red{color:#c33;font-weight:700;}
img.shot{width:100%;border:1px solid #d9d9e2;border-radius:7px;margin:9px 0 4px;display:block;box-shadow:0 4px 14px rgba(20,20,40,.08);}
.cap{font:italic 600 9px Georgia,serif;color:#9a9aa8;margin-bottom:8px;}
table{width:100%;border-collapse:collapse;margin:7px 0 10px;font-size:10.3px;}
th{background:#f5f5f8;color:#55556a;text-align:left;font:800 8.5px ui-monospace,Menlo,monospace;letter-spacing:.05em;text-transform:uppercase;padding:7px 9px;border:1px solid #e6e6ee;}
td{padding:7px 9px;border:1px solid #ededf3;vertical-align:top;line-height:1.45;color:#41414f;}
td.k{font:700 10.3px ui-monospace,Menlo,monospace;color:#1a1a25;white-space:nowrap;width:138px;background:#fbfbfd;}
td.k.btn{color:#6d28d9;}
.pill{display:inline-block;font:700 9px ui-monospace,Menlo,monospace;color:#1a8a4a;background:#eafaf0;border:1px solid #bfe8cf;border-radius:5px;padding:2px 8px;margin:3px 4px 3px 0;}
.note{background:#fff6ec;border:1px solid #f6d3a6;border-radius:8px;padding:10px 13px;font-size:10.5px;line-height:1.55;color:#7a4a10;margin:9px 0;}
.note b{color:#9a3412;}
ol{margin:6px 0 8px 0;list-style:none;counter-reset:s;}
ol li{font-size:10.8px;line-height:1.55;color:#41414f;padding-left:25px;position:relative;margin:5px 0;}
ol li::before{counter-increment:s;content:counter(s);position:absolute;left:0;top:0;width:17px;height:17px;background:#6d28d9;color:#fff;border-radius:5px;font:800 9.5px ui-monospace,Menlo,monospace;text-align:center;line-height:17px;}
.split{display:flex;gap:15px;align-items:flex-start;}
.cover-band{height:5px;background:linear-gradient(90deg,#f7931a,#6d28d9);border-radius:3px;width:90px;margin-bottom:18px;}
.kbd{font:700 9.5px ui-monospace,Menlo,monospace;background:#f0f0f5;border:1px solid #dadae4;border-radius:4px;padding:1px 6px;color:#33333f;}
"""

def head(sec): return f'<div class="rhead"><span>Agent <b>$DOG</b> · Dashboard Guide</span><span>{sec}</span></div>'
def foot(n): return f'<div class="foot"><span>Kraken Agent Zero · DOGUSD · Paper-first · Read-only</span><span>{n}</span></div>'

HTML=f"""<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>

<!-- COVER -->
<div class="page" style="padding-top:32mm">
  <div class="cover-band"></div>
  <p class="mono" style="font:800 10px ui-monospace,Menlo,monospace;letter-spacing:.22em;color:#9a9aa8;text-transform:uppercase">Dashboard User Guide · v1.0</p>
  <h1 style="font-size:40px;font-weight:800;color:#1a1a25;letter-spacing:-1px;margin-top:8px">Agent <span style="color:#c2410c">$DOG</span></h1>
  <p style="font-size:15px;color:#55556a;margin-top:2px;font-weight:600">A safety-first AI trading agent for $DOG on Kraken · DOGUSD (Bitcoin Runes)</p>
  <img class="shot" src="{IMG['header']}" style="margin-top:22px;box-shadow:0 8px 26px rgba(20,20,40,.12)">
  <p class="lead" style="margin-top:18px;max-width:160mm">This guide explains <b>every screen, module, button and control</b> of the Agent DOG dashboard — what each one is, what it does, and why it matters. The agent reads the market and prepares a plan; <b class="orange">you always make the final decision.</b></p>
  <div class="note" style="margin-top:16px">“We don't optimize for profit. We optimize for not losing your sats.” — Agent DOG runs read-only and paper-first; it never places a live order on your behalf.</div>
  <table style="margin-top:14px">
    <tr><th>Section</th><th>What you'll learn</th></tr>
    <tr><td class="k">1 · Overview</td><td>The safety model and the six-role “Pack”.</td></tr>
    <tr><td class="k">2 · Header &amp; controls</td><td>Every status badge, the refresh/auto controls, and the side navigation.</td></tr>
    <tr><td class="k">3 · Intent &amp; Trade Plan</td><td>The decision, the Preview-trade flow, and how to place it on Kraken.</td></tr>
    <tr><td class="k">4 · Live Cockpit</td><td>Pack Index, Decision Engine, Market Data, Portfolio, Risk, Timeline.</td></tr>
    <tr><td class="k">5 · Intelligence &amp; Sage</td><td>Market context modules and the Sage co-pilot.</td></tr>
    <tr><td class="k">6 · Layout &amp; Safety</td><td>Customising the dashboard and the rules enforced in code.</td></tr>
  </table>
  <div class="foot"><span>Kraken Agent Zero Submission</span><span>Cover</span></div>
</div>

<!-- 1 OVERVIEW -->
<div class="page">
  {head('1 · Overview')}
  <h2><span class="secnum">1</span>Overview &amp; the safety model</h2>
  <p class="lead">Agent DOG is a <b>read-only co-pilot</b> for trading $DOG (DOGUSD) on Kraken. It works continuously to read the market and produce a <b>deterministic</b> decision — the same data always yields the same call — and then prepares a ready-to-place trade plan. It does not, and cannot, execute orders itself.</p>
  <h3>Why safety-first</h3>
  <p>Most bots optimise for returns and trade autonomously — the fastest way to wipe a retail account. Agent DOG inverts that: it does the analysis, but every action stops at a <b>human gate</b>. The worst outcome for a Kraken user isn't a missed trade; it's an agent that loses their money unattended.</p>
  <h3>The Pack — six roles, one rule</h3>
  <table>
    <tr><th>Role</th><th>Responsibility</th></tr>
    <tr><td class="k">🔎 Beacon</td><td>Reads the live DOGUSD market from Kraken — price, bid/ask, spread, range, volatility, volume.</td></tr>
    <tr><td class="k">🧭 Compass</td><td>Computes the deterministic decision (WATCH_BUY / HOLD / NO_TRADE) and a confidence score.</td></tr>
    <tr><td class="k">⚓ Anchor</td><td>The safety gate — enforces paper-only and human confirmation; blocks all autonomous execution.</td></tr>
    <tr><td class="k">🚢 Helm</td><td>Stages the command for review. Nothing is sent without an explicit human action.</td></tr>
    <tr><td class="k">🦉 Sage</td><td>The on-dashboard AI co-pilot — explains every score, factor and decision in plain language.</td></tr>
    <tr><td class="k">👤 You</td><td>The final gate. You read, you decide, you place the order on Kraken yourself.</td></tr>
  </table>
  <div class="note"><b>Deterministic, by design.</b> Every decision can be traced back to its inputs. There is no hidden model state and no surprise — the dashboard always shows you the exact factors behind a call.</div>
  <h3>The three decisions</h3>
  <table>
    <tr><th>Call</th><th>Meaning · what you do</th></tr>
    <tr><td class="k">WATCH_BUY</td><td>Conditions look interesting but confidence is still below 70%. <b>Watch — don't buy yet.</b></td></tr>
    <tr><td class="k">HOLD</td><td>Stay with your current position. No new action needed.</td></tr>
    <tr><td class="k">NO_TRADE</td><td>Poor or too-volatile conditions. <b>Stay out</b> and protect capital.</td></tr>
  </table>
  <h3>Read the dashboard in 30 seconds</h3>
  <ol>
    <li>Glance at the <b>Pack Index</b> (0–100) and the <b>Decision Engine</b> call.</li>
    <li>Read <b>Current Intent</b> — the “Why?” factors show the exact reasoning.</li>
    <li>To act, press <b>Preview trade</b> for a full plan (entry, stop-loss, take-profit).</li>
    <li>Place it yourself on Kraken — the agent never trades for you.</li>
  </ol>
  {foot('1')}
</div>

<!-- 2 HEADER & CONTROLS -->
<div class="page">
  {head('2 · Header &amp; controls')}
  <h2><span class="secnum">2</span>Header &amp; top controls</h2>
  <p>The top bar shows live status and the global controls. Left rail = navigation.</p>
  <img class="shot" src="{IMG['header']}">
  <div class="cap">Figure 1 — The header: brand, status badges, refresh controls and mode badges.</div>
  <table>
    <tr><th>Control</th><th>What it is / what it does</th></tr>
    <tr><td class="k">● Pack Active</td><td>Live status light — the agent is running and reading the market.</td></tr>
    <tr><td class="k">UTC clock</td><td>Current UTC time, so every reading has an unambiguous timestamp.</td></tr>
    <tr><td class="k btn">⟳ Refresh Now</td><td><b>Button</b> — forces an immediate refresh of all market data and the decision.</td></tr>
    <tr><td class="k btn">Auto: ON</td><td><b>Toggle</b> — turns automatic refresh on/off (data otherwise updates every few seconds).</td></tr>
    <tr><td class="k">Cycles</td><td>How many refresh cycles have run this session — proof the agent is working live.</td></tr>
    <tr><td class="k">Last</td><td>The previous decision and its confidence, for quick comparison.</td></tr>
    <tr><td class="k">Regime</td><td>Market regime — TRENDING, RANGE or VOLATILE — derived from volatility &amp; momentum.</td></tr>
    <tr><td class="k">✓ Kraken CLI</td><td>Badge — confirms data comes from the official Kraken CLI / feed.</td></tr>
    <tr><td class="k">🔒 Read-Only Mode</td><td>Badge — the dashboard cannot place orders. Always on.</td></tr>
    <tr><td class="k">DOGUSD</td><td>Badge — the single pair the agent trades ($DOG Runes, not Dogecoin).</td></tr>
    <tr><td class="k btn">✏️ Edit layout</td><td><b>Button</b> — enter customisation mode (drag, hide, reset). See section 6.</td></tr>
  </table>
  <h3>Left navigation rail</h3>
  <p>The six icons on the far left jump you to each part of the dashboard with a smooth scroll: <b>Intent → Cockpit → Market → Track Record → Sage → Safety</b>. The active section is highlighted as you scroll.</p>
  {foot('2')}
</div>

<!-- 3 INTENT & TRADE PLAN -->
<div class="page">
  {head('3 · Intent &amp; Trade Plan')}
  <h2><span class="secnum">3</span>Current Intent &amp; the Trade Plan</h2>
  <img class="shot" src="{IMG['intent']}">
  <div class="cap">Figure 2 — Current Intent, the deterministic factors, and the two action buttons.</div>
  <table>
    <tr><th>Element</th><th>What it is / what it does</th></tr>
    <tr><td class="k">Current Intent</td><td>The agent's current stance — e.g. “HOLD DOG — no autonomous execution”.</td></tr>
    <tr><td class="k">Why? factors</td><td>The exact deterministic inputs: <b>confidence</b> vs the 70% threshold, <b>risk</b> score, <b>momentum</b>, <b>volatility</b>.</td></tr>
    <tr><td class="k btn">⚓ Preview trade</td><td><b>Button</b> — opens the Trade Plan (entry, stop-loss, take-profit). Computes only; never executes.</td></tr>
    <tr><td class="k btn">Trade on Kraken ↗</td><td><b>Button</b> — opens the DOGUSD page on Kraken Pro so you can place the order yourself.</td></tr>
  </table>
  <div class="split">
    <div style="flex:1.02">
      <h3>The Trade Plan window</h3>
      <table>
        <tr><th>Control</th><th>Function</th></tr>
        <tr><td class="k btn">BUY / SELL</td><td>Choose the direction; the plan recomputes for that side.</td></tr>
        <tr><td class="k btn">Your capital</td><td>Input your account size; position size = <b>5%</b> of it.</td></tr>
        <tr><td class="k">Entry / SL / TP</td><td>Computed entry, stop-loss (volatility-based) and take-profit (R:R 1.5).</td></tr>
        <tr><td class="k btn">⧉ (per value)</td><td>Copies that exact number, ready to paste into the matching Kraken field.</td></tr>
        <tr><td class="k btn">📋 Copy plan</td><td>Copies the whole plan as text.</td></tr>
        <tr><td class="k btn">Open on Kraken ↗</td><td>Opens Kraken Pro to place the bracket order.</td></tr>
      </table>
    </div>
    <div style="flex:.98"><img class="shot" src="{IMG['modal']}" style="margin-top:0"></div>
  </div>
  <h3>Placing the trade — 4 steps</h3>
  <ol>
    <li>Tap <span class="kbd">⧉</span> on <b>Entry</b> → paste into Kraken's <b>Limit price</b></li>
    <li>Tap <span class="kbd">⧉</span> on <b>Quantity</b> → paste into <b>Volume</b></li>
    <li>Add the <b class="red">Stop-loss</b> and <b class="green">Take-profit</b> (bracket order)</li>
    <li>Review and press <b>Buy / Sell</b> on Kraken yourself</li>
  </ol>
  {foot('3')}
</div>

<!-- 4 COCKPIT -->
<div class="page">
  {head('4 · Live Cockpit')}
  <h2><span class="secnum">4</span>The Live Cockpit</h2>
  <img class="shot" src="{IMG['cockpit']}">
  <div class="cap">Figure 3 — The Live Cockpit: six modules, refreshed live from Kraken.</div>
  <table>
    <tr><th>Module</th><th>What it shows / how to read it</th></tr>
    <tr><td class="k">🐕 Pack Index</td><td>A 0–100 health score from four bars — <b>Liquidity</b> (ease of entry/exit), <b>Momentum</b> (trend strength), <b>Risk</b> (higher = safer), <b>Readiness</b> (setup quality).</td></tr>
    <tr><td class="k">🧠 Decision Engine</td><td>The deterministic call with a <b>confidence ring</b>. The agent leans bullish only above the 70% confidence threshold.</td></tr>
    <tr><td class="k">📊 Market Data</td><td>Live bid / ask, the <b>spread</b> (tighter = cheaper), 24h high/low, <b>VWAP</b> (fair price), volume and trade count.</td></tr>
    <tr><td class="k">💼 Paper Portfolio</td><td>A simulated account: current value, starting balance, <b>unrealised PnL (fees included)</b>, trades and open orders.</td></tr>
    <tr><td class="k">⚠️ Risk Analysis</td><td>Risk level, 24h volatility, spread and the 24h price range — the safety read at a glance.</td></tr>
    <tr><td class="k">📋 Agent Timeline</td><td><b>Pack Consensus (2/3)</b> and the live status of Beacon · Compass · Anchor · Helm · Sage.</td></tr>
  </table>
  <div class="note">The Decision Engine never overrides itself: it is computed from the same inputs every cycle. If a number looks surprising, the Why factors (section 3) and Sage (section 5) explain it.</div>
  {foot('4')}
</div>

<!-- 5 INTELLIGENCE & SAGE -->
<div class="page">
  {head('5 · Intelligence &amp; Sage')}
  <h2><span class="secnum">5</span>Market Intelligence &amp; Ask Sage</h2>
  <p>Read-only context that backs every decision — none of it can place an order.</p>
  <img class="shot" src="{IMG['market']}">
  <div class="cap">Figure 4 — Market Intelligence modules.</div>
  <table>
    <tr><th>Module</th><th>What it shows</th></tr>
    <tr><td class="k">⚡ BTC Network</td><td>Bitcoin fees, mempool and recent blocks — DOG is a Bitcoin Rune, so BTC conditions matter.</td></tr>
    <tr><td class="k">🐕 Live Trades</td><td>The real-time DOGUSD trade tape — buys and sells as they happen on Kraken.</td></tr>
    <tr><td class="k">📊 Market Pulse</td><td><b>RSI</b> (overbought/oversold), <b>EMA 9/21</b> (short trend), <b>VWAP</b>, and a volume impulse.</td></tr>
    <tr><td class="k">🕒 Multi-Timeframe</td><td>The 15m / 1h / 4h trend together. Informational — it never changes the deterministic call.</td></tr>
    <tr><td class="k">📈 Perpetual</td><td>PF_DOGUSD mark price, <b>funding rate</b> and open interest. Read-only, no orders ever.</td></tr>
  </table>
  <h3>Ask Sage — the AI co-pilot</h3>
  <table>
    <tr><th>Control</th><th>Function</th></tr>
    <tr><td class="k btn">FAQ buttons</td><td>One-tap answers: “What is Pack Index?”, “Why HOLD now?”, “What's RSI/EMA/VWAP?”, “Is Agent DOG safe?”, “What is $DOG?”…</td></tr>
    <tr><td class="k btn">Ask anything</td><td>A free-text box — Sage answers using the <b>live dashboard data</b>. It explains and advises; it <b>never executes</b>.</td></tr>
  </table>
  {foot('5')}
</div>

<!-- 6 LAYOUT & SAFETY -->
<div class="page">
  {head('6 · Layout &amp; Safety')}
  <h2><span class="secnum">6</span>Customise the layout &amp; Safety rules</h2>
  <h3>Edit layout — make it yours</h3>
  <p>Press <span class="kbd">✏️ Edit layout</span> in the header to enter edit mode. Your changes are saved automatically in the browser.</p>
  <table>
    <tr><th>Action</th><th>How</th></tr>
    <tr><td class="k btn">Reorder</td><td>Drag any card to a new position within its row.</td></tr>
    <tr><td class="k btn">Hide</td><td>Click the <b>✕</b> on a card to hide it; it moves to the tray.</td></tr>
    <tr><td class="k btn">Restore</td><td>Click a chip in the tray to bring a hidden card back.</td></tr>
    <tr><td class="k btn">↺ Reset</td><td>Restore the original default layout in one click.</td></tr>
  </table>
  <h3>Safety — enforced in code</h3>
  <img class="shot" src="{IMG['safety']}">
  <div class="cap">Figure 5 — Pack Safety Rules.</div>
  <table>
    <tr><th>Rule</th><th>Why it matters</th></tr>
    <tr><td class="k">Max 5% / trade</td><td>Caps the damage any single position can do.</td></tr>
    <tr><td class="k">Volatility cut-off</td><td>Above 15% volatility the agent flips to RISK_OFF.</td></tr>
    <tr><td class="k">DOGUSD only</td><td>One pair — no scope-creep into untested assets.</td></tr>
    <tr><td class="k">Human --confirm</td><td>No order is sent without an explicit human action.</td></tr>
    <tr><td class="k">Read-only UI</td><td>The dashboard physically cannot place an order.</td></tr>
    <tr><td class="k">No API key</td><td>It never asks for your secret keys, so it can never move funds.</td></tr>
  </table>
  <div class="note"><b>What Agent DOG will never do:</b> enable live trading · auto-execute a trade · place an order from the dashboard · ask for your secret API keys · override its own deterministic decision.</div>
  <p style="text-align:center;margin-top:14px;font:800 13px ui-monospace,Menlo,monospace;color:#c2410c">Agent $DOG — the agent that protects your sats.</p>
  {foot('6')}
</div>

</body></html>"""
with open(os.path.join(A,'agent_dog_guide.html'),'w',encoding='utf-8') as f:
    f.write(HTML)
print('HTML written:',len(HTML)//1024,'KB · white theme · 7 pages')
