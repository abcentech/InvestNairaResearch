/**
 * InvestNaira Research — SPA
 * Architecture: Vanilla JS hash router
 * Pages: Home, Research, Research/[category], Reports, Subscribe, About, FAQ
 *
 * Design system: Lagos Financial Intelligence
 * All tokens in index.html :root — referenced here via var(--*)
 *
 * LIVE DATA CONNECTIONS:
 * - Ticker tape: Supabase REST API (daily_prices + macro_data tables)
 * - Reports: Ghost Content API → Supabase fallback
 * - Payments: Korapay checkout
 */

'use strict';

/* ═══════════════════════════════════════════════════════════
   CONFIG
═══════════════════════════════════════════════════════════ */

const CONFIG = {
  SUPABASE_URL:  'https://qdvcrqkiltbtqykxntev.supabase.co',
  SUPABASE_ANON: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkdmNycWtpbHRidHF5a3hudGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3OTg5NzQsImV4cCI6MjA4NzM3NDk3NH0.ah5UWtBhTvNGkw2Gmp3RxCdv6yOopgDMNFLOKD0oG08',
  GHOST_URL:     'https://research.investnaira.com',
  GHOST_KEY:     'e6f915d91ea8d187cb4e5a0e50',
  PAY_PREMIUM:      'https://checkout.korapay.com/pay/DqjfX7nSyiQj9yT',
  PAY_PROFESSIONAL: 'https://checkout.korapay.com/pay/FxXpAqjHzyamBol',
  PAY_BUSINESS:     'mailto:research@investnaira.com',
};

/* ═══════════════════════════════════════════════════════════
   FALLBACK DATA — shown while live data loads
═══════════════════════════════════════════════════════════ */

const TICKER_FALLBACK = [
  { sym: 'NGX ASI',     price: '97,842',   change: '+2.34%', up: true  },
  { sym: 'GTCO',        price: '₦118.90',  change: '+0.85%', up: true  },
  { sym: 'ZENITHBANK',  price: '₦42.80',   change: '+0.70%', up: true  },
  { sym: 'DANGCEM',     price: '₦312.40',  change: '+1.20%', up: true  },
  { sym: 'MTNN',        price: '₦228.50',  change: '-1.10%', up: false },
  { sym: 'ACCESSCORP',  price: '₦22.15',   change: '+0.45%', up: true  },
  { sym: 'SEPLAT',      price: '₦4,288',   change: '+3.15%', up: true  },
  { sym: 'USD/NGN',     price: '₦1,620',   change: '+0.18%', up: true  },
  { sym: 'BTC/NGN',     price: '₦168.4M',  change: '+1.84%', up: true  },
  { sym: 'BONNY LIGHT', price: '$74.20',   change: '-0.32%', up: false },
  { sym: 'UBA',         price: '₦28.50',   change: '+1.25%', up: true  },
  { sym: 'AIRTELAFRI',  price: '₦2,350',   change: '+0.64%', up: true  },
];

// Shown while Ghost posts load
const REPORTS_FALLBACK = [
  { id: 1, type: 'equity',    badge: 'Equity',    title: 'GTCO Holdings — Full Valuation Report: BUY | Target ₦158',           date: 'Mar 2026', plan: 'pro', url: '#/subscribe' },
  { id: 2, type: 'equity',    badge: 'Equity',    title: 'Zenith Bank FY2024 — Initiating Coverage',                            date: 'Mar 2026', plan: 'pro', url: '#/subscribe' },
  { id: 3, type: 'equity',    badge: 'Equity',    title: 'Access Holdings Q3 2025 — Financial Statement Analysis',              date: 'Mar 2026', plan: 'pro', url: '#/subscribe' },
  { id: 4, type: 'currency',  badge: 'Currency',  title: 'CBN MPR at 27.5%: What It Means for Nigerian Equities in 2026',      date: 'Mar 2026', plan: 'starter', url: '#/subscribe' },
  { id: 5, type: 'equity',    badge: 'Equity',    title: 'MTN Nigeria FY2024 — Earnings Breakdown and Price Target',            date: 'Mar 2026', plan: 'pro', url: '#/subscribe' },
  { id: 6, type: 'commodity', badge: 'Commodity', title: 'Dangote Cement Q3 2025 — Volume Growth vs Margin Compression',       date: 'Feb 2026', plan: 'pro', url: '#/subscribe' },
];

/* ═══════════════════════════════════════════════════════════
   LIVE DATA — Supabase + Ghost
═══════════════════════════════════════════════════════════ */

// Cache so we don't re-fetch on every navigation
const cache = { tickers: null, reports: null, stats: null };

