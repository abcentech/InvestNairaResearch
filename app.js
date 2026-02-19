/**
 * InvestNaira Research — SPA
 * Architecture: Vanilla JS hash router
 * Pages: Home, Research, Research/[category], Reports, Subscribe, About, FAQ
 *
 * Design system: Lagos Financial Intelligence
 * All tokens in index.html :root — referenced here via var(--*)
 */

'use strict';

/* ═══════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════ */

const TICKER_DATA = [
  { sym: 'NGX ASI',     price: '97,842.15', change: '+2.34%', up: true  },
  { sym: 'USD/NGN',     price: '₦1,647.50', change: '+0.18%', up: true  },
  { sym: 'DANGCEM',     price: '₦312.40',   change: '+1.20%', up: true  },
  { sym: 'GTCO',        price: '₦58.25',    change: '-0.43%', up: false },
  { sym: 'SEPLAT',      price: '₦4,288',    change: '+3.15%', up: true  },
  { sym: 'BRENT',       price: '$78.42',    change: '-0.87%', up: false },
  { sym: 'GOLD',        price: '$2,684',    change: '+0.54%', up: true  },
  { sym: 'EUR/NGN',     price: '₦1,732',    change: '-0.22%', up: false },
  { sym: 'ZENITHBANK',  price: '₦42.80',    change: '+0.70%', up: true  },
  { sym: 'BTC/NGN',     price: '₦168.4M',   change: '+1.84%', up: true  },
  { sym: 'BONNY LIGHT', price: '$80.15',    change: '+0.34%', up: true  },
  { sym: 'GBP/NGN',     price: '₦2,091',    change: '+0.08%', up: true  },
  { sym: 'MTNN',        price: '₦228.50',   change: '-1.10%', up: false },
  { sym: 'ETH/NGN',     price: '₦9.12M',    change: '+2.11%', up: true  },
];

