import { presentationTokens } from "meowtail/theme";

export const lessonCss = `
html,body{margin:0;min-width:320px;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#e7ece6;color:#203c32}#app{height:100dvh}
.panda-lesson{${presentationTokens.paper.name}:#fbf8ed;${presentationTokens.ink.name}:#203c32;${presentationTokens.muted.name}:#53685b;${presentationTokens.accent.name}:#a16f26}
.panda-lesson .panda-kicker{font-size:15px;line-height:1.2;text-transform:uppercase;letter-spacing:.14em;font-weight:750;color:#89682f;margin:0 0 12px}
.panda-lesson .panda-title{font-size:78px;line-height:1.02;letter-spacing:-.055em;margin:12px 0 26px;max-width:680px}
.panda-lesson .panda-title em{font-style:normal;color:#a16f26}
.panda-lesson .panda-heading{font-size:43px;line-height:1.1;letter-spacing:-.035em;margin:0 0 12px}
.panda-lesson .panda-question{font-size:23px;line-height:1.35;margin:0;max-width:930px;color:#466253}
.panda-lesson .panda-lead{font-size:28px;line-height:1.4;margin:0;max-width:680px}
.panda-lesson .panda-caption{font-size:14px;line-height:1.4;color:#617063;margin:0}
.panda-lesson .panda-hero{width:100%;height:360px;object-fit:cover;border-radius:48% 48% 24px 24px}
.panda-lesson .panda-image-note{font-size:13px;line-height:1.35;color:#617063;margin:10px 0 0}
.panda-lesson .panda-reading{min-width:0;padding:16px 20px;border-left:4px solid #9dad8b;background:#eef0e3;border-radius:0 18px 18px 0}
.panda-lesson .panda-reading h3{font-size:13px;line-height:1.2;letter-spacing:.11em;text-transform:uppercase;color:#68704f;margin:0 0 14px}
.panda-lesson blockquote{font-size:20px;line-height:1.4;margin:0 0 12px}
.panda-lesson blockquote:last-child{margin-bottom:0}
.panda-lesson .panda-source-id{font-size:12px;font-weight:750;color:#6e7448;display:inline;margin-right:8px}
.panda-lesson blockquote span[data-evidence=true]{background:#ffe4a3;box-shadow:0 3px 0 #ba8b35;border-radius:3px}
.panda-lesson .panda-options{display:grid;gap:12px;min-width:0;align-content:start}
.panda-lesson .panda-options[data-compact=true]{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.panda-lesson .panda-option{box-sizing:border-box;width:100%;min-width:0;text-align:left;background:#f4f1e5;color:#203c32;border:2px solid #d8dcc8;border-radius:18px;padding:14px 18px;font-size:22px;font-weight:650;line-height:1.25;font-family:inherit;cursor:pointer;display:flex;align-items:center;gap:12px}
.panda-lesson .panda-option-title{font-size:22px;line-height:1.25;display:block}
.panda-lesson .panda-option-detail{display:block;font-size:16px;font-weight:450;line-height:1.3;margin-top:6px;color:#52664f}
.panda-lesson .panda-option-mark{flex:none;width:24px;font-size:22px;text-align:center;color:#956b24}
.panda-lesson .panda-option[aria-pressed=true]{background:#fce7b2;border-color:#ae8233;box-shadow:0 0 0 2px #fbf8ed inset}
.panda-lesson .panda-option:hover{border-color:#8a9b75}
.panda-lesson .panda-action{box-sizing:border-box;border:2px solid #a8b493;background:transparent;color:#294b38;border-radius:999px;padding:9px 19px;font-family:inherit;font-size:17px;font-weight:650;line-height:1.25;cursor:pointer;min-height:43px}
.panda-lesson .panda-action[aria-expanded=true]{background:#284b39;border-color:#284b39;color:#fffbed}
.panda-lesson .panda-action[data-secondary=true]{border-color:transparent;color:#706343;text-decoration:underline;text-underline-offset:5px}
.panda-lesson .panda-option:focus-visible,.panda-lesson .panda-action:focus-visible,.panda-lesson textarea:focus-visible{outline:3px solid #865c1a;outline-offset:4px}
.panda-lesson .panda-support{margin-top:14px}
.panda-lesson .panda-support-panels{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;min-height:0;margin-top:10px}
.panda-lesson .panda-support-panel{padding:12px 15px;border-radius:14px;background:#ecefdf;font-size:17px;line-height:1.35;min-width:0}
.panda-lesson .panda-support-panel[data-kind=reference]{background:#f9e9bd}
.panda-lesson .panda-support-panel h3{font-size:12px;text-transform:uppercase;letter-spacing:.1em;margin:0 0 6px;color:#6d673d}
.panda-lesson .panda-support-panel p{margin:0}
.panda-lesson .panda-support-panel[hidden]{display:none}
.panda-lesson .panda-footer-note{font-size:12px;line-height:1.35;color:#69735e;margin:8px 0 0}
.panda-lesson .panda-writing{display:block;width:100%;box-sizing:border-box;resize:none;background:#fffdf5;color:#203c32;border:2px solid #c2c9ad;border-radius:20px;padding:18px 20px;font-family:inherit;font-size:23px;line-height:1.5;min-height:140px}
.panda-lesson .panda-label{font-size:18px;font-weight:650;display:block;margin:0 0 10px}
.panda-lesson .panda-prompt{background:#e9eedd;border-radius:24px;padding:24px 28px;font-size:27px;line-height:1.4}
.panda-lesson .panda-prompt p{margin:0 0 14px}
.panda-lesson .panda-prompt p:last-child{margin:0}
.panda-lesson .panda-stage-number{display:block;font-size:14px;letter-spacing:.1em;color:#856d3d;margin-bottom:4px}
`;