async function fetchLiveTickers() {
  if (cache.tickers) return cache.tickers;
  try {
    // Featured tickers for the tape
    const tickers = ['GTCO','ZENITHBANK','DANGCEM','MTNN','ACCESSCORP','SEPLAT','AIRTELAFRI','UBA','FBNH','BUACEMENT'];
    const list = tickers.join(',');
    const url = `${CONFIG.SUPABASE_URL}/rest/v1/daily_prices?select=ticker,close,date&ticker=in.(${list})&order=date.desc&limit=20`;
    const res = await fetch(url, {
      headers: {
        'apikey': CONFIG.SUPABASE_ANON,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON}`,
      }
    });
    if (!res.ok) throw new Error('Supabase fetch failed');
    const rows = await res.json();

    // Get latest price per ticker
    const latest = {};
    for (const row of rows) {
      if (!latest[row.ticker]) latest[row.ticker] = row;
    }

    // Also fetch macro data (USD/NGN, oil)
    const macroUrl = `${CONFIG.SUPABASE_URL}/rest/v1/macro_data?select=metric,value,date&order=date.desc&limit=20`;
    const macroRes = await fetch(macroUrl, {
      headers: { 'apikey': CONFIG.SUPABASE_ANON, 'Authorization': `Bearer ${CONFIG.SUPABASE_ANON}` }
    });
    const macroRows = macroRes.ok ? await macroRes.json() : [];
    const macro = {};
    for (const row of macroRows) {
      if (!macro[row.metric]) macro[row.metric] = row;
    }

    // Build ticker tape array
    const tape = [];

    // NGX ASI from macro
    if (macro['ngx_asi']) {
      tape.push({ sym: 'NGX ASI', price: Number(macro['ngx_asi'].value).toLocaleString('en-NG', {maximumFractionDigits:2}), change: '+—', up: true });
    }

    // USD/NGN from macro
    if (macro['usd_ngn_official']) {
      tape.push({ sym: 'USD/NGN', price: `₦${Number(macro['usd_ngn_official'].value).toLocaleString('en-NG', {maximumFractionDigits:2})}`, change: '+—', up: true });
    }

    // Stock prices
    for (const ticker of tickers) {
      if (latest[ticker]) {
        const price = latest[ticker].close;
        tape.push({
          sym: ticker,
          price: `₦${Number(price).toLocaleString('en-NG', {maximumFractionDigits:2})}`,
          change: '—',
          up: true,
        });
      }
    }

    // Oil from macro
    if (macro['bonny_light'] || macro['brent_crude']) {
      const oil = macro['bonny_light'] || macro['brent_crude'];
      tape.push({ sym: 'BONNY LIGHT', price: `$${Number(oil.value).toFixed(2)}`, change: '—', up: true });
    }

    cache.tickers = tape.length > 3 ? tape : TICKER_FALLBACK;
    return cache.tickers;
  } catch (e) {
    console.warn('Live ticker fetch failed, using fallback:', e.message);
    return TICKER_FALLBACK;
  }
}

async function fetchLiveReports() {
  if (cache.reports) return cache.reports;
  
  // Try Ghost first
  try {
    const url = `${CONFIG.GHOST_URL}/ghost/api/content/posts/?key=${CONFIG.GHOST_KEY}&limit=20&fields=id,title,slug,published_at,tags,url&include=tags`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const posts = data.posts || [];
      if (posts.length > 0) {
        cache.reports = posts.map(post => {
          const tags = (post.tags || []).map(t => t.slug);
          let type = 'equity';
          if (tags.includes('currency') || tags.includes('fx')) type = 'currency';
          else if (tags.includes('commodity') || tags.includes('commodities')) type = 'commodity';
          else if (tags.includes('crypto') || tags.includes('cryptocurrency')) type = 'crypto';
          else if (tags.includes('real-estate') || tags.includes('realestate')) type = 'realestate';
          return {
            id:    post.id,
            type,
            badge: type.charAt(0).toUpperCase() + type.slice(1),
            title: post.title,
            date:  post.published_at ? new Date(post.published_at).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' }) : 'Recent',
            plan:  tags.includes('free') ? 'starter' : 'pro',
            url:   `${CONFIG.GHOST_URL}/${post.slug}`,
          };
        });
        return cache.reports;
      }
    }
  } catch (e) {
    console.warn('Ghost fetch failed, trying Supabase:', e.message);
  }

  // Fallback to Supabase reports table
  try {
    const url = `${CONFIG.SUPABASE_URL}/rest/v1/reports?select=*&order=published_at.desc&limit=20`;
    const res = await fetch(url, {
      headers: {
        'apikey': CONFIG.SUPABASE_ANON,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON}`,
      }
    });
    if (!res.ok) throw new Error('fetch failed');
    const rows = await res.json();
    cache.reports = rows.map(r => ({
      id:           r.id,
      type:         r.type || 'equity',
      badge:        (r.type || 'equity').charAt(0).toUpperCase() + (r.type || 'equity').slice(1),
      title:        r.title,
      date:         new Date(r.published_at).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' }),
      plan:         r.is_free ? 'starter' : 'pro',
      url:          r.is_free ? `#/report/${r.slug}` : CONFIG.PAY_PREMIUM,
      ticker:       r.ticker,
      rating:       r.rating,
      price_target: r.price_target,
      excerpt:      r.excerpt,
    }));
    return cache.reports.length > 0 ? cache.reports : REPORTS_FALLBACK;
  } catch (e) {
    console.warn('Supabase fetch failed, using fallback:', e.message);
    return REPORTS_FALLBACK;
  }
}

async function fetchStats() {
  if (cache.stats) return cache.stats;
  try {
    // Count real research ratings in Supabase
    const url = `${CONFIG.SUPABASE_URL}/rest/v1/research_ratings?select=id&limit=1000`;
    const res = await fetch(url, {
      headers: { 'apikey': CONFIG.SUPABASE_ANON, 'Authorization': `Bearer ${CONFIG.SUPABASE_ANON}` }
    });
    const rows = res.ok ? await res.json() : [];
    cache.stats = { reportCount: rows.length || 32 };
    return cache.stats;
  } catch {
    return { reportCount: 32 };
  }
}

/* ═══════════════════════════════════════════════════════════
   DATA — static content
═══════════════════════════════════════════════════════════ */

const CATEGORIES = [
  {
    slug:  'equities',
    name:  'Equities',
    icon:  '▲',
    badge: 'equity',
    desc:  'Deep-dive company analysis across the Nigerian Exchange. Earnings models, DCF valuations, sector rotation signals — built for conviction investing.',
    count: '32 active coverage',
    color: 'var(--c-pos)',
    detail: `
      <p>Our equities research covers the most liquid stocks on the NGX with AI-assisted valuation models updated with each annual and quarterly report. Coverage includes detailed DCF, DDM, and P/E models, Bear/Base/Bull price targets, and sector-level thematic notes.</p>
      <p>Key coverage includes the banking sector (GTCO, Zenith, Access, UBA, FBNH), industrials (Dangote Cement, BUA Cement, Lafarge), oil & gas (Seplat, Conoil, Total Energies), and telecoms (MTNN, Airtel Africa).</p>
      <p>Every report includes core vs non-core earnings decomposition, hidden catalysts analysis, and an institutional action plan with specific accumulation ranges and stop-loss levels.</p>
    `,
    latestReports: ['equity'],
  },
  {
    slug:  'real-estate',
    name:  'Real Estate',
    icon:  '⬡',
    badge: 'realestate',
    desc:  'Lagos and Abuja commercial and residential markets. Rental yields, capital appreciation trends, and the infrastructure projects reshaping valuations.',
    count: 'Lagos · Abuja · Port Harcourt',
    color: '#E8A87C',
    detail: `
      <p>Nigeria's real estate market is bifurcated: dollar-denominated prime assets in Ikoyi and Victoria Island operate by entirely different rules than naira-priced mass market housing in Lekki Phase 2 or Abuja's Maitama. We cover both, with the rigour neither typically receives.</p>
      <p>Our quarterly Lagos Market Report tracks asking rents, actual achieved rents, vacancy rates by micromarket, and the supply pipeline.</p>
      <p>Coverage areas: Ikoyi, Victoria Island, Lekki (all phases), Ajah, Ikeja GRA, Abuja (Maitama, Wuse 2, Gwarinpa), Port Harcourt (GRA, Old GRA).</p>
    `,
    latestReports: ['realestate'],
  },
  {
    slug:  'commodities',
    name:  'Commodities',
    icon:  '◈',
    badge: 'commodity',
    desc:  'Crude oil Bonny Light benchmarking, agricultural commodities, and precious metals — with Nigeria\'s unique supply-chain dynamics modelled in.',
    count: 'Crude · Agri · Metals',
    color: 'var(--c-gold)',
    detail: `
      <p>Nigeria is Africa's largest oil producer. Understanding where Bonny Light trades relative to Brent — and why that spread moves — is essential for understanding the fiscal position, the naira, and every equity with upstream exposure.</p>
      <p>Beyond crude: we track cocoa, palm oil, sesame, and cashew. Agricultural commodity prices affect farm income, rural spending, and bank NPLs in ways equity analysts rarely model.</p>
      <p>The Dangote Refinery changes everything for petroleum products pricing. We track its ramp-up and model its impact on petrol import costs and Dangote Cement's energy bill.</p>
    `,
    latestReports: ['commodity'],
  },
  {
    slug:  'cryptocurrency',
    name:  'Cryptocurrency',
    icon:  '◎',
    badge: 'crypto',
    desc:  'Bitcoin, Ethereum, and stablecoins through a Nigerian lens. P2P market dynamics, CBN regulatory posture, and on-chain metrics that matter.',
    count: 'BTC · ETH · USDT · On-chain',
    color: '#A78BFA',
    detail: `
      <p>Nigeria is consistently among the world's top 3 countries for crypto adoption by volume — practical use: remittances, dollar savings, cross-border payments, and corporate treasury management.</p>
      <p>The spread between official USD/NGN and the P2P USDT rate tells you more about real naira sentiment than any CBN press release. We track it daily.</p>
      <p>Coverage: Bitcoin price and on-chain analysis, Ethereum fundamentals, USDT/USDC P2P spreads, CBN regulatory developments.</p>
    `,
    latestReports: ['crypto'],
  },
  {
    slug:  'currency',
    name:  'Currency & FX',
    icon:  '₦',
    badge: 'currency',
    desc:  '₦/USD, ₦/GBP, parallel market tracking, CBN policy analysis. We map the divergence between official and market rates so you don\'t have to.',
    count: 'Daily FX briefs',
    color: 'var(--c-accent)',
    detail: `
      <p>The naira is the single biggest variable in every Nigerian investment. Getting FX right — the direction, the policy regime, the parallel market premium — determines portfolio outcomes more than any individual stock pick.</p>
      <p>We publish a daily FX brief: official NIFEX rate, CBN intervention volumes, parallel rate, and 30-day trend commentary.</p>
      <p>Monthly: a deep analysis of CBN policy, foreign reserve position, oil export receipts, remittance inflows, and our ₦/USD range forecast.</p>
    `,
    latestReports: ['currency'],
  },
];

