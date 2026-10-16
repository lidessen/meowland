import { css, defineOptions, defineTheme, defineTokens } from "meowcss";

export const blogOptions = defineOptions("blog", {});
export const blogTokens = defineTokens("blog", {
  bg: ["#faf8f3", "#191816"],
  ink: ["#26221e", "#f1ece3"],
  inkSoft: ["#625c55", "#c9c1b7"],
  inkDim: ["#81786f", "#aaa097"],
  inkFaint: ["#c9c1b7", "#615a52"],
  line: ["#ded8cf", "#3e3933"],
  accent: ["#d24b32", "#ef7055"],
  accentSoft: ["#f3ded5", "#3b2621"],
  card: ["#fffdf8", "#24211e"],
  doodleBlue: ["#73aabd", "#86c4d6"],
  markerYellow: ["#e5b958", "#e8c26d"],
  onAccent: ["#fffaf5", "#1d1613"],
  focusRing: ["rgba(210, 75, 50, 0.28)", "rgba(239, 112, 85, 0.34)"],
  washRed: ["rgba(210, 75, 50, 0.04)", "rgba(239, 112, 85, 0.075)"],
  washBlue: ["rgba(115, 170, 189, 0.045)", "rgba(134, 196, 214, 0.055)"],
  heroWash: ["rgba(210, 75, 50, 0.055)", "rgba(239, 112, 85, 0.13)"],
  doodleLoopFill: ["rgba(255, 253, 248, 0.68)", "rgba(47, 42, 37, 0.88)"],
  cardSheen: ["rgba(255, 255, 255, 0.34)", "rgba(255, 255, 255, 0.025)"],
  cardInset: ["rgba(255, 255, 255, 0.46)", "rgba(255, 255, 255, 0.035)"],
  cardShadow: ["rgba(69, 54, 40, 0.035)", "rgba(0, 0, 0, 0.17)"],
  cardShadowHover: ["rgba(69, 54, 40, 0.07)", "rgba(0, 0, 0, 0.28)"],
  postBorderHover: ["#c8beb2", "#61584f"],
  thoughtCard: ["#fdf8ee", "#28231e"],
  thoughtBorder: ["#d8cbbf", "#4a4038"],
  thoughtBorderHover: ["#c8b8aa", "#68584d"],
  filterBg: ["rgba(255, 253, 248, 0.48)", "rgba(36, 33, 30, 0.72)"],
  filterBorderHover: ["#beb5aa", "#685f56"],
  quoteBg: ["rgba(243, 222, 213, 0.34)", "rgba(90, 48, 39, 0.3)"],
  codeBg: ["#fffdf8", "#292622"],
  preBg: ["#26221e", "#0f0f0e"],
  preInk: ["#f2ece2", "#eee7dc"],
  relatedBg: ["rgba(255, 253, 248, 0.32)", "rgba(36, 33, 30, 0.45)"],
  radius: "14px",
  fontSans:
    '"Geist Variable", "Geist", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", ui-sans-serif, system-ui, sans-serif',
  fontMono: '"SF Mono", "Cascadia Code", Menlo, Consolas, ui-monospace, monospace',
  paperGrain:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.78' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='.065'/%3E%3C/svg%3E\")",
});