const CATEGORIES = [
  {
    slug:  'equities',
    name:  'Equities',
    icon:  '▲',
    badge: 'equity',
    desc:  'Deep-dive company analysis across the Nigerian Exchange. Earnings models, DCF valuations, sector rotation signals — built for conviction investing.',
    count: '142 active coverage',
    color: 'var(--c-pos)',
    detail: `
      <p>Our equities research covers every stock on the NGX with market cap above ₦5 billion. Coverage includes detailed earnings models updated quarterly, entry/exit price targets with rationale, and sector-level thematic notes.</p>
      <p>Key coverage includes the banking sector (GTCO, Zenith, Access, UBA), industrials (Dangote Cement, BUA Cement, Lafarge), oil & gas (Seplat, Conoil, Total Energies), and telecoms (MTNN, Airtel Africa).</p>
      <p>We publish a weekly NGX brief summarising price moves, block trades, and upcoming catalysts. Monthly sector reports go deep on one industry — covering competitive dynamics, regulatory changes, and our conviction picks.</p>
    `,
    latestReports: ['equities', 'equity'],
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
      <p>Our quarterly Lagos Market Report tracks asking rents, actual achieved rents (different numbers), vacancy rates by micromarket, and the supply pipeline. We interview landlords, estate agents, and developers — then verify with transactional data.</p>
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
      <p>Beyond crude: we track cocoa (Nigeria is the world's 4th largest producer), palm oil, sesame, and cashew. Agricultural commodity prices affect farm income, rural spending, and bank NPLs in ways equity analysts rarely model.</p>
      <p>The Dangote Refinery changes everything for petroleum products pricing. We've been tracking its ramp-up since commissioning and model its impact on petrol import costs, government subsidies, and Dangote Cement's energy bill.</p>
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
      <p>Nigeria is consistently among the world's top 3 countries for crypto adoption by volume — not retail speculation, but practical use: remittances, dollar savings, cross-border payments, and increasingly, corporate treasury management.</p>
      <p>We cover this with the nuance it deserves. The spread between official USD/NGN and the P2P USDT rate tells you more about real naira sentiment than any CBN press release. We track it daily.</p>
      <p>Coverage: Bitcoin price and on-chain analysis (MVRV, SOPR, exchange flows), Ethereum fundamentals, USDT/USDC P2P spreads, Binance P2P market depth, CBN regulatory developments, and the intersection with traditional Nigerian financial markets.</p>
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
      <p>We publish a daily FX brief: official NIFEX rate, CBN intervention volumes where disclosed, Abokifx parallel rate, BDC rates in Lagos and Abuja, and 30-day trend commentary. Subscribers get this before markets open.</p>
      <p>Monthly: a deep analysis of CBN policy, foreign reserve position, oil export receipts, remittance inflows, and our ₦/USD 3-month and 6-month range forecast with scenario analysis.</p>
    `,
    latestReports: ['currency'],
  },
];

const REPORTS = [
  { id: 1,  type: 'equity',     badge: 'Equity',     title: 'Dangote Refinery: The ₦3.8 Trillion Opportunity Hiding in Plain Sight',          date: 'Nov 18, 2025', plan: 'starter' },
  { id: 2,  type: 'realestate', badge: 'Real Estate', title: 'Lagos Real Estate Q4 2025: Where Smart Money Is Moving After Naira Stabilisation', date: 'Nov 14, 2025', plan: 'starter' },
  { id: 3,  type: 'equity',     badge: 'Equity',     title: 'GTCO Holdings: Nigeria\'s Answer to Berkshire Hathaway?',                          date: 'Nov 11, 2025', plan: 'pro'     },
  { id: 4,  type: 'commodity',  badge: 'Commodity',  title: 'Bonny Light vs Brent: The Nigerian Premium in 2026 and What Drives It',            date: 'Nov 08, 2025', plan: 'pro'     },
  { id: 5,  type: 'currency',   badge: 'Currency',   title: 'CBN Rate Hold: What ₦1,650/$1 Means for Your Portfolio Right Now',                 date: 'Nov 05, 2025', plan: 'starter' },
  { id: 6,  type: 'equity',     badge: 'Equity',     title: 'Seplat Energy Q3 2025 — Initiating Coverage: Strong Buy at ₦4,100',               date: 'Oct 29, 2025', plan: 'pro'     },
  { id: 7,  type: 'crypto',     badge: 'Crypto',     title: 'Bitcoin P2P Premium: Why Nigeria\'s BTC Rate Diverges from Global Spot',           date: 'Oct 22, 2025', plan: 'pro'     },
  { id: 8,  type: 'realestate', badge: 'Real Estate', title: 'Ikoyi vs Lekki: The Two-Speed Lagos Property Market in 2026',                    date: 'Oct 15, 2025', plan: 'business' },
  { id: 9,  type: 'commodity',  badge: 'Commodity',  title: 'Nigerian Cocoa Season 2025/26: Supply Disruption and the Price Impact',            date: 'Oct 09, 2025', plan: 'pro'     },
  { id: 10, type: 'currency',   badge: 'Currency',   title: 'Foreign Reserve Position: Nigeria\'s FX Buffer vs the Import Bill',               date: 'Oct 02, 2025', plan: 'starter' },
  { id: 11, type: 'equity',     badge: 'Equity',     title: 'BUA Foods — Initiating Coverage: Neutral, Watch ₦368 for Entry',                  date: 'Sep 25, 2025', plan: 'pro'     },
  { id: 12, type: 'crypto',     badge: 'Crypto',     title: 'USDT P2P Spread Analysis: Reading the Parallel FX Market Through Crypto',         date: 'Sep 18, 2025', plan: 'business' },
];

const PLANS = [
  {
    id:     'individual',
    name:   'Individual',
    monthly: 10000,
    yearly:  100000,
    yearlySave: '₦20,000 saved',
    featured: false,
    cta: 'Start free trial',
    ctaStyle: 'outline',
    features: [
      { text: 'Nigeria Weekly Market Brief',     included: true  },
      { text: '1 Sector Report per month',        included: true  },
      { text: 'Opportunity Alerts (bi-weekly)',   included: true  },
      { text: 'Company Profiles',                 included: false },
      { text: 'Due Diligence Reports',            included: false },
      { text: 'Regulatory Intelligence',          included: false },
      { text: 'Analyst messaging',                included: false },
      { text: 'Team access',                      included: false },
    ],
  },
  {
    id:     'professional',
    name:   'Professional',
    monthly: 25000,
    yearly:  250000,
    yearlySave: '₦50,000 saved',
    featured: true,
    cta: 'Subscribe now',
    ctaStyle: 'primary',
    features: [
      { text: 'Everything in Individual',         included: true  },
      { text: '2 Sector Reports per month',        included: true  },
      { text: '2 Company Profiles per month',      included: true  },
      { text: '1 Due Diligence Report per month',  included: true  },
      { text: 'Full Regulatory Intelligence',      included: true  },
      { text: 'Analyst messaging (5 queries/mo)', included: true  },
      { text: 'Priority email support',            included: true  },
      { text: 'Team access',                       included: false },
    ],
  },
  {
    id:     'business',
    name:   'Business',
    monthly: 300000,
    yearly:  2500000,
    yearlySave: '₦1.1M saved',
    featured: false,
    cta: 'Contact us',
    ctaStyle: 'outline',
    features: [
      { text: 'Everything in Professional',           included: true },
      { text: 'Unlimited Sector Reports',             included: true },
      { text: '5 Company Profiles per month',         included: true },
      { text: '3 Due Diligence Reports per month',    included: true },
      { text: 'Up to 3 team members',                 included: true },
      { text: 'Unlimited analyst messaging',          included: true },
      { text: '1 Custom research brief per month',    included: true },
      { text: 'Dedicated analyst relationship',       included: true },
    ],
  },
];

const FAQS = [
  {
    q: 'What makes InvestNaira different from my stockbroker\'s research?',
    a: 'Stockbroker research has a structural conflict: they make money when you trade, which biases recommendations toward activity. We have no brokerage relationship, earn only subscription revenue, and are free to say "hold" or "do nothing" when that\'s the right call. Our analysis is also broader — we cover real estate, FX, commodities, and crypto alongside equities.',
  },
  {
    q: 'How often are reports published?',
    a: 'The Nigeria Weekly Brief goes out every Monday before 8am. Sector Reports are published on the 1st of each month. Company Profiles and Due Diligence Reports are published within 5 business days of the research trigger event (earnings, regulatory change, major news). FX briefs are daily, Monday to Friday.',
  },
  {
    q: 'Is InvestNaira suitable for beginners?',
    a: 'Our reports are written for investors who understand basic financial concepts — P/E ratios, yield, exchange rates — but you do not need to be a professional analyst. We explain our reasoning, not just our conclusions. Many of our Individual plan subscribers are professionals in non-finance fields making their own investment decisions.',
  },
  {
    q: 'Do you cover cryptocurrency?',
    a: 'Yes — and we cover it seriously. Nigeria is consistently in the top 3 globally for P2P crypto volume, and the USDT parallel rate is one of the most accurate real-time signals of naira sentiment. Our crypto coverage focuses on what matters for Nigerian investors: BTC/NGN and ETH/NGN pricing, P2P market dynamics, CBN regulatory developments, and how crypto intersects with traditional Nigerian capital markets.',
  },
  {
    q: 'Are reports available to download as PDFs?',
    a: 'Yes. Every report is available as a formatted PDF immediately on publication. Reports remain in your archive permanently — there is no expiry on back catalogue access for active subscribers.',
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'Yes, at any time. Cancel from your account settings and your access continues until the end of your billing period. No cancellation fees. Monthly subscribers are billed monthly; annual subscribers are billed once yearly with a significant discount.',
  },
  {
    q: 'How does analyst messaging work?',
    a: 'Professional plan subscribers can submit up to 5 research queries per month via the messaging portal. An analyst responds within 2 business days. Queries can be about any coverage area — a specific stock, a market condition, a portfolio allocation question. Business subscribers have unlimited queries and a dedicated analyst relationship.',
  },
  {
    q: 'Does InvestNaira give financial advice?',
    a: 'No. InvestNaira provides research and analysis — we share our views, our models, and our reasoning. We do not hold a portfolio management or investment advisory licence, and our reports do not constitute personalised financial advice. Investment decisions are yours to make.',
  },
  {
    q: 'What is your coverage on real estate?',
    a: 'We cover Lagos (Ikoyi, Victoria Island, Lekki Phases 1–5, Ajah, Ikeja GRA, Surulere, Yaba), Abuja (Maitama, Wuse 2, Asokoro, Gwarinpa, Jahi), and Port Harcourt (GRA, Old GRA). Our quarterly market reports track asking vs achieved rents, capital values per sqm, vacancy rates, and the project pipeline.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes. Individual and Professional plans come with a 7-day free trial — no credit card required. You get full access to the plan\'s content during the trial. Business plan prospective subscribers should contact us to discuss a customised pilot.',
  },
];

const SOCIAL = [
  { platform: 'Telegram',  handle: '@InvestNaira', url: 'https://t.me/investnaira',                  icon: '✈' },
  { platform: 'Instagram', handle: '@InvestNaira', url: 'https://instagram.com/investnaira',         icon: '◉' },
  { platform: 'LinkedIn',  handle: 'InvestNaira',  url: 'https://linkedin.com/company/investnaira', icon: 'in' },
  { platform: 'X',         handle: '@InvestNaira', url: 'https://x.com/investnaira',                icon: '✕' },
];

const pRM = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const isMob = () => window.matchMedia('(max-width:768px)').matches;

/* ═══════════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════════ */

function fmt(n) {
  // Format Naira number → "₦10,000" or "₦2.5M"
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  return `₦${n.toLocaleString('en-NG')}`;
}

function typeBadge(type) {
  const map = { equity:'equity', realestate:'realestate', commodity:'commodity', crypto:'crypto', currency:'currency' };
  const labels = { equity:'Equity', realestate:'Real Estate', commodity:'Commodity', crypto:'Crypto', currency:'Currency' };
  return `<span class="type-badge ${map[type] || ''}">${labels[type] || type}</span>`;
}

/* ═══════════════════════════════════════════════════════════
   ROUTER
═══════════════════════════════════════════════════════════ */

class Router {
  constructor() {
    this.routes = {};
    this.current = null;
  }

  on(pattern, handler) {
    this.routes[pattern] = handler;
    return this;
  }

  resolve() {
    const hash = window.location.hash.slice(1) || '/';
    // Try exact match
    if (this.routes[hash]) { this.routes[hash]({}); this.current = hash; return; }
    // Try prefix match (e.g. /research/equities)
    for (const pattern of Object.keys(this.routes)) {
      if (pattern.includes(':')) {
        const re = new RegExp('^' + pattern.replace(/:(\w+)/g, '([^/]+)') + '$');
        const m  = hash.match(re);
        if (m) {
          const keys   = [...pattern.matchAll(/:(\w+)/g)].map(x => x[1]);
          const params = Object.fromEntries(keys.map((k, i) => [k, m[i + 1]]));
          this.routes[pattern](params);
          this.current = pattern;
          return;
        }
      }
    }
    // 404 fallback → home
    if (this.routes['/']) this.routes['/']({});
  }

  init() {
    window.addEventListener('hashchange', () => { this.resolve(); window.scrollTo(0, 0); });
    this.resolve();
  }
}

/* ═══════════════════════════════════════════════════════════
   COMPONENTS — shared across pages
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
          <p class="ftr-desc">Independent research on Nigerian equities, real estate, commodities, cryptocurrency, and currency markets.</p>
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
          <ul>
            ${CATEGORIES.map(c => `<li><a href="#/research/${c.slug}">${c.name}</a></li>`).join('')}
          </ul>
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
            <li><a href="#/subscribe">Individual — ${fmt(10000)}/mo</a></li>
            <li><a href="#/subscribe">Professional — ${fmt(25000)}/mo</a></li>
            <li><a href="#/subscribe">Business — ${fmt(300000)}/mo</a></li>
            <li><a href="#/subscribe">Free 7-day trial</a></li>
          </ul>
        </div>
      </div>
      <div class="ftr-btm">
        <p class="ftr-legal">© 2025 InvestNaira Research Ltd. · Lagos, Nigeria · SEC Registered</p>
        <div class="ngx-live"><div class="ngx-dot" aria-hidden="true"></div>NGX live data delayed 15 min</div>
      </div>
    </div>
  `;
}

function initTicker() {
  const track = document.getElementById('ticker-track');
  if (!track || track.children.length > 0) return;
  const items = [...TICKER_DATA, ...TICKER_DATA].map(d => {
    const el = document.createElement('div');
    el.className = 'ticker-item';
    el.innerHTML = `
      <span class="tk-sym">${d.sym}</span>
      <span class="tk-prc">${d.price}</span>
      <span class="tk-chg ${d.up ? 'up' : 'down'}">${d.up ? '▲' : '▼'} ${d.change}</span>
      <div class="tk-div"></div>
    `;
    return el;
  });
  items.forEach(i => track.appendChild(i));
}

function updateNav(page) {
  document.querySelectorAll('.main-nav a, .mobile-nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.route === page);
  });
}

/* ═══════════════════════════════════════════════════════════
   PAGE: HOME
═══════════════════════════════════════════════════════════ */

function renderHome() {
  updateNav('home');
  const app = document.getElementById('app');
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
          <p class="hero-desc">Primary research on Nigerian equities, real estate, commodities, crypto and FX — built for investors who need to be right.</p>
          <div class="hero-tags" aria-label="Coverage areas">
            <span class="hero-tag">NGX Equities</span>
            <span class="hero-tag">Real Estate</span>
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
          <div class="chart-val">97,842.15</div>
          <div class="chart-chg" style="font-family:var(--font-mono);font-size:var(--s--1);">▲ +2.34%</div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="stats-bar" aria-label="Platform statistics">
      <div class="stats-grid container">
        <div class="stat-box reveal">
          <div class="stat-num"><span class="count" data-target="340" data-suffix="+">0</span></div>
          <div class="stat-lbl">Research Reports</div>
        </div>
        <div class="stat-box reveal" style="--delay:.07s">
          <div class="stat-num" style="color:var(--c-gold)"><span class="count" data-target="18" data-suffix=" yrs">0</span></div>
          <div class="stat-lbl">Market Experience</div>
        </div>
        <div class="stat-box reveal" style="--delay:.13s">
          <div class="stat-num"><span class="count" data-target="94" data-suffix="%">0</span></div>
          <div class="stat-lbl">Client Retention</div>
        </div>
        <div class="stat-box reveal" style="--delay:.19s">
          <div class="stat-num" style="color:var(--c-gold)">5</div>
          <div class="stat-lbl">Research Categories</div>
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

    <!-- Latest reports -->
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
          ${REPORTS.slice(0, 6).map(r => `
            <div class="report-row reveal" role="listitem">
              ${typeBadge(r.type)}
              <div class="report-title">${r.title}</div>
              <span class="report-date" style="font-family:var(--font-mono);font-size:var(--s--1);">${r.date}</span>
              <a href="#/subscribe" class="report-cta">Read →</a>
            </div>
          `).join('')}
        </div>
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
          Weekly equity notes, daily FX briefs, and deep-dive reports — delivered to serious investors every week.
        </p>
        <div class="reveal" style="display:flex;gap:var(--sp-l);align-items:center;justify-content:center;flex-wrap:wrap;">
          <a href="#/subscribe" class="btn-primary">
            <span>Get research access</span>
            <span class="arr" aria-hidden="true">→</span>
          </a>
          <a href="#/research" class="btn-ghost">View coverage</a>
        </div>
        <p class="reveal" style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-muted);margin-block-start:var(--sp-l);">
          7-day free trial · No credit card required
        </p>
      </div>
    </section>
  `;
  initBehaviours();
  initChartLine();
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
        <p class="page-sub">We cover the asset classes that shape Nigerian wealth — with the depth and independence that determines good investment outcomes.</p>
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

function renderCategory({ slug }) {
  const cat = CATEGORIES.find(c => c.slug === slug);
  if (!cat) { renderResearch(); return; }
  updateNav('research');
  const related = REPORTS.filter(r => cat.latestReports.includes(r.type));
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
          <a href="#/subscribe" class="btn-primary" style="width:100%;justify-content:center;">
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
                <a href="#/subscribe" class="report-cta">Read →</a>
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
   PAGE: REPORTS
═══════════════════════════════════════════════════════════ */

function renderReports() {
  updateNav('reports');
  const app = document.getElementById('app');

  const filterButtons = ['All', 'Equity', 'Real Estate', 'Commodity', 'Crypto', 'Currency'];
  const typeMap = { 'All': null, 'Equity': 'equity', 'Real Estate': 'realestate', 'Commodity': 'commodity', 'Crypto': 'crypto', 'Currency': 'currency' };

  app.innerHTML = `
    <div class="container sp">
      <div class="page-hero reveal">
        <p class="page-eye">Research archive</p>
        <h1 class="page-h1">Every report.<br>Every market.</h1>
        <p class="page-sub">Primary research across Nigerian equities, real estate, commodities, cryptocurrency, and currency markets.</p>
      </div>

      <!-- Filter bar -->
      <div id="filter-bar" style="display:flex;flex-wrap:wrap;gap:var(--sp-xs);margin-block-end:var(--sp-2xl);" role="group" aria-label="Filter reports by category">
        ${filterButtons.map(f => `
          <button
            data-filter="${typeMap[f] || 'all'}"
            class="filter-btn ${f === 'All' ? 'active' : ''}"
            style="font-family:var(--font-mono);font-size:var(--s--1);font-weight:300;letter-spacing:.07em;text-transform:uppercase;padding:var(--sp-xs) var(--sp-m);border:1px solid var(--c-bd-mid);border-radius:2px;color:var(--c-muted);background:transparent;cursor:none;transition:color .25s,border-color .25s,background .25s;"
          >${f}</button>
        `).join('')}
      </div>

      <div id="reports-list" role="list">
        ${REPORTS.map(r => `
          <div class="report-row" role="listitem" data-type="${r.type}">
            ${typeBadge(r.type)}
            <div class="report-title">${r.title}</div>
            <span class="report-date">${r.date}</span>
            <a href="#/subscribe" class="report-cta">${r.plan !== 'starter' ? '🔒 ' : ''}Read →</a>
          </div>
        `).join('')}
      </div>

      <div style="margin-block-start:var(--sp-2xl);padding-block-start:var(--sp-xl);border-block-start:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;">
        <p style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-muted);">Showing ${REPORTS.length} reports · Updated weekly</p>
        <a href="#/subscribe" class="btn-primary">
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
   PAGE: SUBSCRIBE / PRICING