const PLANS = [
  {
    id:       'premium',
    name:     'Premium',
    monthly:  10000,
    yearly:   100000,
    yearlySave: '₦20,000 saved',
    featured: false,
    cta:      'Subscribe now',
    ctaStyle: 'outline',
    ctaUrl:   CONFIG.PAY_PREMIUM,
    showPrice: true,
    features: [
      { text: 'Full equity research reports (32 tickers)', included: true  },
      { text: 'DCF + DDM + P/E valuation models',         included: true  },
      { text: 'Bear / Base / Bull price targets',         included: true  },
      { text: 'Weekly NGX Market Flash email',            included: true  },
      { text: 'Telegram alert channel',                   included: true  },
      { text: 'FX & macro daily brief',                   included: true  },
      { text: 'Excel valuation models',                   included: false },
      { text: 'Monthly live Q&A',                         included: false },
    ],
  },
  {
    id:       'professional',
    name:     'Professional',
    monthly:  25000,
    yearly:   250000,
    yearlySave: '₦50,000 saved',
    featured: true,
    cta:      'Subscribe now',
    ctaStyle: 'primary',
    ctaUrl:   CONFIG.PAY_PROFESSIONAL,
    showPrice: true,
    features: [
      { text: 'Everything in Premium',                    included: true  },
      { text: 'Excel valuation models (download)',        included: true  },
      { text: 'Monthly live Q&A with analyst',            included: true  },
      { text: 'Sector deep-dive reports',                 included: true  },
      { text: 'Bond & T-bill yield intelligence',         included: true  },
      { text: 'Early access to new coverage',             included: true  },
      { text: 'Priority email support',                   included: true  },
      { text: 'Custom research requests',                 included: false },
    ],
  },
  {
    id:       'business',
    name:     'Business',
    monthly:  null,
    yearly:   null,
    yearlySave: '',
    featured: false,
    cta:      'Contact us',
    ctaStyle: 'outline',
    ctaUrl:   CONFIG.PAY_BUSINESS,
    showPrice: false,
    features: [
      { text: 'Everything in Professional',               included: true },
      { text: 'Up to 5 team members',                     included: true },
      { text: 'Custom research briefs',                   included: true },
      { text: 'Dedicated analyst relationship',           included: true },
      { text: 'API data access',                          included: true },
      { text: 'White-label reports',                      included: true },
      { text: 'Unlimited analyst messaging',              included: true },
      { text: 'Board-ready presentations',                included: true },
    ],
  },
];

const FAQS = [
  {
    q: 'What makes InvestNaira different from stockbroker research?',
    a: 'Stockbroker research has a structural conflict: they make money when you trade, which biases recommendations toward activity. We earn only subscription revenue and are free to say "hold" or "do nothing" when that\'s the right call. Our AI-powered pipeline reads every annual report filed on the NGX and runs DCF, DDM, and peer comparison models automatically.',
  },
  {
    q: 'How are the research reports generated?',
    a: 'We combine AI-assisted financial extraction (reading audited annual reports from the NGX) with CFA-level analytical frameworks. The AI extracts 5 years of financial data, runs valuation models, and generates a first draft. Our analyst reviews, verifies every number against source documents, and adds qualitative context before publishing.',
  },
  {
    q: 'How often are reports published?',
    a: 'The Weekly NGX Flash goes out every Monday before 8am. Full valuation reports are published within 5 business days of new annual or quarterly results being filed on the NGX. Telegram price alerts fire every weeknight at 9pm covering that day\'s significant moves.',
  },
  {
    q: 'What is the Telegram alert channel?',
    a: 'Every Premium and Professional subscriber gets access to @InvestNairaAlert on Telegram. Every weeknight at 9pm, our alert engine scans the NGX for significant price moves (>3%), 52-week highs/lows, volume spikes, and new research publications. Only HIGH conviction alerts are sent individually; a daily digest summarises everything.',
  },
  {
    q: 'Is InvestNaira suitable for beginners?',
    a: 'Our reports are written for investors who understand basic financial concepts — P/E ratios, yield, exchange rates — but you do not need to be a professional analyst. We explain our reasoning, not just our conclusions.',
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'Yes, at any time via Korapay. Cancel and your access continues until the end of your billing period. No cancellation fees.',
  },
  {
    q: 'Do you cover cryptocurrency?',
    a: 'Yes. Nigeria is consistently in the top 3 globally for P2P crypto volume. Our crypto coverage focuses on BTC/NGN and ETH/NGN pricing, P2P market dynamics, CBN regulatory developments, and how crypto intersects with traditional Nigerian capital markets.',
  },
  {
    q: 'Does InvestNaira give financial advice?',
    a: 'No. InvestNaira provides research and analysis — we share our views, our models, and our reasoning. Our reports do not constitute personalised financial advice. Investment decisions are yours to make.',
  },
];

const SOCIAL = [
  { platform: 'Telegram',  handle: '@InvestNairaAlert', url: 'https://t.me/InvestNairaAlert',              icon: '✈' },
  { platform: 'Instagram', handle: '@InvestNaira',      url: 'https://instagram.com/investnaira',         icon: '◉' },
  { platform: 'LinkedIn',  handle: 'InvestNaira',       url: 'https://linkedin.com/company/investnaira', icon: 'in' },
  { platform: 'X',         handle: '@InvestNaira',      url: 'https://x.com/investnaira',                icon: '✕' },
];

