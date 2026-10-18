import { presentationTokens } from "meowslides/theme";

// Content design belongs to this work; stage/navigation remain in Meowtail.
export const talkCss = `
html, body { margin: 0; background: #e8ece8; color: #163f3a; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
body { min-width: 320px; }
#app { height: 100dvh; }
.preview-shell { height: 100%; display: grid; grid-template-rows: auto minmax(0, 1fr); }
.image-talk { --talk-ink: #163f3a; --talk-muted: #536c65; --talk-paper: #f5f4ea; --talk-accent: #d85b37; color: var(--talk-ink); ${presentationTokens.paper.name}: var(--talk-paper); ${presentationTokens.ink.name}: var(--talk-ink); ${presentationTokens.muted.name}: var(--talk-muted); ${presentationTokens.accent.name}: var(--talk-accent); }
.image-talk .eyebrow { margin: 0; color: var(--talk-accent); text-transform: uppercase; letter-spacing: .14em; font-size: 16px; font-weight: 750; }
.image-talk .talk-title { color: var(--talk-ink); margin: 12px 0 20px; font-size: 64px; max-width: 760px; letter-spacing: -.045em; line-height: 1.04; }
.image-talk .talk-heading { color: var(--talk-ink); margin: 8px 0 20px; font-size: 46px; letter-spacing: -.035em; line-height: 1.1; }
.image-talk .talk-copy { margin: 0; font-size: 25px; line-height: 1.4; color: var(--talk-muted); max-width: 720px; }
.image-talk .fine-print { margin: 0; font-size: 16px; line-height: 1.45; color: var(--talk-muted); }
.image-talk figure { margin: 0; }
.image-talk .coast-image { display: block; width: 100%; overflow: hidden; border-radius: 10px; aspect-ratio: 11 / 7; background: #a9c7be; }
.image-talk .coast-image img { width: 100%; height: 100%; object-fit: cover; }
.image-talk .opening-image { width: 440px; height: 414px; border-radius: 100px 8px 8px 8px; }
.image-talk .opening-image img { object-position: 66% 50%; }
.image-talk figcaption { margin-top: 10px; font-size: 16px; color: var(--talk-muted); }
.image-talk .stat { display: block; font-variant-numeric: tabular-nums; font-size: 54px; font-weight: 700; letter-spacing: -.04em; line-height: 1.1; }
.image-talk .stat.accent { color: var(--talk-accent); }
.image-talk .metric-label { font-size: 17px; color: var(--talk-muted); margin: 0; }
.image-talk .experiment-panel { background: #e5ece3; padding: 26px; border-radius: 14px; }
.image-talk .speed-label { display: block; font-size: 20px; font-weight: 650; margin-bottom: 10px; }
.image-talk input[type=range] { width: 100%; accent-color: var(--talk-accent); margin: 20px 0 6px; cursor: pointer; }
.image-talk .speed-endpoints { display: flex; justify-content: space-between; font-size: 15px; color: var(--talk-muted); }
.image-talk .estimate { margin-top: 16px; padding-top: 18px; border-top: 1px solid #bbcfc4; }
.image-talk .estimate output { display: block; margin-top: 5px; font-size: 30px; font-weight: 700; font-variant-numeric: tabular-nums; }
.image-talk .transfer-track { height: 16px; width: 100%; overflow: hidden; border-radius: 12px; background: #d6e3da; margin: 8px 0 16px; }
.image-talk .transfer-fill { height: 100%; background: var(--talk-accent); border-radius: inherit; }
.image-talk .transfer-fill.delivery { background: #326a5a; }
.image-talk .transfer-name { display: flex; justify-content: space-between; font-size: 17px; }
.image-talk .formula { font-size: 20px; padding: 14px 20px; background: #e5ece3; border-left: 4px solid #346d5b; border-radius: 0 8px 8px 0; margin: 0; }
.image-talk .evidence-video { display: block; width: 100%; border-radius: 10px; }
.image-talk .evidence-video video { max-height: 260px; object-fit: contain; background: #163f3a; }
.image-talk .video-caption { font-size: 16px; line-height: 1.45; }
.image-talk .result-line { font-size: 32px; line-height: 1.35; letter-spacing: -.02em; margin: 0; }
.image-talk .result-line strong { color: var(--talk-accent); }
.image-talk .source-list { font-size: 20px; line-height: 1.5; padding-left: 22px; }
.image-talk .talk-actions { font-size: 16px; }
.image-talk .preview-gate { padding: 12px 20px; background: #fff3d7; display: flex; gap: 16px; align-items: center; font-size: 15px; }
.image-talk .music-copy { font-size: 24px; line-height: 1.5; }
@media (prefers-reduced-motion: reduce) { .image-talk *, .image-talk *::before, .image-talk *::after { scroll-behavior: auto; } }
`;
