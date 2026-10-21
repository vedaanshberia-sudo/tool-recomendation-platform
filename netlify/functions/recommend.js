// ============================================================
// ToolWise BACKEND  (Netlify Function)  ->  /api/recommend
// NOTE: JavaScript comments use "//" (the "#" symbol is for Python).
// Netlify Functions run JavaScript, so "//" is the right symbol here.
// ============================================================

// ---------- 1. CATEGORIES (shown in the dropdown) ----------
const CATEGORIES = {
  research: "Research", writing: "Writing & Docs", design: "Design & Image Editing",
  video: "Video Editing", coding: "Coding", productivity: "Notes & Productivity",
  projects: "Project Management", learning: "Learning", pdf: "PDF Tools",
  website: "Website Building",
};

// ---------- 2. TOOL DATABASE ----------
// quality/ease/power/freeScore are 1-10 ratings (freeScore 0 = no free plan).
// paid.monthly / paid.annual are APPROXIMATE INR prices. annual = total per YEAR.
// null means that billing option does not exist.
// field: "AI" for AI tools, "General" for normal (non-AI) tools.
// !! These are SAMPLE numbers. Verify on each official site before launch !!
const TOOLS = [
  { id: "scholar", name: "Google Scholar", url: "https://scholar.google.com", cats: ["research"], field: "General", quality: 8, ease: 8, power: 6, freeScore: 9, freeNote: "Completely free search of papers and citations.", paid: null, bestFor: "Finding academic papers fast", offers: [] },
  { id: "zotero", name: "Zotero", url: "https://www.zotero.org", cats: ["research", "writing"], field: "General", quality: 8, ease: 6, power: 8, freeScore: 8, freeNote: "Free app with 300 MB cloud sync.", paid: { plan: "Storage 2 GB", monthly: null, annual: 1000 }, bestFor: "Organising sources and citations", offers: ["Open source, so the free app has no time limit."] },
  { id: "perplexity", name: "Perplexity", url: "https://www.perplexity.ai", cats: ["research"], field: "AI", quality: 9, ease: 9, power: 8, freeScore: 6, freeNote: "Free searches, limited advanced ones per day.", paid: { plan: "Pro", monthly: 1700, annual: 17000 }, bestFor: "Quick answers with sources", offers: ["Student and telecom/partner promos appear from time to time."] },
  { id: "chatgpt", name: "ChatGPT", url: "https://chatgpt.com", cats: ["research", "writing", "coding"], field: "AI", quality: 9, ease: 10, power: 9, freeScore: 7, freeNote: "Free tier with message limits.", paid: { plan: "Plus", monthly: 1999, annual: null }, bestFor: "General help: writing, research, ideas", offers: ["No annual plan, so pay monthly and cancel any time."] },
  { id: "notion", name: "Notion", url: "https://www.notion.so", cats: ["productivity", "projects", "writing"], field: "General", quality: 9, ease: 7, power: 8, freeScore: 8, freeNote: "Free for individuals with generous limits.", paid: { plan: "Plus", monthly: 1000, annual: 8500 }, bestFor: "Notes, wikis and planning in one place", offers: ["Students and educators can get a free upgraded plan with a school email."] },
  { id: "trello", name: "Trello", url: "https://trello.com", cats: ["projects", "productivity"], field: "General", quality: 8, ease: 9, power: 6, freeScore: 7, freeNote: "Free for small teams with limited boards.", paid: { plan: "Standard", monthly: 510, annual: 4300 }, bestFor: "Simple kanban task boards", offers: [] },
  { id: "canva", name: "Canva", url: "https://www.canva.com", cats: ["design"], field: "General", quality: 9, ease: 10, power: 7, freeScore: 8, freeNote: "Large free library of templates.", paid: { plan: "Pro", monthly: 499, annual: 3999 }, bestFor: "Posters, social posts, quick designs", offers: ["Free Pro for verified students/teachers and nonprofits.", "Free 30-day Pro trial is often available."] },
  { id: "gimp", name: "GIMP", url: "https://www.gimp.org", cats: ["design"], field: "General", quality: 8, ease: 4, power: 9, freeScore: 10, freeNote: "Free forever, full photo editor.", paid: null, bestFor: "Advanced photo editing at zero cost", offers: [] },
  { id: "capcut", name: "CapCut", url: "https://www.capcut.com", cats: ["video"], field: "General", quality: 8, ease: 9, power: 6, freeScore: 8, freeNote: "Free editing; some effects are Pro-only.", paid: { plan: "Pro", monthly: 800, annual: 6500 }, bestFor: "Fast short-video editing", offers: ["Discounted first-month or first-year deals are common."] },
  { id: "davinci", name: "DaVinci Resolve", url: "https://www.blackmagicdesign.com/products/davinciresolve", cats: ["video"], field: "General", quality: 10, ease: 4, power: 10, freeScore: 10, freeNote: "Professional-grade editor, free version.", paid: null, bestFor: "Professional editing and colour grading", offers: ["The paid Studio version is a one-time purchase, not a subscription."] },
  { id: "grammarly", name: "Grammarly", url: "https://www.grammarly.com", cats: ["writing"], field: "AI", quality: 8, ease: 10, power: 6, freeScore: 7, freeNote: "Free spelling and basic grammar checks.", paid: { plan: "Premium", monthly: 1000, annual: 7500 }, bestFor: "Fixing grammar and tone", offers: ["Sales of 40-50% off annual plans appear several times a year."] },
  { id: "libreoffice", name: "LibreOffice", url: "https://www.libreoffice.org", cats: ["writing", "productivity"], field: "General", quality: 7, ease: 7, power: 7, freeScore: 10, freeNote: "Free Word/Excel/PowerPoint alternative.", paid: null, bestFor: "Offline documents at zero cost", offers: [] },
  { id: "vscode", name: "VS Code", url: "https://code.visualstudio.com", cats: ["coding"], field: "General", quality: 10, ease: 7, power: 9, freeScore: 10, freeNote: "Free code editor with thousands of extensions.", paid: null, bestFor: "Writing code in any language", offers: [] },
  { id: "copilot", name: "GitHub Copilot", url: "https://github.com/features/copilot", cats: ["coding"], field: "AI", quality: 9, ease: 8, power: 9, freeScore: 5, freeNote: "Free plan with limited completions.", paid: { plan: "Pro", monthly: 850, annual: 8500 }, bestFor: "AI code suggestions inside your editor", offers: ["Free for verified students, teachers and popular open-source maintainers."] },
  { id: "khan", name: "Khan Academy", url: "https://www.khanacademy.org", cats: ["learning"], field: "General", quality: 9, ease: 9, power: 5, freeScore: 10, freeNote: "All courses free, nonprofit.", paid: null, bestFor: "School and fundamentals learning", offers: [] },
  { id: "coursera", name: "Coursera", url: "https://www.coursera.org", cats: ["learning"], field: "General", quality: 8, ease: 8, power: 6, freeScore: 6, freeNote: "Audit many courses free (no certificate).", paid: { plan: "Plus", monthly: 5000, annual: 33900 }, bestFor: "Career courses with certificates", offers: ["Financial aid can make courses free.", "7-day free trial is often offered."] },
  { id: "ilovepdf", name: "iLovePDF", url: "https://www.ilovepdf.com", cats: ["pdf"], field: "General", quality: 8, ease: 9, power: 6, freeScore: 7, freeNote: "Free merge/split/compress with size limits.", paid: { plan: "Premium", monthly: 600, annual: 4500 }, bestFor: "Everyday PDF jobs", offers: [] },
  { id: "smallpdf", name: "Smallpdf", url: "https://smallpdf.com", cats: ["pdf"], field: "General", quality: 7, ease: 10, power: 5, freeScore: 5, freeNote: "Free but only a few tasks per day.", paid: { plan: "Pro", monthly: 1000, annual: 5500 }, bestFor: "Very simple PDF edits", offers: ["7-day free trial is usually available."] },
  { id: "wix", name: "Wix", url: "https://www.wix.com", cats: ["website"], field: "General", quality: 8, ease: 9, power: 6, freeScore: 6, freeNote: "Free site with Wix ads and a Wix address.", paid: { plan: "Light", monthly: 1000, annual: 8000 }, bestFor: "Beginner drag-and-drop websites", offers: ["Annual plans often include a free domain for year one (check current terms)."] },
  { id: "wordpress", name: "WordPress.com", url: "https://wordpress.com", cats: ["website", "writing"], field: "General", quality: 8, ease: 7, power: 8, freeScore: 6, freeNote: "Free site with WordPress branding.", paid: { plan: "Personal", monthly: 400, annual: 3000 }, bestFor: "Blogs and flexible websites", offers: ["Annual plans often include a free domain for year one (check current terms)."] },
];