const pRM = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const isMob = () => window.matchMedia('(max-width:768px)').matches;

/* ═══════════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════════ */

function fmt(n) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  return `₦${n.toLocaleString('en-NG')}`;
}

function typeBadge(type) {
  const map    = { equity:'equity', realestate:'realestate', commodity:'commodity', crypto:'crypto', currency:'currency' };
  const labels = { equity:'Equity', realestate:'Real Estate', commodity:'Commodity', crypto:'Crypto', currency:'Currency' };
  return `<span class="type-badge ${map[type] || ''}">${labels[type] || type}</span>`;
}

/* ═══════════════════════════════════════════════════════════
   ROUTER
═══════════════════════════════════════════════════════════ */

class Router {
  constructor() { this.routes = {}; this.current = null; }
  on(pattern, handler) { this.routes[pattern] = handler; return this; }
  resolve() {
    const hash = window.location.hash.slice(1) || '/';
    if (this.routes[hash]) { this.routes[hash]({}); this.current = hash; return; }
    for (const pattern of Object.keys(this.routes)) {
      if (pattern.includes(':')) {
        const re = new RegExp('^' + pattern.replace(/:(\w+)/g, '([^/]+)') + '$');
        const m  = hash.match(re);
        if (m) {
          const keys   = [...pattern.matchAll(/:(\w+)/g)].map(x => x[1]);
          const params = Object.fromEntries(keys.map((k, i) => [k, m[i + 1]]));
          this.routes[pattern](params); this.current = pattern; return;
        }
      }
    }
    if (this.routes['/']) this.routes['/']({});
  }
  init() {
    window.addEventListener('hashchange', () => { this.resolve(); window.scrollTo(0, 0); });
    this.resolve();
  }
}

/* ═══════════════════════════════════════════════════════════
   COMPONENTS
═══════════════════════════════════════════════════════════ */

function renderFooter() {
  const el = document.getElementById('site-footer');
  if (!el) return;
  el.innerHTML = `
    <div class="container">
      <div class="ftr-top">
        <div>
          <div class="ftr-brand-name">
            <div class="logo-flag" aria-hidden="true"><span></span><span></span><span></span></div>
            InvestNaira
          </div>
          <p class="ftr-desc">Independent AI-powered research on Nigerian equities, bonds, crypto, and FX markets.</p>
          <div class="ftr-socials">
            ${SOCIAL.map(s => `
              <a href="${s.url}" class="social-link" target="_blank" rel="noopener" aria-label="${s.platform}">
                <span aria-hidden="true">${s.icon}</span> ${s.platform}
              </a>
            `).join('')}
          </div>
        </div>
        <div class="ftr-col">
          <p class="ftr-col-ttl">Research</p>
          <ul>${CATEGORIES.map(c => `<li><a href="#/research/${c.slug}">${c.name}</a></li>`).join('')}</ul>
        </div>
        <div class="ftr-col">
          <p class="ftr-col-ttl">Platform</p>
          <ul>
            <li><a href="#/reports">All Reports</a></li>
            <li><a href="#/subscribe">Pricing</a></li>
            <li><a href="#/about">About</a></li>
            <li><a href="#/faq">FAQ</a></li>
          </ul>
        </div>
        <div class="ftr-col">
          <p class="ftr-col-ttl">Subscribe</p>
          <ul>
            <li><a href="${CONFIG.PAY_PREMIUM}">Premium — ${fmt(10000)}/mo</a></li>
            <li><a href="${CONFIG.PAY_PROFESSIONAL}">Professional — ${fmt(25000)}/mo</a></li>
            <li><a href="mailto:research@investnaira.com">Business — contact us</a></li>
          </ul>
        </div>
      </div>
      <div class="ftr-btm">
        <p class="ftr-legal">© 2026 InvestNaira Research · Lagos, Nigeria</p>
        <div class="ngx-live"><div class="ngx-dot" aria-hidden="true"></div>NGX data via NGX Group</div>
      </div>
    </div>
  `;
}

async function initTicker() {
  const track = document.getElementById('ticker-track');
  if (!track) return;

  const buildItems = (data) => {
    track.innerHTML = '';
    [...data, ...data].forEach(d => {
      const el = document.createElement('div');
      el.className = 'ticker-item';
      el.innerHTML = `
        <span class="tk-sym">${d.sym}</span>
        <span class="tk-prc">${d.price}</span>
        <span class="tk-chg ${d.up ? 'up' : 'down'}">${d.up ? '▲' : '▼'} ${d.change}</span>
        <div class="tk-div"></div>
      `;
      track.appendChild(el);
    });
  };

  // Always show fallback immediately — ticker is never empty
  buildItems(TICKER_FALLBACK);

  // Fetch from ticker.json in same GitHub repo — no CORS issues
  try {
    const cacheBust = Math.floor(Date.now() / 300000); // refresh every 5 min
    const r = await fetch(`/ticker.json?v=${cacheBust}`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    if (data.tape && data.tape.length >= 3) {
      buildItems(data.tape);
      // Update ASI in hero chart
      const asi = data.tape.find(t => t.sym === 'NGX ASI');
      if (asi) {
        const el = document.getElementById('asi-value');
        const chg = document.getElementById('asi-change');
        if (el) el.textContent = asi.price;
        if (chg) { chg.textContent = asi.change; chg.style.color = asi.up ? 'var(--c-pos)' : 'var(--c-neg)'; }
      }
    }
  } catch (e) {
    // Fallback already showing — try CoinGecko for crypto at minimum
    try {
      const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=ngn,usd');
      if (r.ok) {
        const crypto = await r.json();
        const updated = [...TICKER_FALLBACK];
        if (crypto.bitcoin?.ngn) {
          const idx = updated.findIndex(t => t.sym === 'BTC/NGN');
          const item = { sym: 'BTC/NGN', price: `₦${(crypto.bitcoin.ngn/1_000_000).toFixed(2)}M`, change: '+—', up: true };
          if (idx >= 0) updated[idx] = item; else updated.push(item);
        }
        if (crypto.ethereum?.ngn) {
          const idx = updated.findIndex(t => t.sym === 'ETH/NGN');
          const item = { sym: 'ETH/NGN', price: `₦${(crypto.ethereum.ngn/1_000_000).toFixed(2)}M`, change: '+—', up: true };
          if (idx >= 0) updated[idx] = item; else updated.push(item);
        }
        buildItems(updated);
      }
    } catch {}
  }
}

function updateNav(page) {
  document.querySelectorAll('.main-nav a, .mobile-nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.route === page);
  });
}

/* ═══════════════════════════════════════════════════════════
   PAGE: HOME
═══════════════════════════════════════════════════════════ */