═══════════════════════════════════════════════════════════ */

function renderSubscribe() {
  updateNav('subscribe');
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container sp-l">
      <div class="page-hero reveal" style="text-align:center;border:none;margin-block-end:var(--sp-2xl);">
        <p class="page-eye" style="justify-content:center;">Subscribe</p>
        <h1 class="page-h1" style="font-size:var(--s-5);margin-inline:auto;">Research that pays<br>for itself.</h1>
        <p class="page-sub" style="margin-inline:auto;text-align:center;">Choose a plan. Start your 7-day free trial. Cancel anytime.</p>

        <!-- Billing toggle -->
        <div style="display:flex;align-items:center;justify-content:center;gap:var(--sp-l);margin-block-start:var(--sp-xl);">
          <div class="billing-toggle" id="billing-toggle" role="group" aria-label="Billing frequency">
            <span class="toggle-lbl active" id="lbl-monthly">Monthly</span>
            <div class="toggle-track" id="toggle-track" role="switch" aria-checked="false" tabindex="0" aria-label="Switch to annual billing">
              <div class="toggle-knob"></div>
            </div>
            <span class="toggle-lbl" id="lbl-annual">Annual</span>
          </div>
          <span id="save-badge" style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-pos);opacity:0;transition:opacity .3s;">Save up to 17%</span>
        </div>
      </div>

      <div class="plans-grid reveal">
        ${PLANS.map(p => `
          <div class="plan-card ${p.featured ? 'featured' : ''}">
            <div>
              <div class="plan-name">${p.name}</div>
            </div>
            <div>
              <div class="plan-price" id="price-${p.id}">
                <sup>₦</sup>${(p.monthly).toLocaleString('en-NG')}
              </div>
              <div class="plan-period" id="period-${p.id}">per month</div>
              <div class="plan-save" id="save-${p.id}" style="opacity:0;transition:opacity .3s;margin-block-start:var(--sp-xs);">${p.yearlySave} annually</div>
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
            <a href="mailto:subscribe@investnaira.ng?subject=${encodeURIComponent(p.name + ' Plan')}" class="plan-cta ${p.ctaStyle}">${p.cta}</a>
          </div>
        `).join('')}
      </div>

      <!-- Compare note -->
      <div class="reveal" style="margin-block-start:var(--sp-2xl);text-align:center;">
        <p style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-muted);">
          All plans include a 7-day free trial · No credit card required to start
          <br>Business plans: <a href="mailto:business@investnaira.ng" style="color:var(--c-accent);border-block-end:1px solid currentColor;cursor:none;">contact us for custom arrangements</a>
        </p>
      </div>

      <!-- FAQ teaser -->
      <div class="reveal" style="margin-block-start:var(--sp-3xl);text-align:center;">
        <p style="font-size:var(--s-1);font-weight:300;font-style:italic;color:var(--c-muted);margin-block-end:var(--sp-m);">Have questions about the plans?</p>
        <a href="#/faq" class="btn-ghost">Read our FAQ →</a>
      </div>
    </div>
  `;
  initBehaviours();
  initPricingToggle();
}

/* ═══════════════════════════════════════════════════════════
   PAGE: ABOUT
═══════════════════════════════════════════════════════════ */

function renderAbout() {
  updateNav('about');
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container sp">
      <div class="page-hero reveal">
        <p class="page-eye">About InvestNaira</p>
        <h1 class="page-h1">Independent.<br>Rigorous.<br>Nigerian.</h1>
        <p class="page-sub">We write research that we'd pay for ourselves. That standard guides everything.</p>
      </div>

      <div class="about-grid reveal">
        <div class="about-body">
          <p>InvestNaira was founded in Lagos in 2019 by a team of analysts who had spent years inside Nigerian commercial banks and fund management companies — and grown frustrated with the quality of research available to individual and professional investors outside those institutions.</p>
          <p>The research produced by sell-side brokers is structurally compromised by the need to generate trading commissions. The research produced by fund managers is proprietary, shared only within the institutions that paid for it. The research available to everyone else — individual investors, family offices, small and mid-sized fund managers — is thin, infrequent, and rarely independent.</p>
          <p>We exist to close that gap. Our only revenue is subscriptions. We do not take brokerage commission, advisory fees, or payments from companies we cover. If we think a stock is overvalued, we say so — the same week, not after the price corrects.</p>
          <p>Our five coverage areas — equities, real estate, commodities, cryptocurrency, and currency — were chosen because they represent the real investment universe of serious Nigerian investors. Each is covered with primary research: our analysts attend earnings calls, inspect properties, talk to traders, and read CBN policy statements in full.</p>
        </div>
        <div>
          <div class="about-pull">
            "The research available to individual investors in Nigeria is thin, infrequent, and rarely independent. We exist to close that gap."
          </div>
          <div style="margin-block-start:var(--sp-2xl);display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--c-border);">
            ${[
              { n:'2019', l:'Founded in Lagos' },
              { n:'340+', l:'Reports published' },
              { n:'5',    l:'Asset classes covered' },
              { n:'94%',  l:'Client retention rate' },
            ].map(s => `
              <div style="background:var(--c-bg);padding:var(--sp-l);">
                <div style="font-family:var(--font-display);font-size:var(--s-3);font-weight:600;letter-spacing:-.04em;color:var(--c-gold);margin-block-end:var(--sp-xs);">${s.n}</div>
                <div style="font-family:var(--font-mono);font-size:var(--s--1);font-weight:300;letter-spacing:.07em;text-transform:uppercase;color:var(--c-muted);">${s.l}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Methodology -->
      <div style="margin-block-start:var(--sp-3xl);">
        <div class="sec-head reveal">
          <div>
            <p class="sec-eye">How we work</p>
            <h2 class="sec-ttl">Methodology.</h2>
          </div>
        </div>
        <div class="method-grid">
          ${[
            { n:'01', name:'Primary research first', desc:'We attend earnings calls, inspect properties, interview traders, read full regulatory filings. Secondary sources are used to fill gaps, not as the basis of analysis.' },
            { n:'02', name:'Independence is non-negotiable', desc:'No advisory relationships. No brokerage commission. No payments from covered companies. Our only commercial interest is your subscription.' },
            { n:'03', name:'We show our working', desc:'Every report includes the model, the assumptions, the sensitivity analysis, and the scenarios under which our thesis is wrong. Conclusions without reasoning are opinions, not research.' },
            { n:'04', name:'We update when facts change', desc:'If an earnings report, regulatory change, or market event materially changes our view, we publish an update within 48 hours — not at the next scheduled report cycle.' },
          ].map(m => `
            <div class="method-card reveal">
              <div class="method-num">${m.n}</div>
              <div class="method-name">${m.name}</div>
              <p class="method-desc">${m.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Social -->
      <div class="reveal" style="margin-block-start:var(--sp-3xl);text-align:center;padding-block:var(--sp-2xl);border-block:1px solid var(--c-border);">
        <p class="sec-eye" style="margin-block-end:var(--sp-l);">Follow us</p>
        <div style="display:flex;gap:var(--sp-m);flex-wrap:wrap;justify-content:center;">
          ${SOCIAL.map(s => `
            <a href="${s.url}" class="social-link" target="_blank" rel="noopener">
              <span aria-hidden="true">${s.icon}</span> ${s.platform} · ${s.handle}
            </a>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  initBehaviours();
}

/* ═══════════════════════════════════════════════════════════
   PAGE: FAQ
═══════════════════════════════════════════════════════════ */

function renderFAQ() {
  updateNav('faq');
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container sp">
      <div class="page-hero reveal">
        <p class="page-eye">Questions</p>
        <h1 class="page-h1">Frequently<br>asked.</h1>
        <p class="page-sub">If your question isn't answered here, email us at <a href="mailto:hello@investnaira.ng" style="color:var(--c-accent);border-block-end:1px solid currentColor;cursor:none;">hello@investnaira.ng</a></p>
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
        <a href="#/subscribe" class="btn-primary">
          <span>Start free trial</span>
          <span class="arr" aria-hidden="true">→</span>
        </a>
        <a href="mailto:hello@investnaira.ng" class="btn-ghost">Email us directly</a>
      </div>
    </div>
  `;
  initBehaviours();
  initFAQ();
}

/* ═══════════════════════════════════════════════════════════
   BEHAVIOURS — run after every page render
═══════════════════════════════════════════════════════════ */

function initBehaviours() {
  initScrollReveal();
  initCounters();
  initMagneticBtns();
}

function initScrollReveal() {
  const els = document.querySelectorAll('.reveal:not(.is-visible)');
  if (!els.length) return;
  if (pRM) {
    els.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    return;
  }
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
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .2}px, ${(e.clientY - r.top - r.height / 2) * .25}px)`;
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

  // Style active state
  function setActive(activeBtn) {
    bar.querySelectorAll('.filter-btn').forEach(b => {
      const on = b === activeBtn;
      b.style.color       = on ? 'var(--c-bg)'     : 'var(--c-muted)';
      b.style.background  = on ? 'var(--c-accent)'  : 'transparent';
      b.style.borderColor = on ? 'var(--c-accent)'  : 'var(--c-bd-mid)';
    });
  }

  bar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    setActive(btn);
    const filter = btn.dataset.filter;
    list.querySelectorAll('.report-row').forEach(row => {
      const show = filter === 'all' || row.dataset.type === filter;
      row.style.display = show ? '' : 'none';
    });
  });

  // Set initial active
  setActive(bar.querySelector('.filter-btn.active'));
}