// General reminder shown to the user (we never claim a live sale).
const OFFERS_NOTE = "Big sales often appear around Diwali, Black Friday and New Year. This is a common pattern, not a guarantee. Always check the official site.";

// ---------- 3. ALLOWED INPUT VALUES ----------
const ALLOWED = {
  field: ["any", "ai", "nonai"],
  budget: ["free", "paid", "either"],
  priority: ["best", "cost", "easy", "power"],
  experience: ["beginner", "intermediate", "advanced"],
  billing: ["monthly", "annual", "compare"],
};

// ---------- 4. VALIDATION ----------
// Fills in defaults and rejects anything unexpected.
function validate(raw) {
  const r = raw && typeof raw === "object" ? raw : {};
  const q = {
    category: r.category === undefined ? "any" : r.category,
    field: r.field || "any", budget: r.budget || "either",
    priority: r.priority || "best", experience: r.experience || "beginner",
    billing: r.billing || "compare",
  };
  if (q.category !== "any" && !CATEGORIES[q.category]) return { ok: false, error: "Unknown category." };
  for (const key of Object.keys(ALLOWED)) {
    if (!ALLOWED[key].includes(q[key])) return { ok: false, error: "Invalid value for '" + key + "'." };
  }
  return { ok: true, q };
}

// ---------- 5. PRICING CALCULATIONS ----------
// Works out monthly vs annual cost, savings and break-even for one tool.
function pricing(tool, billing) {
  const p = tool.paid;
  if (!p) return null;
  const m = p.monthly, a = p.annual;
  const out = { plan: p.plan, monthly: m, annual: a };

  if (m && a) {
    out.yearOnMonthly = m * 12;                          // cost if you pay monthly for a year
    out.savings = m * 12 - a;                            // money saved by going annual
    out.savingsPct = Math.round((out.savings / (m * 12)) * 100);
    out.effMonthlyOnAnnual = Math.round(a / 12);         // annual plan expressed per month
    out.breakEvenMonths = Math.ceil(a / m);              // months of use where annual becomes cheaper
    const annualWins = out.savings > 0;
    out.recommended = billing === "monthly" ? "monthly" : (annualWins ? "annual" : "monthly");
    out.yearlyCost = out.recommended === "annual" ? a : m * 12;
    out.advice = annualWins
      ? "Annual saves " + inr(out.savings) + " (" + out.savingsPct + "%). It pays off if you will use it for " + out.breakEvenMonths + "+ months; if you are unsure, start monthly."
      : "Annual gives no saving, so pay monthly.";
    if (billing === "monthly" && annualWins) out.advice = "You chose monthly. Note that annual would save " + inr(out.savings) + " per year. " + out.advice;
  } else if (a) {
    out.recommended = "annual"; out.yearlyCost = a; out.savings = 0;
    out.advice = "Only an annual plan exists (" + inr(a) + " per year, about " + inr(Math.round(a / 12)) + "/month).";
  } else {
    out.recommended = "monthly"; out.yearlyCost = m * 12; out.savings = 0;
    out.advice = "Only monthly billing exists (" + inr(m) + "/month = " + inr(m * 12) + "/year). Cancel any time.";
  }
  return out;
}