async function renderHome() {
  updateNav('home');
  const app = document.getElementById('app');

  // Fetch reports and stats in parallel
  const [reports, stats] = await Promise.all([fetchLiveReports(), fetchStats()]);
  const reportCount = stats.reportCount;

  app.innerHTML = `
    <!-- Hero -->
    <section class="hero" aria-labelledby="hero-h1">
      <div class="hero-naira" aria-hidden="true">₦</div>
      <div class="hero-inner container">
        <div class="hero-badge reveal">
          <div class="hero-dot" aria-hidden="true"></div>
          <span class="hero-badge-txt">Independent Nigerian Market Research</span>
        </div>
        <h1 class="hero-h1 reveal" id="hero-h1">
          Intelligence for the<br><em>serious</em><br>investor.
        </h1>
        <div class="hero-sub-row reveal">
          <p class="hero-desc">AI-powered research on Nigerian equities, bonds, crypto and FX — built for investors who need to be right.</p>
          <div class="hero-tags" aria-label="Coverage areas">
            <span class="hero-tag">NGX Equities</span>
            <span class="hero-tag">FGN Bonds</span>
            <span class="hero-tag">Commodities</span>
            <span class="hero-tag">Cryptocurrency</span>
            <span class="hero-tag">₦ / FX Markets</span>
          </div>
        </div>
      </div>
      <div class="hero-chart" aria-hidden="true">
        <span class="chart-label" style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-muted);">NGX All-Share</span>
        <div class="chart-wrap">
          <svg class="chart-svg" viewBox="0 0 1000 64" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#008751" stop-opacity=".5"/>
                <stop offset="100%" stop-color="#008751" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <path class="chart-fill" d="M0,52 C30,50 50,55 80,48 C110,41 130,44 160,38 C190,32 210,36 240,30 C270,24 290,28 320,22 C350,16 370,20 400,16 C430,12 450,18 480,14 C510,10 530,8 560,12 C590,16 610,10 640,6 C670,2 690,8 720,4 C750,0 770,6 800,2 C830,-2 850,4 880,0 C910,-4 940,2 970,0 L1000,0 L1000,64 L0,64 Z"/>
            <path class="chart-path" id="chart-path" d="M0,52 C30,50 50,55 80,48 C110,41 130,44 160,38 C190,32 210,36 240,30 C270,24 290,28 320,22 C350,16 370,20 400,16 C430,12 450,18 480,14 C510,10 530,8 560,12 C590,16 610,10 640,6 C670,2 690,8 720,4 C750,0 770,6 800,2 C830,-2 850,4 880,0 C910,-4 940,2 970,0 L1000,0"/>
          </svg>
        </div>
        <div class="chart-meta">
          <div class="chart-val" id="asi-value">—</div>
          <div class="chart-chg" style="font-family:var(--font-mono);font-size:var(--s--1);" id="asi-change">Loading...</div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="stats-bar" aria-label="Platform statistics">
      <div class="stats-grid container">
        <div class="stat-box reveal">
          <div class="stat-num"><span class="count" data-target="${reportCount}" data-suffix="+">0</span></div>
          <div class="stat-lbl">Research Reports</div>
        </div>
        <div class="stat-box reveal" style="--delay:.07s">
          <div class="stat-num" style="color:var(--c-gold)">32</div>
          <div class="stat-lbl">NGX Tickers Covered</div>
        </div>
        <div class="stat-box reveal" style="--delay:.13s">
          <div class="stat-num"><span class="count" data-target="4" data-suffix=" Models">0</span></div>
          <div class="stat-lbl">Valuation Methods</div>
        </div>
        <div class="stat-box reveal" style="--delay:.19s">
          <div class="stat-num" style="color:var(--c-gold)">5</div>
          <div class="stat-lbl">Asset Classes</div>
        </div>
      </div>
    </section>

    <!-- Research categories -->
    <section class="sp" aria-labelledby="cats-h">
      <div class="container">
        <div class="sec-head reveal">
          <div>
            <p class="sec-eye">Coverage</p>
            <h2 class="sec-ttl" id="cats-h">Five markets.<br>One edge.</h2>
          </div>
          <a href="#/research" class="sec-lnk">Full coverage →</a>
        </div>
        <div class="cats-grid">
          ${CATEGORIES.map((c, i) => `
            <a href="#/research/${c.slug}" class="cat-card reveal" style="--delay:${i * 0.08}s" aria-label="${c.name} research">
              <div class="cat-icon" aria-hidden="true" style="color:${c.color}">${c.icon}</div>
              <div>
                <div class="cat-name">${c.name}</div>
                <p class="cat-desc">${c.desc}</p>
              </div>
              <div class="cat-foot">
                <span class="cat-count" style="font-family:var(--font-mono);font-size:var(--s--1);">${c.count}</span>
                <span class="cat-arr" aria-hidden="true">→</span>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Latest reports — LIVE from Ghost -->
    <section class="sp" style="background:var(--c-surface);border-block:1px solid var(--c-border);" aria-labelledby="rep-h">
      <div class="container">
        <div class="sec-head reveal">
          <div>
            <p class="sec-eye">Latest</p>
            <h2 class="sec-ttl" id="rep-h">Recent research.</h2>
          </div>
          <a href="#/reports" class="sec-lnk">All reports →</a>
        </div>
        <div role="list">
          ${reports.slice(0, 6).map(r => `
            <div class="report-row reveal" role="listitem">
              ${typeBadge(r.type)}
              <div class="report-title">${r.title}</div>
              <span class="report-date" style="font-family:var(--font-mono);font-size:var(--s--1);">${r.date}</span>
              <a href="${r.url}" class="report-cta" ${r.plan !== 'starter' ? '' : ''}>Read →</a>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Alert CTA banner -->
    <section style="background:var(--c-bg);border-block-end:1px solid var(--c-border);padding:var(--sp-xl) 0;">
      <div class="container" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-l);">
        <div>
          <div style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-accent);letter-spacing:.08em;text-transform:uppercase;margin-block-end:var(--sp-xs);">Live Alert Channel</div>
          <div style="font-size:var(--s-1);font-weight:500;">Get NGX price alerts on Telegram every evening at 9pm</div>
          <div style="font-size:var(--s--1);color:var(--c-muted);margin-block-start:4px;">Price moves · 52-week highs/lows · Volume spikes · New reports</div>
        </div>
        <a href="https://t.me/InvestNairaAlert" target="_blank" class="btn-primary" style="white-space:nowrap;">
          <span>Join @InvestNairaAlert</span>
          <span class="arr" aria-hidden="true">→</span>
        </a>
      </div>
    </section>

    <!-- CTA -->
    <section class="sp-l" aria-labelledby="cta-h">
      <div class="container" style="text-align:center;">
        <p class="sec-eye reveal" style="color:var(--c-accent);">Start researching smarter</p>
        <h2 class="reveal" id="cta-h" style="font-family:var(--font-display);font-size:var(--s-5);font-weight:600;letter-spacing:-.04em;line-height:.95;margin-block-end:var(--sp-l);">
          Know before<br>the market does.
        </h2>
        <p class="reveal" style="font-size:var(--s-1);font-weight:300;font-style:italic;color:var(--c-muted);max-width:40ch;margin-inline:auto;margin-block-end:var(--sp-2xl);">
          Weekly equity notes, daily FX briefs, and deep-dive valuation reports — delivered to serious investors every week.
        </p>
        <div class="reveal" style="display:flex;gap:var(--sp-l);align-items:center;justify-content:center;flex-wrap:wrap;">
          <a href="${CONFIG.PAY_PREMIUM}" class="btn-primary">
            <span>Get Premium — ₦10,000/mo</span>
            <span class="arr" aria-hidden="true">→</span>
          </a>
          <a href="#/subscribe" class="btn-ghost">See all plans</a>
        </div>
      </div>
    </section>
  `;
  initBehaviours();
  initChartLine();

  // Update ASI value from live tickers
  fetchLiveTickers().then(tickers => {
    const asi = tickers.find(t => t.sym === 'NGX ASI');
    if (asi) {
      const el = document.getElementById('asi-value');
      const chg = document.getElementById('asi-change');
      if (el) el.textContent = asi.price;
      if (chg) chg.textContent = asi.change;
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   PAGE: RESEARCH HUB
═══════════════════════════════════════════════════════════ */

function renderResearch() {
  updateNav('research');
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container sp">
      <div class="page-hero reveal">
        <p class="page-eye">Research coverage</p>
        <h1 class="page-h1">Five markets.<br>Primary research.</h1>
        <p class="page-sub">AI-powered valuation models across the asset classes that shape Nigerian wealth.</p>
      </div>
      <div class="cats-grid">
        ${CATEGORIES.map((c, i) => `
          <a href="#/research/${c.slug}" class="cat-card reveal" style="--delay:${i * 0.08}s" aria-label="${c.name} research">
            <div class="cat-icon" aria-hidden="true" style="color:${c.color};font-size:var(--s-3);">${c.icon}</div>
            <div>
              <div class="cat-name">${c.name}</div>
              <p class="cat-desc">${c.desc}</p>
            </div>
            <div class="cat-foot">
              <span class="cat-count">${c.count}</span>
              <span class="cat-arr" aria-hidden="true">→</span>
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  `;
  initBehaviours();
}

/* ═══════════════════════════════════════════════════════════
   PAGE: RESEARCH CATEGORY
═══════════════════════════════════════════════════════════ */

async function renderCategory({ slug }) {
  const cat = CATEGORIES.find(c => c.slug === slug);
  if (!cat) { renderResearch(); return; }
  updateNav('research');

  const reports = await fetchLiveReports();
  const related = reports.filter(r => cat.latestReports.includes(r.type));

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container sp">
      <div class="page-hero reveal">
        <p class="page-eye">
          <a href="#/research" class="btn-ghost" style="font-size:var(--s--1);">← Research</a>
          &nbsp;&nbsp;${cat.name}
        </p>
        <h1 class="page-h1" style="color:${cat.color}">${cat.name}<br>Research.</h1>
        <p class="page-sub">${cat.desc}</p>
      </div>
      <div style="display:grid;grid-template-columns:2fr 1fr;gap:var(--sp-2xl);align-items:start;" class="reveal">
        <div style="font-size:var(--s-0);font-weight:300;line-height:1.75;color:var(--c-muted);">
          ${cat.detail.trim().split('\n').filter(l => l.trim()).join('')}
        </div>
        <div style="background:var(--c-surface);border:1px solid var(--c-border);padding:var(--sp-xl);">
          <p style="font-family:var(--font-mono);font-size:var(--s--1);letter-spacing:.08em;text-transform:uppercase;color:var(--c-accent);margin-block-end:var(--sp-m);">Coverage includes</p>
          ${cat.count ? `<p style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-muted);margin-block-end:var(--sp-l);">${cat.count}</p>` : ''}
          <a href="${CONFIG.PAY_PREMIUM}" class="btn-primary" style="width:100%;justify-content:center;">
            <span>Access ${cat.name} Reports</span>
            <span class="arr" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
      ${related.length ? `
        <div style="margin-block-start:var(--sp-3xl);">
          <div class="sec-head reveal">
            <div>
              <p class="sec-eye">${cat.name}</p>
              <h2 class="sec-ttl">Recent reports.</h2>
            </div>
            <a href="#/reports" class="sec-lnk">All reports →</a>
          </div>
          <div role="list">
            ${related.map(r => `
              <div class="report-row reveal" role="listitem">
                ${typeBadge(r.type)}
                <div class="report-title">${r.title}</div>
                <span class="report-date">${r.date}</span>
                <a href="${r.url}" class="report-cta">Read →</a>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
  initBehaviours();
}

/* ═══════════════════════════════════════════════════════════
   PAGE: REPORTS — live from Ghost
═══════════════════════════════════════════════════════════ */

async function renderReports() {
  updateNav('reports');
  const app = document.getElementById('app');

  // Show loading state immediately
  app.innerHTML = `
    <div class="container sp">
      <div class="page-hero reveal">
        <p class="page-eye">Research archive</p>
        <h1 class="page-h1">Every report.<br>Every market.</h1>
        <p class="page-sub">AI-powered research across Nigerian equities, bonds, commodities, cryptocurrency, and currency markets.</p>
      </div>
      <div id="reports-content" style="opacity:.5;">Loading reports...</div>
    </div>
  `;

  const reports = await fetchLiveReports();
  const filterButtons = ['All', 'Equity', 'Real Estate', 'Commodity', 'Crypto', 'Currency'];
  const typeMap = { 'All': null, 'Equity': 'equity', 'Real Estate': 'realestate', 'Commodity': 'commodity', 'Crypto': 'crypto', 'Currency': 'currency' };

  document.getElementById('reports-content').outerHTML = `
    <div id="reports-content">
      <div id="filter-bar" style="display:flex;flex-wrap:wrap;gap:var(--sp-xs);margin-block-end:var(--sp-2xl);" role="group" aria-label="Filter reports by category">
        ${filterButtons.map(f => `
          <button data-filter="${typeMap[f] || 'all'}" class="filter-btn ${f === 'All' ? 'active' : ''}"
            style="font-family:var(--font-mono);font-size:var(--s--1);font-weight:300;letter-spacing:.07em;text-transform:uppercase;padding:var(--sp-xs) var(--sp-m);border:1px solid var(--c-bd-mid);border-radius:2px;color:var(--c-muted);background:transparent;cursor:none;transition:color .25s,border-color .25s,background .25s;"
          >${f}</button>
        `).join('')}
      </div>
      <div id="reports-list" role="list">
        ${reports.map(r => `
          <div class="report-row" role="listitem" data-type="${r.type}">
            ${typeBadge(r.type)}
            <div class="report-title">${r.title}</div>
            <span class="report-date">${r.date}</span>
            <a href="${r.url}" class="report-cta">${r.plan !== 'starter' ? '🔒 ' : ''}Read →</a>
          </div>
        `).join('')}
      </div>
      <div style="margin-block-start:var(--sp-2xl);padding-block-start:var(--sp-xl);border-block-start:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;">
        <p style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-muted);">Showing ${reports.length} reports · Updated regularly</p>
        <a href="${CONFIG.PAY_PREMIUM}" class="btn-primary">
          <span>Unlock all reports</span>
          <span class="arr" aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  `;

  initBehaviours();
  initReportFilter();
}

/* ═══════════════════════════════════════════════════════════
   PAGE: SUBSCRIBE — Korapay payments
═══════════════════════════════════════════════════════════ */

function renderSubscribe() {
  updateNav('subscribe');
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container sp-l">
      <div class="page-hero reveal" style="text-align:center;border:none;margin-block-end:var(--sp-2xl);">
        <p class="page-eye" style="justify-content:center;">Subscribe</p>
        <h1 class="page-h1" style="font-size:var(--s-5);margin-inline:auto;">Research that pays<br>for itself.</h1>
        <p class="page-sub" style="margin-inline:auto;text-align:center;">Choose a plan. Pay securely via Korapay. Cancel anytime.</p>
        <div style="margin-block-start:var(--sp-l);display:flex;gap:var(--sp-xs);align-items:center;justify-content:center;flex-wrap:wrap;">
          <span style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-muted);">✓ Secure payment via Korapay</span>
          <span style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-muted);">·</span>
          <span style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-muted);">✓ Cancel anytime</span>
          <span style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-muted);">·</span>
          <span style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-muted);">✓ Price locked for early subscribers</span>
        </div>
      </div>

      <div class="plans-grid reveal">
        ${PLANS.map(p => `
          <div class="plan-card ${p.featured ? 'featured' : ''}">
            <div>
              <div class="plan-name">${p.name}</div>
              ${p.featured ? '<div style="font-family:var(--font-mono);font-size:var(--s--2);color:var(--c-pos);letter-spacing:.08em;text-transform:uppercase;margin-block-start:var(--sp-xs);">Most Popular</div>' : ''}
            </div>
            <div>
              ${p.showPrice ? `
                <div class="plan-price"><sup>₦</sup>${(p.monthly).toLocaleString('en-NG')}</div>
                <div class="plan-period">per month</div>
              ` : `
                <div class="plan-price" style="font-size:var(--s-2);color:var(--c-gold);letter-spacing:-.02em;">Custom</div>
                <div class="plan-period">pricing on request</div>
              `}
            </div>
            <div class="plan-divider"></div>
            <ul class="plan-features">
              ${p.features.map(f => `
                <li class="plan-feat">
                  <span class="feat-icon" aria-hidden="true">${f.included ? '✓' : '×'}</span>
                  <span style="color:${f.included ? 'var(--c-text)' : 'var(--c-muted)'}">${f.text}</span>
                </li>
              `).join('')}
            </ul>
            <a href="${p.ctaUrl}" class="plan-cta ${p.ctaStyle}" ${p.ctaUrl.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${p.cta}</a>
          </div>
        `).join('')}
      </div>

      <div class="reveal" style="margin-block-start:var(--sp-2xl);text-align:center;">
        <p style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-muted);">
          Early adopter pricing — your rate is locked in forever once you subscribe.<br>
          Business enquiries: <a href="mailto:research@investnaira.com" style="color:var(--c-accent);border-block-end:1px solid currentColor;cursor:none;">research@investnaira.com</a>
        </p>
      </div>

      <div class="reveal" style="margin-block-start:var(--sp-3xl);text-align:center;">
        <p style="font-size:var(--s-1);font-weight:300;font-style:italic;color:var(--c-muted);margin-block-end:var(--sp-m);">Have questions?</p>
        <a href="#/faq" class="btn-ghost">Read our FAQ →</a>
      </div>
    </div>
  `;
  initBehaviours();
}

/* ═══════════════════════════════════════════════════════════
   PAGES: ABOUT + FAQ — unchanged from original
═══════════════════════════════════════════════════════════ */

function renderAbout() {
  updateNav('about');
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container sp">
      <div class="page-hero reveal">
        <p class="page-eye">About InvestNaira</p>
        <h1 class="page-h1">Independent.<br>AI-Powered.<br>Nigerian.</h1>
        <p class="page-sub">We combine CFA-level analytical frameworks with AI to make institutional-grade research accessible to every serious Nigerian investor.</p>
      </div>
      <div class="about-grid reveal">
        <div class="about-body">
          <p>InvestNaira was built to close a gap that every serious Nigerian investor knows: the research that moves money on the NGX is locked inside investment banks, available only to institutions paying six-figure retainers.</p>
          <p>Our automated pipeline reads every annual report filed on the Nigerian Exchange, extracts five years of financial data, runs DCF, DDM, and peer comparison models, and publishes institutional-grade research notes — complete with price targets, conviction scores, risk matrices, and actionable entry/exit triggers.</p>
          <p>Our only revenue is subscriptions. We do not take brokerage commission, advisory fees, or payments from companies we cover. Every number in every report is extracted directly from NGX-filed audited financial statements and verified by our analyst before publication.</p>
          <p>The platform covers 32 NGX-listed companies across banking, industrials, oil & gas, telecoms, and FMCG — with bond yields, FX tracking, and crypto intelligence layered on top.</p>
        </div>
        <div>
          <div class="about-pull">"Institutional-grade research on Nigerian equities, now accessible to every serious investor."</div>
          <div style="margin-block-start:var(--sp-2xl);display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--c-border);">
            ${[
              { n:'32',   l:'NGX Tickers Covered' },
              { n:'4',    l:'Valuation Methods' },
              { n:'5',    l:'Asset Classes' },
              { n:'₦0',   l:'Monthly Cost (MVP)' },
            ].map(s => `
              <div style="background:var(--c-bg);padding:var(--sp-l);">
                <div style="font-family:var(--font-display);font-size:var(--s-3);font-weight:600;letter-spacing:-.04em;color:var(--c-gold);margin-block-end:var(--sp-xs);">${s.n}</div>
                <div style="font-family:var(--font-mono);font-size:var(--s--1);font-weight:300;letter-spacing:.07em;text-transform:uppercase;color:var(--c-muted);">${s.l}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <div style="margin-block-start:var(--sp-3xl);">
        <div class="sec-head reveal">
          <div><p class="sec-eye">How we work</p><h2 class="sec-ttl">Methodology.</h2></div>
        </div>
        <div class="method-grid">
          ${[
            { n:'01', name:'AI extracts, analyst verifies', desc:'Our pipeline reads every NGX filing. The AI extracts financials and builds valuation models. Our CFA-trained analyst verifies every number and adds qualitative context before publishing.' },
            { n:'02', name:'Independence is non-negotiable', desc:'No advisory relationships. No brokerage commission. No payments from covered companies. Our only commercial interest is your subscription.' },
            { n:'03', name:'We show our working', desc:'Every report includes the model, the assumptions, the sensitivity analysis, and the scenarios under which our thesis is wrong.' },
            { n:'04', name:'We update when facts change', desc:'If an earnings report or market event materially changes our view, we publish an update within 48 hours — not at the next scheduled report cycle.' },
          ].map(m => `
            <div class="method-card reveal">
              <div class="method-num">${m.n}</div>
              <div class="method-name">${m.name}</div>
              <p class="method-desc">${m.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="reveal" style="margin-block-start:var(--sp-3xl);text-align:center;padding-block:var(--sp-2xl);border-block:1px solid var(--c-border);">
        <p class="sec-eye" style="margin-block-end:var(--sp-l);">Follow us</p>
        <div style="display:flex;gap:var(--sp-m);flex-wrap:wrap;justify-content:center;">
          ${SOCIAL.map(s => `<a href="${s.url}" class="social-link" target="_blank" rel="noopener"><span aria-hidden="true">${s.icon}</span> ${s.platform} · ${s.handle}</a>`).join('')}
        </div>
      </div>
    </div>
  `;
  initBehaviours();
}

function renderFAQ() {
  updateNav('faq');
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container sp">
      <div class="page-hero reveal">
        <p class="page-eye">Questions</p>
        <h1 class="page-h1">Frequently<br>asked.</h1>
        <p class="page-sub">If your question isn't here, email <a href="mailto:hello@investnaira.ng" style="color:var(--c-accent);border-block-end:1px solid currentColor;cursor:none;">hello@investnaira.ng</a></p>
      </div>
      <div style="max-width:780px;" role="list">
        ${FAQS.map((f, i) => `
          <div class="faq-item reveal" style="--delay:${i * 0.04}s" role="listitem">
            <button class="faq-q" aria-expanded="false" aria-controls="faq-a-${i}">
              ${f.q}
              <span class="faq-icon" aria-hidden="true">+</span>
            </button>
            <div class="faq-a" id="faq-a-${i}" role="region">
              <div class="faq-a-inner">${f.a}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="reveal" style="margin-block-start:var(--sp-3xl);display:flex;gap:var(--sp-l);align-items:center;flex-wrap:wrap;">
        <a href="${CONFIG.PAY_PREMIUM}" class="btn-primary"><span>Subscribe now</span><span class="arr" aria-hidden="true">→</span></a>
        <a href="mailto:hello@investnaira.ng" class="btn-ghost">Email us directly</a>
      </div>
    </div>
  `;
  initBehaviours();
  initFAQ();
}

/* ═══════════════════════════════════════════════════════════
   BEHAVIOURS
═══════════════════════════════════════════════════════════ */

function initBehaviours() { initScrollReveal(); initCounters(); initMagneticBtns(); }

function initScrollReveal() {
  const els = document.querySelectorAll('.reveal:not(.is-visible)');
  if (!els.length) return;
  if (pRM) { els.forEach(el => { el.style.opacity='1'; el.style.transform='none'; }); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.style.animationDelay = el.style.getPropertyValue('--delay') || '0s';
      el.classList.add('is-visible');
      io.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
}

function initCounters() {
  const els = document.querySelectorAll('.count:not([data-done])');
  if (!els.length || pRM) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.dataset.done = '1';
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const start  = performance.now();
      (function step(now) {
        const p = Math.min((now - start) / 1400, 1);
        const ease = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.floor(target * ease) + suffix;
        if (p < 1) requestAnimationFrame(step);
      })(start);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  els.forEach(el => io.observe(el));
}

function initMagneticBtns() {
  if (isMob() || pRM) return;
  document.querySelectorAll('.btn-primary:not([data-mag])').forEach(btn => {
    btn.dataset.mag = '1';
    btn.addEventListener('mouseenter', () => btn.style.transition = 'transform .12s ease');
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.2}px,${(e.clientY-r.top-r.height/2)*.25}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
      btn.style.transform  = 'translate(0,0)';
      setTimeout(() => btn.style.transition = '', 500);
    });
  });
}

function initChartLine() {
  const path = document.getElementById('chart-path');
  if (!path || pRM) return;
  const len = path.getTotalLength();
  path.style.setProperty('--plen', len);
  path.style.strokeDasharray  = len;
  path.style.strokeDashoffset = len;
  setTimeout(() => {
    path.style.strokeDashoffset = '0';
    path.style.transition = `stroke-dashoffset 2.2s cubic-bezier(.16,1,.3,1)`;
  }, 500);
}

function initReportFilter() {
  const bar  = document.getElementById('filter-bar');
  const list = document.getElementById('reports-list');
  if (!bar || !list) return;
  function setActive(activeBtn) {
    bar.querySelectorAll('.filter-btn').forEach(b => {
      const on = b === activeBtn;
      b.style.color       = on ? 'var(--c-bg)'    : 'var(--c-muted)';
      b.style.background  = on ? 'var(--c-accent)' : 'transparent';
      b.style.borderColor = on ? 'var(--c-accent)' : 'var(--c-bd-mid)';
    });
  }
  bar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    setActive(btn);
    const filter = btn.dataset.filter;
    list.querySelectorAll('.report-row').forEach(row => {
      row.style.display = filter === 'all' || row.dataset.type === filter ? '' : 'none';
    });
  });
  setActive(bar.querySelector('.filter-btn.active'));
}

function initFAQ() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      document.querySelectorAll('.faq-q').forEach(b => b.setAttribute('aria-expanded','false'));
      if (!wasOpen) { item.classList.add('open'); btn.setAttribute('aria-expanded','true'); }
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   GLOBAL — run once on boot
═══════════════════════════════════════════════════════════ */

function initCursor() {
  if (isMob()) return;
  const dot  = document.querySelector('.cursor');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;
  let mx=0,my=0,dx=0,dy=0,rx=0,ry=0;
  document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
  if (!pRM) {
    (function tick() {
      dx+=(mx-dx)*.88; dy+=(my-dy)*.88; rx+=(mx-rx)*.1; ry+=(my-ry)*.1;
      dot.style.left=dx+'px'; dot.style.top=dy+'px';
      ring.style.left=rx+'px'; ring.style.top=ry+'px';
      requestAnimationFrame(tick);
    })();
  }
  document.addEventListener('mouseover', e => { if(e.target.closest('a,button,[tabindex]')) document.body.classList.add('cur-on'); });
  document.addEventListener('mouseout',  e => { if(e.target.closest('a,button,[tabindex]')) document.body.classList.remove('cur-on'); });
}

function initHeader() {
  const hdr = document.getElementById('site-header');
  if (!hdr) return;
  const check = () => {
    const h = document.querySelector('.hero');
    if (h) {
      const io = new IntersectionObserver(([e]) => hdr.classList.toggle('on',!e.isIntersecting), { rootMargin:'-70px 0px 0px 0px' });
      io.observe(h);
    } else {
      hdr.classList.add('on');
    }
  };
  window.addEventListener('hashchange', () => setTimeout(check, 50));
  setTimeout(check, 50);
}

function initHamburger() {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
      document.body.style.overflow = '';
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   BOOT
═══════════════════════════════════════════════════════════ */

(function boot() {
  renderFooter();
  initTicker();
  initCursor();
  initHeader();
  initHamburger();

  const router = new Router();
  router
    .on('/',               renderHome)
    .on('/research',       renderResearch)
    .on('/research/:slug', renderCategory)
    .on('/reports',        renderReports)
    .on('/subscribe',      renderSubscribe)
    .on('/about',          renderAbout)
    .on('/faq',            renderFAQ);

  router.init();

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const nav = document.getElementById('mobile-nav');
    if (nav?.classList.contains('open')) {
      nav.classList.remove('open');
      document.body.style.overflow = '';
    }
    window.scrollTo(0, 0);
  });
})();