const styles = css`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    overflow-x: clip;
    scrollbar-color: ${blogTokens.line} transparent;
  }

  ::selection {
    background: ${blogTokens.accent};
    color: ${blogTokens.onAccent};
  }

  body {
    background-color: ${blogTokens.bg};
    background-image:
      radial-gradient(circle at 8% 4%, ${blogTokens.washRed} 0, transparent 25rem),
      radial-gradient(circle at 92% 88%, ${blogTokens.washBlue} 0, transparent 29rem);
    background-attachment: fixed;
    color: ${blogTokens.ink};
    font-family: ${blogTokens.fontSans};
    font-optical-sizing: auto;
    line-height: 1.85;
    overflow-x: clip;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  /* 顶栏：保留秩序，但不再像刊头。 */
  header.site {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 52px 0 18px;
  }

  .site-name {
    display: inline-flex;
    align-items: center;
    color: ${blogTokens.ink};
    font-size: 1.08rem;
    font-weight: 760;
    letter-spacing: 0.01em;
    text-decoration: none;
  }

  .site-name::before {
    width: 12px;
    height: 12px;
    margin-right: 10px;
    border-radius: 53% 47% 58% 42%;
    background: ${blogTokens.accent};
    content: "";
    transform: rotate(-9deg);
    transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .site-name:hover::before {
    transform: rotate(18deg) scale(1.08);
  }

  nav.site-nav {
    display: flex;
    gap: 24px;
  }

  nav.site-nav a {
    position: relative;
    color: ${blogTokens.inkSoft};
    font-size: 0.86rem;
    letter-spacing: 0.04em;
    text-decoration: none;
    transition: color 0.15s;
  }

  nav.site-nav a::after {
    position: absolute;
    right: 50%;
    bottom: -7px;
    left: 50%;
    height: 2px;
    border-radius: 99px;
    background: ${blogTokens.accent};
    content: "";
    transition:
      right 0.18s ease,
      left 0.18s ease;
  }

  nav.site-nav a:hover,
  nav.site-nav a.active {
    color: ${blogTokens.ink};
  }

  nav.site-nav a:hover::after,
  nav.site-nav a.active::after {
    right: 15%;
    left: 15%;
  }

  /* Default hero uses its own vector artwork; optional images belong to the site. */
  .hero {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(260px, 0.9fr);
    align-items: center;
    min-height: 300px;
    margin: 16px 0 8px;
  }

  .hero::before {
    position: absolute;
    z-index: -1;
    top: 22px;
    right: -52px;
    width: 255px;
    height: 238px;
    border-radius: 49% 51% 45% 55% / 54% 44% 56% 46%;
    background: ${blogTokens.heroWash};
    content: "";
    transform: rotate(-6deg);
  }

  .hero-copy {
    position: relative;
    z-index: 3;
    padding: 52px 0;
  }

  .hero-copy h1 {
    color: ${blogTokens.ink};
    font-size: clamp(2rem, 5vw, 2.55rem);
    font-weight: 730;
    letter-spacing: -0.045em;
    line-height: 1.34;
  }

  .hero-copy h1 em {
    color: ${blogTokens.accent};
    font-style: normal;
  }

  .hero-work {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    min-height: 250px;
  }

  .hero-doodle {
    width: 238px;
    overflow: visible;
    transform: translateX(-5px) rotate(-1deg);
  }

  .doodle-loop,
  .doodle-page,
  .doodle-spine,
  .doodle-writing,
  .doodle-spark {
    fill: none;
    stroke: ${blogTokens.ink};
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .doodle-loop {
    fill: ${blogTokens.doodleLoopFill};
    stroke-width: 2.7;
  }

  .doodle-sun {
    fill: ${blogTokens.accent};
    stroke: ${blogTokens.ink};
    stroke-width: 2.4;
  }

  .doodle-page {
    fill: ${blogTokens.card};
    stroke-width: 2.5;
  }

  .doodle-spine {
    stroke-width: 2.1;
  }

  .doodle-writing {
    stroke: ${blogTokens.inkSoft};
    stroke-width: 1.45;
    opacity: 0.52;
  }

  .doodle-dot {
    fill: ${blogTokens.doodleBlue};
  }

  .doodle-spark {
    stroke-width: 2.1;
    opacity: 0.66;
  }

  .hero-image {
    position: absolute;
    z-index: 2;
    right: -20px;
    bottom: 24px;
    width: 112px;
    height: auto;
    pointer-events: none;
  }

  /* 首页内容流：日期只是呼吸点，不再承担机械时间轴。 */
  .feed {
    position: relative;
    padding: 8px 0 48px;
  }

  .feed-decor {
    position: relative;
    z-index: 0;
    height: 165px;
    margin-top: 48px;
    pointer-events: none;
  }

  .feed-empty .empty-state {
    padding-bottom: 10px;
  }

  .feed-empty .feed-decor {
    margin-top: 6px;
  }

  .feed-image {
    position: absolute;
    right: -64px;
    bottom: -3px;
    width: 305px;
    height: auto;
  }

  .yarn-doodle {
    position: absolute;
    bottom: 9px;
    left: 8px;
    width: 72px;
    overflow: visible;
    opacity: 0.5;
    transform: rotate(-4deg);
  }

  .yarn-fill {
    fill: ${blogTokens.doodleBlue};
    stroke: ${blogTokens.ink};
    stroke-width: 1.8;
  }

  .yarn-line,
  .yarn-tail {
    fill: none;
    stroke: ${blogTokens.ink};
    stroke-width: 1.7;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .paw-trail {
    position: absolute;
    right: 228px;
    bottom: 48px;
    width: 104px;
    overflow: visible;
    color: ${blogTokens.inkSoft};
    opacity: 0.15;
  }

  .paw-print {
    fill: currentColor;
  }

  .paw-print-accent {
    color: ${blogTokens.accent};
  }

  @media (prefers-color-scheme: dark) {
    .hero-image,
    .about .avatar img {
      filter: drop-shadow(0 0 1px rgba(241, 236, 227, 0.72))
        drop-shadow(0 3px 12px rgba(0, 0, 0, 0.22));
    }

    .feed-image {
      filter: drop-shadow(1px 0 0 rgba(241, 236, 227, 0.46))
        drop-shadow(-1px 0 0 rgba(241, 236, 227, 0.46))
        drop-shadow(0 1px 0 rgba(241, 236, 227, 0.46))
        drop-shadow(0 -1px 0 rgba(241, 236, 227, 0.46));
    }
  }

  .day {
    position: relative;
    z-index: 1;
  }

  .day-header {
    display: flex;
    align-items: center;
    padding: 42px 0 15px;
    color: ${blogTokens.inkSoft};
    font-size: 0.9rem;
    font-variant-numeric: tabular-nums;
    font-weight: 650;
    letter-spacing: 0.035em;
  }

  .day-header::before {
    width: 8px;
    height: 8px;
    margin-right: 10px;
    border-radius: 52% 48% 43% 57%;
    background: ${blogTokens.accent};
    content: "";
    transform: rotate(12deg);
  }

  .day-header::after {
    flex: 1;
    height: 1px;
    margin-left: 14px;
    background: ${blogTokens.line};
    content: "";
  }

  .day-header .weekday {
    margin-left: 10px;
    color: ${blogTokens.inkDim};
    font-size: 0.76rem;
    font-weight: 400;
    letter-spacing: 0.06em;
  }

  /* 两类内容都像桌上的纸，但保留各自的重量。 */
  .post-card,
  .thought {
    background-color: ${blogTokens.card};
    background-image:
      linear-gradient(145deg, ${blogTokens.cardSheen}, transparent 45%), ${blogTokens.paperGrain};
    background-size:
      100% 100%,
      160px 160px;
    border: 1px solid ${blogTokens.line};
    box-shadow:
      inset 0 0 0 1px ${blogTokens.cardInset},
      0 5px 18px ${blogTokens.cardShadow};
  }

  .post-card {
    position: relative;
    display: block;
    margin: 12px 0;
    padding: 24px 27px 25px;
    border-radius: 13px 17px 14px 16px;
    color: inherit;
    text-decoration: none;
    transition:
      border-color 0.18s ease,
      box-shadow 0.18s ease,
      transform 0.18s ease;
  }

  .post-card:hover {
    border-color: ${blogTokens.postBorderHover};
    box-shadow:
      inset 0 0 0 1px ${blogTokens.cardInset},
      0 9px 24px ${blogTokens.cardShadowHover};
    transform: translateY(-2px);
  }

  .card-top {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 9px;
  }

  .kind {
    display: inline-flex;
    align-items: center;
    color: ${blogTokens.accent};
    font-size: 0.72rem;
    letter-spacing: 0.08em;
  }

  .kind::before {
    width: 7px;
    height: 7px;
    margin-right: 8px;
    border-radius: 55% 45% 48% 52%;
    background: ${blogTokens.accent};
    content: "";
  }

  .post-card .meta {
    color: ${blogTokens.inkDim};
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.025em;
    white-space: nowrap;
  }

  .post-card h3 {
    margin-bottom: 7px;
    font-size: 1.25rem;
    font-weight: 730;
    letter-spacing: -0.012em;
    line-height: 1.5;
  }

  .post-card .excerpt {
    display: -webkit-box;
    overflow: hidden;
    color: ${blogTokens.inkSoft};
    font-size: 0.92rem;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .thought {
    position: relative;
    margin: 11px 0;
    padding: 15px 20px 14px;
    border-color: ${blogTokens.thoughtBorder};
    border-radius: 16px 12px 15px 11px;
    background-color: ${blogTokens.thoughtCard};
    transition:
      border-color 0.18s ease,
      box-shadow 0.18s ease,
      transform 0.18s ease;
  }

  .thought:hover {
    border-color: ${blogTokens.thoughtBorderHover};
    box-shadow:
      inset 0 0 0 1px ${blogTokens.cardInset},
      0 7px 20px ${blogTokens.cardShadowHover};
    transform: translateY(-1px);
  }

  .thought .time {
    margin-bottom: 2px;
    color: ${blogTokens.inkDim};
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.06em;
  }

  .thought .time .t {
    text-decoration: underline;
    text-decoration-color: rgba(210, 75, 50, 0.5);
    text-decoration-thickness: 1.5px;
    text-underline-offset: 4px;
  }

  .thought .body {
    max-width: 35em;
    color: ${blogTokens.ink};
    font-size: 0.94rem;
  }

  .tags {
    margin-top: 7px;
    color: ${blogTokens.inkDim};
    font-size: 0.74rem;
    letter-spacing: 0.035em;
  }

  .tags span {
    margin-right: 12px;
  }

  .thought-link {
    display: block;
    color: inherit;
    text-decoration: none;
  }

  .thought:has(.thought-link) {
    cursor: pointer;
  }

  .post-card:focus-visible,
  .thought:focus-within {
    border-color: ${blogTokens.accent};
    outline: none;
    box-shadow:
      inset 0 0 0 1px ${blogTokens.cardInset},
      0 0 0 3px ${blogTokens.focusRing};
  }

  .thought-link:focus-visible {
    outline: none;
  }

  /* 过滤器是轻量控制，不再像出版物图例。 */
  .tag-filter {
    display: flex;
    flex-wrap: wrap;
    padding: 23px 0 2px;
    font-size: 0.79rem;
  }

  .tag-filter button {
    display: inline-flex;
    align-items: baseline;
    margin: 0 9px 9px 0;
    padding: 5px 13px;
    border: 1px solid ${blogTokens.line};
    border-radius: 999px;
    background: ${blogTokens.filterBg};
    color: ${blogTokens.inkSoft};
    cursor: pointer;
    font: inherit;
    letter-spacing: 0.03em;
    transition:
      color 0.15s ease,
      border-color 0.15s ease,
      background-color 0.15s ease,
      transform 0.15s ease;
  }

  .tag-filter button i {
    margin-left: 7px;
    font-size: 0.68rem;
    font-style: normal;
    font-variant-numeric: tabular-nums;
    opacity: 0.58;
  }

  .tag-filter button:hover {
    border-color: ${blogTokens.filterBorderHover};
    color: ${blogTokens.ink};
  }

  .tag-filter button.active {
    border-color: ${blogTokens.accent};
    background: ${blogTokens.accent};
    color: ${blogTokens.onAccent};
  }

  .tag-filter button:active {
    transform: translateY(1px);
  }

  /* 文章与想法详情。 */
  .post-head {
    padding: 68px 0 37px;
    border-bottom: 1px solid ${blogTokens.line};
  }

  .post-head h1 {
    margin: 13px 0 17px;
    font-size: clamp(1.65rem, 5vw, 2.1rem);
    font-weight: 750;
    letter-spacing: -0.025em;
    line-height: 1.42;
  }

  .post-head .meta {
    color: ${blogTokens.inkDim};
    font-size: 0.81rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.045em;
  }

  .prose {
    padding: 42px 0 16px;
    font-size: 0.98rem;
  }

  .prose p {
    margin-bottom: 1.65em;
  }

  .prose h2,
  .about h2 {
    margin: 2.5em 0 0.9em;
    font-size: 1.24rem;
    font-weight: 740;
    letter-spacing: -0.012em;
    line-height: 1.45;
  }

  .prose h2::before,
  .about h2::before {
    display: inline-block;
    width: 8px;
    height: 8px;
    margin-right: 9px;
    border-radius: 50%;
    background: ${blogTokens.accent};
    content: "";
    transform: translateY(-1px);
  }

  .prose h3 {
    margin: 2.1em 0 0.8em;
    font-size: 1.07rem;
    font-weight: 700;
  }

  .prose h4 {
    margin: 1.8em 0 0.7em;
    font-size: 1rem;
    font-weight: 680;
  }

  .prose strong,
  .about strong {
    font-weight: 680;
  }

  .prose ul,
  .prose ol {
    margin: 0 0 1.65em 1.4em;
  }

  .prose li {
    margin-bottom: 0.5em;
    padding-left: 3px;
  }

  .prose li::marker,
  .about li::marker {
    color: ${blogTokens.accent};
  }

  .prose blockquote {
    margin: 0 0 1.7em;
    padding: 14px 18px;
    border-left: 3px solid ${blogTokens.accent};
    border-radius: 0 12px 12px 0;
    background: ${blogTokens.quoteBg};
    color: ${blogTokens.inkSoft};
  }

  .prose blockquote > :last-child {
    margin-bottom: 0;
  }

  .prose code,
  .about code {
    padding: 2px 6px;
    border: 1px solid ${blogTokens.line};
    border-radius: 6px;
    background: ${blogTokens.codeBg};
    font-family: ${blogTokens.fontMono};
    font-size: 0.85em;
  }

  .prose pre {
    overflow-x: auto;
    margin-bottom: 1.7em;
    padding: 20px 23px;
    border-radius: 12px;
    background: ${blogTokens.preBg};
    color: ${blogTokens.preInk};
    font-size: 0.85rem;
    line-height: 1.7;
  }

  .prose pre code {
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
  }

  .prose img {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 2rem auto;
    border-radius: 13px 16px 12px 15px;
  }

  .prose figure {
    margin: 2rem 0;
  }

  .prose figure img {
    margin-bottom: 0.65rem;
  }

  .prose figcaption {
    color: ${blogTokens.inkDim};
    font-size: 0.78rem;
    text-align: center;
  }

  .prose table {
    display: block;
    width: max-content;
    max-width: 100%;
    overflow-x: auto;
    margin: 0 0 1.7em;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  .prose th,
  .prose td {
    min-width: 7rem;
    padding: 9px 12px;
    border-bottom: 1px solid ${blogTokens.line};
    text-align: left;
    vertical-align: top;
  }

  .prose th {
    color: ${blogTokens.ink};
    font-weight: 680;
  }

  .prose mark {
    padding: 0 0.15em;
    background: color-mix(in srgb, ${blogTokens.markerYellow} 48%, transparent);
    color: inherit;
  }

  .prose kbd {
    padding: 2px 6px;
    border: 1px solid ${blogTokens.line};
    border-bottom-width: 2px;
    border-radius: 5px;
    background: ${blogTokens.codeBg};
    font-family: ${blogTokens.fontMono};
    font-size: 0.82em;
  }

  .mdx-callout {
    margin: 0 0 1.7em;
    padding: 15px 18px;
    border: 1px solid ${blogTokens.line};
    border-left: 4px solid ${blogTokens.doodleBlue};
    border-radius: 4px 13px 13px 4px;
    background: color-mix(in srgb, ${blogTokens.doodleBlue} 8%, ${blogTokens.card});
  }

  .mdx-callout-warning {
    border-left-color: ${blogTokens.markerYellow};
    background: color-mix(in srgb, ${blogTokens.markerYellow} 9%, ${blogTokens.card});
  }

  .mdx-callout > :last-child {
    margin-bottom: 0;
  }

  .prose hr {
    position: relative;
    height: 1px;
    margin: 3em 0;
    border: 0;
    background: ${blogTokens.line};
  }

  .prose hr::after {
    position: absolute;
    top: -4px;
    left: 50%;
    width: 9px;
    height: 9px;
    margin-left: -4.5px;
    border-radius: 48% 52% 56% 44%;
    background: ${blogTokens.accent};
    content: "";
  }

  .prose a,
  .about a {
    color: ${blogTokens.ink};
    text-decoration-color: ${blogTokens.accent};
    text-decoration-thickness: 1px;
    text-underline-offset: 4px;
    transition: color 0.15s;
  }

  .prose a:hover,
  .about a:hover {
    color: ${blogTokens.accent};
  }

  .related-thoughts {
    position: relative;
    margin: 30px 0 52px;
    padding: 26px 24px 14px;
    border: 1px solid ${blogTokens.line};
    border-radius: 16px 13px 17px 12px;
    background: ${blogTokens.relatedBg};
  }

  .related-thoughts h2 {
    position: absolute;
    top: -0.72em;
    left: 18px;
    padding: 0 9px;
    background: ${blogTokens.bg};
    color: ${blogTokens.inkDim};
    font-size: 0.77rem;
    font-weight: 400;
    letter-spacing: 0.08em;
  }

  .post-nav {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    padding: 31px 0 76px;
    border-top: 1px solid ${blogTokens.line};
  }

  .post-nav a {
    max-width: 48%;
    color: ${blogTokens.ink};
    font-size: 0.91rem;
    font-weight: 680;
    text-decoration: none;
  }

  .post-nav a .label,
  .post-nav .label {
    display: block;
    margin-bottom: 5px;
    color: ${blogTokens.inkDim};
    font-size: 0.72rem;
    font-weight: 400;
    letter-spacing: 0.08em;
  }

  .post-nav a:hover {
    color: ${blogTokens.accent};
  }

  .post-nav .next {
    margin-left: auto;
    text-align: right;
  }

  /* 索引页与关于页。 */
  .listing,
  .about,
  .skills-index,
  .skill-page {
    padding: 60px 0 88px;
  }

  .listing-head {
    margin-bottom: 27px;
    padding-bottom: 23px;
    border-bottom: 1px solid ${blogTokens.line};
  }

  .listing-head h1,
  .about h1 {
    margin: 12px 0 9px;
    font-size: 1.58rem;
    font-weight: 740;
    letter-spacing: -0.02em;
  }

  .listing-head p {
    color: ${blogTokens.inkSoft};
    font-size: 0.92rem;
  }

  .post-list .post-card,
  .thought-list .thought {
    margin: 13px 0;
  }

  .empty-state {
    padding: 28px 0 78px;
    color: ${blogTokens.inkDim};
  }

  .about .avatar {
    position: relative;
    width: 112px;
    height: 98px;
    margin: -4px 0 27px;
  }

  .about .avatar::before {
    position: absolute;
    inset: 9px 4px 2px 8px;
    border-radius: 52% 48% 46% 54%;
    background: ${blogTokens.accentSoft};
    content: "";
    transform: rotate(-7deg);
  }

  .about .avatar img {
    position: relative;
    z-index: 1;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .about .avatar-initial {
    position: relative;
    z-index: 1;
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    color: ${blogTokens.ink};
    font-size: 48px;
    font-family: ${blogTokens.fontSans};
    font-weight: 600;
  }

  .about h1 {
    margin-bottom: 20px;
  }

  .about p {
    margin-bottom: 1.4em;
  }

  .about ul {
    margin: 0 0 1.6em 1.4em;
  }

  .about li {
    margin-bottom: 0.5em;
    padding-left: 3px;
  }

  .about .contact-list {
    margin-left: 0;
    list-style: none;
  }

  .about .contact-list li {
    padding-left: 0;
    border-bottom: 1px solid ${blogTokens.line};
  }

  .about .contact-list a {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 13px 0;
    font-size: 0.92rem;
    text-decoration: none;
  }

  .about .contact-list .k {
    color: ${blogTokens.inkDim};
    font-size: 0.79rem;
    letter-spacing: 0.06em;
  }

  /* Skills：用目录和文档的语义区分内容，不把它做成产品陈列。 */
  .skills-head {
    margin-bottom: 33px;
  }

  .skill-path,
  .skill-card-path,
  .skill-files li {
    font-family: ${blogTokens.fontMono};
  }

  .skill-path {
    color: ${blogTokens.accent};
    font-size: 0.76rem;
    letter-spacing: 0.02em;
  }

  .skills-head h1 {
    margin: 8px 0 9px;
    font-size: 1.72rem;
    font-weight: 740;
    letter-spacing: -0.025em;
  }

  .skills-head p {
    max-width: 570px;
    color: ${blogTokens.inkSoft};
    font-size: 0.93rem;
  }

  .skill-list {
    display: grid;
    gap: 17px;
  }

  .skill-group + .skill-group {
    margin-top: 46px;
  }

  .skill-group-head {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 17px;
    padding-bottom: 10px;
    border-bottom: 1px solid ${blogTokens.line};
  }

  .skill-group-head h2 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 680;
  }

  .skill-group-head small {
    display: block;
    margin-top: 4px;
    color: ${blogTokens.inkDim};
    font-size: 0.7rem;
  }

  .skill-group-head > span {
    color: ${blogTokens.inkDim};
    font-family: ${blogTokens.fontMono};
    font-size: 0.68rem;
  }

  .skill-group-empty {
    margin: 0;
    padding: 22px 20px;
    border: 1px dashed ${blogTokens.line};
    border-radius: 10px;
    color: ${blogTokens.inkDim};
    font-size: 0.8rem;
  }

  .skill-card {
    position: relative;
    display: grid;
    gap: 16px;
    padding: 24px 24px 19px;
    border: 1px solid ${blogTokens.line};
    border-radius: 5px 14px 14px;
    background-color: ${blogTokens.card};
    background-image: ${blogTokens.paperGrain};
    background-size: 160px 160px;
    box-shadow: 0 6px 20px ${blogTokens.cardShadow};
    color: ${blogTokens.ink};
    text-decoration: none;
    transition:
      border-color 0.18s ease,
      box-shadow 0.18s ease,
      transform 0.18s ease;
  }

  .skill-card::before {
    position: absolute;
    top: -7px;
    left: 17px;
    width: 74px;
    height: 7px;
    border: 1px solid ${blogTokens.line};
    border-bottom: 0;
    border-radius: 7px 7px 0 0;
    background-color: ${blogTokens.card};
    background-image: ${blogTokens.paperGrain};
    content: "";
  }

  .skill-card:hover {
    border-color: ${blogTokens.postBorderHover};
    box-shadow: 0 10px 28px ${blogTokens.cardShadowHover};
    transform: translateY(-2px);
  }

  .skill-card:hover::before {
    border-color: ${blogTokens.postBorderHover};
  }

  .skill-card-source {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .skill-card-path {
    color: ${blogTokens.inkDim};
    font-size: 0.7rem;
  }

  .skill-scope-badge {
    display: inline-flex;
    flex: none;
    align-items: center;
    padding: 2px 7px;
    border: 1px solid ${blogTokens.line};
    border-radius: 999px;
    background: ${blogTokens.accentSoft};
    color: ${blogTokens.accent};
    font-size: 0.61rem;
    font-weight: 610;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }

  .project-skill::before {
    border-style: dashed;
    border-bottom: 0;
  }

  .skill-card-main {
    display: grid;
    gap: 6px;
  }

  .skill-card-main strong {
    font-size: 1.08rem;
    font-weight: 710;
    letter-spacing: -0.01em;
  }

  .skill-card-main > span {
    color: ${blogTokens.inkSoft};
    font-size: 0.88rem;
    line-height: 1.75;
  }

  .skill-card-foot {
    display: flex;
    justify-content: space-between;
    padding-top: 12px;
    border-top: 1px dashed ${blogTokens.line};
    color: ${blogTokens.inkDim};
    font-size: 0.73rem;
  }

  .skill-open {
    color: ${blogTokens.inkSoft};
    transition: color 0.15s ease;
  }

  .skill-card:hover .skill-open {
    color: ${blogTokens.accent};
  }

  .skills-prototype-note {
    margin-top: 22px;
    color: ${blogTokens.inkDim};
    font-size: 0.72rem;
  }

  .skill-back {
    display: inline-block;
    margin-bottom: 28px;
    color: ${blogTokens.inkDim};
    font-size: 0.78rem;
    text-decoration: none;
  }

  .skill-back:hover {
    color: ${blogTokens.accent};
  }

  .skill-browser-head {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    padding: 9px 10px 9px 13px;
    border: 1px solid ${blogTokens.line};
    border-radius: 9px;
    background: ${blogTokens.relatedBg};
  }

  .skill-browser-head code {
    min-width: 0;
    color: ${blogTokens.inkSoft};
    font-family: ${blogTokens.fontMono};
    font-size: 0.67rem;
    overflow-x: auto;
    scrollbar-width: none;
    white-space: nowrap;
  }

  .skill-command {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 9px;
  }

  .skill-browser-head code::-webkit-scrollbar {
    display: none;
  }

  .skill-browser-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .skill-browser-actions button,
  .skill-browser-actions a {
    min-width: 42px;
    padding: 3px 7px;
    border: 1px solid ${blogTokens.line};
    border-radius: 6px;
    background: ${blogTokens.card};
    color: ${blogTokens.inkSoft};
    font: inherit;
    font-size: 0.65rem;
    line-height: 1.65;
    text-align: center;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
  }

  .skill-browser-actions button:hover,
  .skill-browser-actions a:hover {
    border-color: ${blogTokens.postBorderHover};
    color: ${blogTokens.accent};
  }

  .skill-stage {
    border: 1px solid ${blogTokens.line};
    border-radius: 13px;
    background-color: ${blogTokens.card};
    background-image: ${blogTokens.paperGrain};
    background-size: 160px 160px;
    box-shadow: 0 8px 28px ${blogTokens.cardShadow};
    overflow: clip;
  }

  .skill-stage [hidden] {
    display: none;
  }

  .skill-view-tabs {
    display: flex;
    gap: 20px;
    padding: 0 17px;
    border-bottom: 1px solid ${blogTokens.line};
  }

  .skill-view-tabs button {
    position: relative;
    padding: 11px 1px 9px;
    border: 0;
    background: transparent;
    color: ${blogTokens.inkDim};
    font: inherit;
    font-size: 0.75rem;
    cursor: pointer;
  }

  .skill-view-tabs button[aria-pressed="true"] {
    color: ${blogTokens.ink};
  }

  .skill-view-tabs button[aria-pressed="true"]::after {
    position: absolute;
    right: 0;
    bottom: -1px;
    left: 0;
    height: 2px;
    border-radius: 2px;
    background: ${blogTokens.accent};
    content: "";
  }

  .skill-browser {
    display: grid;
    grid-template-columns: 185px minmax(0, 1fr);
    align-items: start;
    min-height: 500px;
  }

  .skill-viewer {
    min-width: 0;
    border-left: 1px solid ${blogTokens.line};
  }

  .skill-viewer-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: 42px;
    padding: 0 18px;
    border-bottom: 1px solid ${blogTokens.line};
    color: ${blogTokens.inkDim};
    font-family: ${blogTokens.fontMono};
    font-size: 0.64rem;
  }

  .skill-viewer-bar span:last-child {
    color: ${blogTokens.inkFaint};
    font-size: 0.6rem;
    text-transform: uppercase;
  }

  .skill-file-panel {
    padding: 25px 28px 44px;
  }

  .skill-file-panel[hidden] {
    display: none;
  }

  .skill-file-panel h1 {
    margin-top: 0;
    font-size: 1.5rem;
  }

  .skill-file-panel h2 {
    font-size: 1.05rem;
  }

  .skill-files {
    padding: 15px 12px 24px;
    background: ${blogTokens.relatedBg};
  }

  .skill-files-label {
    display: block;
    margin: 0 7px 12px;
    color: ${blogTokens.inkDim};
    font-size: 0.62rem;
    font-weight: 560;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .skill-files ul {
    margin: 0;
    list-style: none;
  }

  .skill-files .folder > ul {
    margin-left: 7px;
    padding-left: 8px;
    border-left: 1px solid ${blogTokens.line};
  }

  .skill-files li {
    padding: 0;
    color: ${blogTokens.inkDim};
    font-size: 0.65rem;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }

  .skill-files .folder > span {
    display: block;
    padding: 5px 7px 2px;
    color: ${blogTokens.inkSoft};
  }

  .skill-files button {
    width: 100%;
    padding: 6px 7px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: ${blogTokens.inkDim};
    font: inherit;
    line-height: inherit;
    text-align: left;
    overflow-wrap: anywhere;
    cursor: pointer;
    transition:
      background 0.15s ease,
      color 0.15s ease;
  }

  .skill-files button:hover {
    background: ${blogTokens.accentSoft};
    color: ${blogTokens.ink};
  }

  .skill-files button.active {
    background: ${blogTokens.accentSoft};
    color: ${blogTokens.accent};
  }

  .skill-relations {
    min-height: 0;
  }

  .skill-reading-summary {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-bottom: 1px solid ${blogTokens.line};
    background: ${blogTokens.relatedBg};
  }

  .skill-reading-summary span {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 2px;
    padding: 12px 16px 11px;
    border-right: 1px solid ${blogTokens.line};
    color: ${blogTokens.inkDim};
    font-size: 0.65rem;
  }

  .skill-reading-summary span:last-child {
    border-right: 0;
  }

  .skill-reading-summary strong {
    color: ${blogTokens.ink};
    font-family: ${blogTokens.fontMono};
    font-size: 0.82rem;
    font-weight: 620;
  }

  .skill-reading-summary .has-issue strong {
    color: ${blogTokens.accent};
  }

  .skill-graph-canvas {
    display: grid;
    min-height: 310px;
    place-items: center;
    padding: 26px 20px;
    background: radial-gradient(circle at 50% 45%, ${blogTokens.heroWash}, transparent 44%);
  }

  .skill-graph-canvas.compact {
    min-height: 245px;
  }

  .skill-graph-svg {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }

  .skill-graph-tb {
    display: none;
  }

  .skill-graph-edge {
    fill: none;
    stroke: ${blogTokens.inkFaint};
    stroke-width: 1.2;
    vector-effect: non-scaling-stroke;
  }

  .skill-graph-edge.external {
    stroke-dasharray: 4 4;
  }

  .skill-graph-arrow {
    fill: ${blogTokens.inkFaint};
  }

  .skill-graph-edge-label rect {
    fill: ${blogTokens.card};
    opacity: 0.94;
  }

  .skill-graph-edge-label text {
    fill: ${blogTokens.inkDim};
    font-size: 11px;
    text-anchor: middle;
  }

  .skill-graph-node {
    color: ${blogTokens.ink};
    text-decoration: none;
  }

  .skill-graph-node rect {
    fill: ${blogTokens.card};
    stroke: ${blogTokens.line};
    stroke-width: 1;
    transition:
      fill 0.16s ease,
      stroke 0.16s ease;
  }

  .skill-graph-node.external rect {
    fill: ${blogTokens.thoughtCard};
    stroke-dasharray: 4 3;
  }

  .skill-graph-node.unreferenced rect {
    fill: ${blogTokens.relatedBg};
    stroke-dasharray: 3 4;
  }

  .skill-graph-node.missing rect {
    fill: ${blogTokens.accentSoft};
    stroke: ${blogTokens.accent};
    stroke-dasharray: 3 3;
  }

  .skill-graph-node:hover rect,
  .skill-graph-node.active rect {
    fill: ${blogTokens.accentSoft};
    stroke: ${blogTokens.accent};
  }

  .skill-graph-node text {
    pointer-events: none;
    text-anchor: middle;
  }

  .skill-graph-node-name {
    fill: ${blogTokens.ink};
    font-family: ${blogTokens.fontMono};
    font-size: 11px;
    font-weight: 650;
  }

  .skill-graph-node-role {
    fill: ${blogTokens.inkDim};
    font-size: 11px;
  }

  .skill-graph-status {
    min-height: 44px;
    padding: 11px 17px;
    border-top: 1px solid ${blogTokens.line};
    color: ${blogTokens.inkSoft};
    font-size: 0.76rem;
  }

  .skill-graph-status code {
    color: ${blogTokens.accent};
    font-family: ${blogTokens.fontMono};
  }

  .skill-reading-empty {
    padding: 42px 28px 46px;
    border-bottom: 1px solid ${blogTokens.line};
  }

  .skill-reading-empty strong,
  .skill-reading-issues > strong,
  .skill-reading-paths h3 {
    color: ${blogTokens.ink};
    font-size: 0.82rem;
    font-weight: 640;
  }

  .skill-reading-empty p {
    max-width: 520px;
    margin: 9px 0 0;
    color: ${blogTokens.inkSoft};
    font-size: 0.78rem;
    line-height: 1.8;
  }

  .skill-reading-empty code,
  .skill-reading-issues code,
  .skill-reading-edge code {
    font-family: ${blogTokens.fontMono};
  }

  .skill-reading-paths {
    padding: 19px 18px 20px;
    border-top: 1px solid ${blogTokens.line};
  }

  .skill-reading-paths h3 {
    margin: 0 0 12px;
  }

  .skill-reading-paths ol {
    display: grid;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .skill-reading-paths li {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: 16px;
    align-items: center;
    padding: 10px 12px;
    border: 1px solid ${blogTokens.line};
    border-radius: 8px;
    background: ${blogTokens.relatedBg};
  }

  .skill-reading-paths li.unreachable {
    border-style: dashed;
    opacity: 0.72;
  }

  .skill-reading-edge {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 8px;
    color: ${blogTokens.ink};
    font-size: 0.68rem;
  }

  .skill-reading-edge code {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .skill-reading-edge > span {
    color: ${blogTokens.accent};
  }

  .skill-reading-context {
    display: grid;
    gap: 2px;
    color: ${blogTokens.inkDim};
    font-size: 0.68rem;
    line-height: 1.55;
  }

  .skill-reading-issues {
    padding: 17px 18px 18px;
    border-top: 1px solid ${blogTokens.line};
    background: ${blogTokens.accentSoft};
  }

  .skill-reading-issues p {
    display: flex;
    flex-wrap: wrap;
    gap: 5px 8px;
    margin: 8px 0 0;
    color: ${blogTokens.inkSoft};
    font-size: 0.72rem;
    line-height: 1.6;
  }

  .skill-reading-issues code {
    color: ${blogTokens.accent};
  }

  .github-link {
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr) 28px;
    align-items: center;
    gap: 13px;
    max-width: 390px;
    margin-top: 0.35rem;
    padding: 13px 15px 13px 12px;
    border: 1px solid ${blogTokens.line};
    border-radius: 15px 12px 16px 13px;
    background-color: ${blogTokens.card};
    background-image: ${blogTokens.paperGrain};
    background-size: 160px 160px;
    box-shadow: 0 5px 18px ${blogTokens.cardShadow};
    color: ${blogTokens.ink};
    text-decoration: none;
    transition:
      border-color 0.18s ease,
      box-shadow 0.18s ease,
      transform 0.18s ease;
  }

  .github-icon {
    display: block;
    width: 52px;
    height: 52px;
    color: ${blogTokens.ink};
    overflow: visible;
    transition: transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .github-icon-ring {
    fill: ${blogTokens.accentSoft};
    stroke: ${blogTokens.ink};
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .github-icon-cat {
    fill: currentColor;
  }

  .github-icon-face {
    fill: none;
    stroke: ${blogTokens.card};
    stroke-width: 2.1;
    stroke-linecap: round;
  }

  .github-copy {
    display: flex;
    min-width: 0;
    flex-direction: column;
    line-height: 1.35;
  }

  .github-copy > span {
    color: ${blogTokens.inkDim};
    font-size: 0.73rem;
    letter-spacing: 0.06em;
  }

  .github-copy strong {
    overflow: hidden;
    font-size: 0.98rem;
    font-weight: 650;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .external-arrow {
    width: 27px;
    height: 27px;
    fill: none;
    stroke: ${blogTokens.accent};
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: transform 0.18s ease;
  }

  .github-link:hover,
  .github-link:focus-visible {
    border-color: ${blogTokens.postBorderHover};
    outline: none;
    box-shadow:
      0 8px 24px ${blogTokens.cardShadowHover},
      0 0 0 3px ${blogTokens.focusRing};
    transform: translateY(-2px);
  }

  .github-link:hover .github-icon,
  .github-link:focus-visible .github-icon {
    transform: rotate(-4deg) scale(1.04);
  }

  .github-link:hover .external-arrow,
  .github-link:focus-visible .external-arrow {
    transform: translate(2px, -2px);
  }

  footer.site {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 27px 0 53px;
    border-top: 1px solid ${blogTokens.line};
    color: ${blogTokens.inkDim};
    font-size: 0.79rem;
    letter-spacing: 0.025em;
  }

  footer.site .brand {
    display: inline-flex;
    align-items: center;
  }

  footer.site .brand::before {
    width: 7px;
    height: 7px;
    margin-right: 8px;
    border-radius: 50%;
    background: ${blogTokens.accent};
    content: "";
  }

  footer.site a {
    color: ${blogTokens.inkSoft};
    text-decoration: none;
    transition: color 0.15s;
  }

  footer.site a:hover {
    color: ${blogTokens.accent};
  }

  @media (prefers-reduced-motion: no-preference) {
    @keyframes rise {
      from {
        opacity: 0;
        translate: 0 10px;
      }
      to {
        opacity: 1;
        translate: none;
      }
    }

    @keyframes cat-in {
      from {
        opacity: 0;
        translate: 0 9px;
      }
      to {
        opacity: 1;
        translate: none;
      }
    }

    @keyframes fade {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    header.site {
      animation: rise 0.55s cubic-bezier(0.22, 0.61, 0.36, 1) both;
    }

    .hero-copy {
      animation: rise 0.58s 0.06s cubic-bezier(0.22, 0.61, 0.36, 1) both;
    }

    .hero-doodle {
      animation: rise 0.62s 0.14s cubic-bezier(0.22, 0.61, 0.36, 1) both;
    }

    .hero-image {
      animation: cat-in 0.58s 0.23s cubic-bezier(0.22, 0.61, 0.36, 1) both;
    }

    .tag-filter {
      animation: rise 0.58s 0.12s cubic-bezier(0.22, 0.61, 0.36, 1) both;
    }

    .feed-decor,
    footer.site {
      animation: fade 0.7s 0.28s both;
    }

    .day.in > * {
      animation: rise 0.52s cubic-bezier(0.22, 0.61, 0.36, 1) backwards;
    }

    .day.in > *:nth-child(2) {
      animation-delay: 0.08s;
    }

    .day.in > *:nth-child(3) {
      animation-delay: 0.14s;
    }

    .day.in > *:nth-child(4) {
      animation-delay: 0.2s;
    }

    .day.in > *:nth-child(n + 5) {
      animation-delay: 0.26s;
    }

    .post-head,
    .listing-head,
    .skills-head,
    .skill-browser-head {
      animation: rise 0.58s cubic-bezier(0.22, 0.61, 0.36, 1) both;
    }

    .prose {
      animation: rise 0.58s 0.1s cubic-bezier(0.22, 0.61, 0.36, 1) both;
    }

    .related-thoughts {
      animation: rise 0.58s 0.18s cubic-bezier(0.22, 0.61, 0.36, 1) both;
    }

    .about > * {
      animation: rise 0.52s cubic-bezier(0.22, 0.61, 0.36, 1) both;
    }

    .about > *:nth-child(2) {
      animation-delay: 0.05s;
    }

    .about > *:nth-child(3) {
      animation-delay: 0.1s;
    }

    .about > *:nth-child(n + 4) {
      animation-delay: 0.15s;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      scroll-behavior: auto !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  @media (max-width: 720px) {
    .feed-image {
      right: 0;
      width: 280px;
    }

    .paw-trail {
      right: 210px;
    }

    .skill-browser {
      grid-template-columns: 1fr;
    }

    .skill-files {
      padding-bottom: 16px;
      border-bottom: 1px solid ${blogTokens.line};
    }

    .skill-viewer {
      border-left: 0;
    }
  }

  @media (max-width: 560px) {
    .container {
      padding: 0 21px;
    }

    header.site {
      padding-top: 35px;
    }

    nav.site-nav {
      gap: 18px;
    }

    .hero {
      grid-template-columns: 1fr;
      min-height: 390px;
      margin-top: 5px;
    }

    .hero::before {
      top: 154px;
      right: -44px;
      width: 225px;
      height: 205px;
    }

    .hero-copy {
      padding: 35px 0 3px;
    }

    .hero-copy h1 {
      font-size: 1.82rem;
    }

    .hero-work {
      min-height: 225px;
      justify-content: center;
    }

    .hero-doodle {
      width: 225px;
      transform: translateX(-16px) rotate(-1deg);
    }

    .hero-image {
      right: 1%;
      bottom: 17px;
      width: 98px;
    }

    .tag-filter {
      padding-top: 16px;
    }

    .day-header {
      padding-top: 36px;
    }

    .post-card {
      padding: 20px 20px 21px;
    }

    .post-card .meta {
      white-space: normal;
      text-align: right;
    }

    .feed-decor {
      height: 150px;
      margin-top: 38px;
    }

    .feed-image {
      right: 0;
      width: 246px;
    }

    .yarn-doodle {
      bottom: 4px;
      left: 2px;
      width: 58px;
      opacity: 0.42;
    }

    .paw-trail {
      right: 176px;
      bottom: 44px;
      width: 82px;
      opacity: 0.12;
    }

    .post-head {
      padding: 50px 0 31px;
    }

    .related-thoughts {
      padding: 22px 17px 10px;
    }

    .post-nav {
      flex-direction: column;
    }

    .post-nav a,
    .post-nav > span {
      max-width: 100%;
    }

    .github-link {
      max-width: none;
    }

    .listing,
    .about,
    .skills-index,
    .skill-page {
      padding-top: 48px;
    }

    .skill-card {
      gap: 14px;
      padding: 22px 19px 17px;
    }

    .skill-group-head {
      align-items: flex-start;
    }

    .skill-group-head > span {
      padding-top: 2px;
    }

    .skill-browser-head {
      grid-template-columns: 1fr;
    }

    .skill-browser-actions {
      justify-content: flex-end;
    }

    .skill-file-panel {
      padding: 23px 19px 38px;
    }

    .skill-relations {
      min-height: 0;
    }

    .skill-reading-summary {
      grid-template-columns: repeat(2, 1fr);
    }

    .skill-reading-summary span:nth-child(2) {
      border-right: 0;
    }

    .skill-reading-summary span:nth-child(-n + 2) {
      border-bottom: 1px solid ${blogTokens.line};
    }

    .skill-graph-canvas {
      min-height: 0;
      padding: 23px 10px;
    }

    .skill-reading-empty {
      padding: 30px 18px 34px;
    }

    .skill-reading-paths {
      padding: 18px 14px;
    }

    .skill-reading-paths li {
      grid-template-columns: 1fr;
      gap: 5px;
    }

    .skill-reading-edge {
      align-items: flex-start;
    }

    .skill-reading-edge code {
      white-space: normal;
      overflow-wrap: anywhere;
      text-overflow: clip;
    }

    .skill-reading-issues {
      padding: 16px 14px 17px;
    }

    .skill-graph-lr {
      display: none;
    }

    .skill-graph-tb {
      display: block;
    }

    footer.site {
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 15px;
    }
  }

  @media (max-width: 360px) {
    .card-top {
      align-items: flex-start;
      flex-direction: column;
      gap: 3px;
    }

    .post-card .meta {
      text-align: left;
    }

    .hero-doodle {
      width: 205px;
    }

    .hero-image {
      right: -2%;
      width: 91px;
    }

    .github-link {
      grid-template-columns: 46px minmax(0, 1fr) 24px;
      gap: 10px;
    }

    .github-icon {
      width: 46px;
      height: 46px;
    }
  }
`;

/** Static HTML owns the theme root; CSS remains available without JavaScript. */
const definition = defineTheme({
  options: blogOptions,
  defaults: { scheme: "auto" },
  tokens: [blogTokens],
  styles,
});
// CSS imports must precede the generated token declarations. Bun resolves and emits font assets.
export const blogTheme = Object.freeze({
  ...definition,
  cssText: `@import "@fontsource-variable/geist";\n${definition.cssText}`,
});