// Formats numbers as Indian Rupees, e.g. 3999 -> "₹3,999"
function inr(n) { return "₹" + Number(n).toLocaleString("en-IN"); }

// ---------- 6. MATCHING + SCORING ----------
// Each priority gives different importance (weights) to each rating.
const WEIGHTS = {
  best:  { q: 0.40, ease: 0.20, value: 0.25, power: 0.15 },
  cost:  { q: 0.25, ease: 0.15, value: 0.60, power: 0.00 },
  easy:  { q: 0.25, ease: 0.60, value: 0.15, power: 0.00 },
  power: { q: 0.30, ease: 0.00, value: 0.10, power: 0.60 },
};

function scoreTool(tool, q) {
  const w = Object.assign({}, WEIGHTS[q.priority]);
  // Experience level shifts the weights: beginners need ease, experts want power.
  if (q.experience === "beginner") w.ease += 0.15;
  if (q.experience === "advanced") w.power += 0.15;
  const total = w.q + w.ease + w.value + w.power;      // normalise so weights add up to 1

  // Value = how cheap it is for the user (10 = free, 0 = very expensive).
  const p = tool.paid;
  const effMonthly = p ? (p.annual ? p.annual / 12 : p.monthly) : 0;
  const paidValue = p ? Math.max(0, 10 - effMonthly / 250) : 0;
  const value = q.budget === "paid" ? paidValue : (tool.freeScore > 0 ? tool.freeScore : paidValue);

  // If the user only wants free, blend quality with how good the free plan is.
  const quality = q.budget === "free" ? (tool.quality + tool.freeScore) / 2 : tool.quality;

  const raw = (w.q * quality + w.ease * tool.ease + w.value * value + w.power * tool.power) / total;
  return Math.round(raw * 10 * 10) / 10;                 // score out of 100
}