function initPricingToggle() {
  const track = document.getElementById('toggle-track');
  if (!track) return;
  let isAnnual = false;

  track.addEventListener('click', toggle);
  track.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });

  function toggle() {
    isAnnual = !isAnnual;
    track.classList.toggle('on', isAnnual);
    track.setAttribute('aria-checked', isAnnual);
    document.getElementById('lbl-monthly').classList.toggle('active', !isAnnual);
    document.getElementById('lbl-annual').classList.toggle('active', isAnnual);
    document.getElementById('save-badge').style.opacity = isAnnual ? '1' : '0';

    PLANS.forEach(p => {
      const priceEl  = document.getElementById(`price-${p.id}`);
      const periodEl = document.getElementById(`period-${p.id}`);
      const saveEl   = document.getElementById(`save-${p.id}`);
      if (!priceEl) return;
      if (isAnnual) {
        const monthly = Math.round(p.yearly / 12);
        priceEl.innerHTML  = `<sup>₦</sup>${monthly.toLocaleString('en-NG')}`;
        periodEl.textContent = 'per month, billed annually';
        if (saveEl) saveEl.style.opacity = '1';
      } else {
        priceEl.innerHTML  = `<sup>₦</sup>${p.monthly.toLocaleString('en-NG')}`;
        periodEl.textContent = 'per month';
        if (saveEl) saveEl.style.opacity = '0';
      }
    });
  }
}