// Short human-readable reasons shown on each card.
function reasons(tool, q) {
  const r = [];
  if (tool.quality >= 9) r.push("Top-rated quality");
  if (tool.ease >= 9 && q.experience === "beginner") r.push("Very beginner-friendly");
  if (tool.power >= 9 && q.experience === "advanced") r.push("Very powerful for experts");
  if (tool.freeScore >= 8 && q.budget !== "paid") r.push("Strong free plan");
  if (tool.paid && tool.paid.annual && tool.paid.monthly && q.budget !== "free") r.push("Annual billing saves money");
  if (!r.length) r.push("Solid all-round match");
  return r;
}

// One-line verdict: is free enough, or is paid worth it?
function verdict(tool, q, price) {
  if (q.budget === "free") return tool.freeScore >= 7 ? "Free plan is good enough." : "Free plan works but has limits.";
  if (q.budget === "paid") return price ? "Best plan: " + price.recommended + " (" + inr(price.yearlyCost) + "/year)." : "No paid plan.";
  if (tool.freeScore >= 7) return "Start free. Upgrade only if you hit limits.";
  return price ? "Free plan is limited. Paid is likely worth it." : "Free only.";
}

// ---------- 7. MAIN ENGINE ----------
function recommend(raw) {
  const v = validate(raw);
  if (!v.ok) return v;
  const q = v.q;

  // Step A: keep only tools that match the filters.
  const pool = TOOLS.filter(function (t) {
    if (q.category !== "any" && !t.cats.includes(q.category)) return false;
    if (q.field === "ai" && t.field !== "AI") return false;
    if (q.field === "nonai" && t.field === "AI") return false;
    if (q.budget === "free" && t.freeScore <= 0) return false;
    if (q.budget === "paid" && !t.paid) return false;
    return true;
  });

  // Step B: score, sort (ties broken by name so results never shuffle), keep top 5.
  const ranked = pool
    .map(function (t) { return { t: t, score: scoreTool(t, q) }; })
    .sort(function (x, y) { return y.score - x.score || x.t.name.localeCompare(y.t.name); })
    .slice(0, 5);

  // Step C: build result cards.
  const results = ranked.map(function (item, i) {
    const t = item.t;
    const price = q.budget === "free" ? null : pricing(t, q.billing);
    return {
      rank: i + 1, id: t.id, name: t.name, url: t.url, field: t.field, score: item.score,
      bestFor: t.bestFor, reasons: reasons(t, q),
      free: q.budget === "paid" || t.freeScore <= 0 ? null : { note: t.freeNote, score: t.freeScore },
      paid: price, offers: t.offers, verdict: verdict(t, q, price),
    };
  });

  // Step D: comparison table (one row per result).
  const table = results.map(function (r) {
    const p = r.paid;
    return {
      name: r.name, hasFree: !!r.free,
      monthly: p && p.monthly ? p.monthly : null,
      annual: p && p.annual ? p.annual : null,
      savings: p && p.savings ? p.savings : 0,
      best: p ? p.recommended : "free",
    };
  });

  const message = results.length ? null : "No tools matched. Try 'Any category' or a different budget.";
  return { ok: true, query: q, results: results, table: table, offersNote: OFFERS_NOTE, message: message,
    disclaimer: "Sample data for product design. Prices are approximate. Verify on official sites." };
}

// ---------- 8. NETLIFY HANDLER ----------
// GET  /api/recommend  -> returns dropdown data
// POST /api/recommend  -> returns recommendations
const HEADERS = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
function reply(code, body) { return { statusCode: code, headers: HEADERS, body: JSON.stringify(body) }; }

exports.handler = async function (event) {
  try {
    if (event.httpMethod === "OPTIONS") return reply(204, {});
    if (event.httpMethod === "GET") return reply(200, { ok: true, categories: CATEGORIES });
    if (event.httpMethod !== "POST") return reply(405, { ok: false, error: "Use GET or POST." });
    let body;
    try { body = JSON.parse(event.body || "{}"); } catch (e) { return reply(400, { ok: false, error: "Body must be valid JSON." }); }
    const out = recommend(body);
    return reply(out.ok ? 200 : 400, out);
  } catch (err) {
    return reply(500, { ok: false, error: "Server error. Please try again." });
  }
};

// Exported only so test.js can check the engine.
exports.recommend = recommend;
exports.CATEGORIES = CATEGORIES;