function initFAQ() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      document.querySelectorAll('.faq-q').forEach(b => b.setAttribute('aria-expanded', 'false'));
      // Open clicked if it was closed
      if (!wasOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   GLOBAL BEHAVIOURS — run once on boot
═══════════════════════════════════════════════════════════ */

function initCursor() {
  if (isMob()) return;
  const dot  = document.querySelector('.cursor');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;
  let mx=0, my=0, dx=0, dy=0, rx=0, ry=0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  if (!pRM) {
    (function tick() {
      dx += (mx - dx) * .88; dy += (my - dy) * .88;
      rx += (mx - rx) * .1;  ry += (my - ry) * .1;
      dot.style.left = dx + 'px'; dot.style.top = dy + 'px';
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(tick);
    })();
  }
  document.addEventListener('mouseover', e => { if (e.target.closest('a,button,[tabindex]')) document.body.classList.add('cur-on'); });
  document.addEventListener('mouseout',  e => { if (e.target.closest('a,button,[tabindex]')) document.body.classList.remove('cur-on'); });
}

function initHeader() {
  const hdr = document.getElementById('site-header');
  const hero = () => document.querySelector('.hero');
  if (!hdr) return;
  const check = () => {
    const h = hero();
    if (h) {
      const io = new IntersectionObserver(([e]) => hdr.classList.toggle('on', !e.isIntersecting), { rootMargin: '-70px 0px 0px 0px' });
      io.observe(h);
    } else {
      hdr.classList.add('on');
    }
  };
  // Re-run after each navigation
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
  // Close on link click
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   BOOT
═══════════════════════════════════════════════════════════ */

(function boot() {
  // Render persistent elements
  renderFooter();
  initTicker();
  initCursor();
  initHeader();
  initHamburger();

  // Wire up router
  const router = new Router();

  router
    .on('/',                    renderHome)
    .on('/research',            renderResearch)
    .on('/research/:slug',      renderCategory)
    .on('/reports',             renderReports)
    .on('/subscribe',           renderSubscribe)
    .on('/about',               renderAbout)
    .on('/faq',                 renderFAQ);

  router.init();

  // Intercept all hash-link clicks for cursor-friendly behaviour
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    // Let the router handle it — just close mobile nav if open
    const nav = document.getElementById('mobile-nav');
    if (nav?.classList.contains('open')) {
      nav.classList.remove('open');
      document.body.style.overflow = '';
    }
    window.scrollTo(0, 0);
  });
})();
