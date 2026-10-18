import { presentationTokens } from "meowslides/theme";
export const lessonCss = `
html,body{margin:0;min-width:320px;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#e8eeef;color:#173f59}#app{height:100dvh}
.sunshine-lesson{${presentationTokens.paper.name}:#fffdf4;${presentationTokens.ink.name}:#173f59;${presentationTokens.muted.name}:#526d7b;${presentationTokens.accent.name}:#d19420}
.sunshine-lesson .kicker{font-size:16px;letter-spacing:.13em;text-transform:uppercase;font-weight:750;color:#866014;margin:0}
.sunshine-lesson .lesson-title{font-size:78px;line-height:1.02;letter-spacing:-.045em;color:#173f59;margin:18px 0 24px;max-width:650px}
.sunshine-lesson .lesson-title em{font-style:normal;color:#bc861c}
.sunshine-lesson .lesson-heading{font-size:45px;line-height:1.1;letter-spacing:-.025em;color:#173f59;margin:10px 0 22px}
.sunshine-lesson .lead{font-size:28px;line-height:1.4;color:#456575;margin:0;max-width:710px}
.sunshine-lesson .small{font-size:17px;line-height:1.45;color:#567180;margin:0}
.sunshine-lesson .source-tag{font-size:13px;line-height:1.4;color:#5b737a;letter-spacing:.025em;margin:0}
.sunshine-lesson .hero-art{width:440px;height:485px;object-fit:cover;border-radius:28px}
.sunshine-lesson .sun-label{display:inline-block;width:max-content;border-radius:999px;padding:8px 16px;background:#fff0b8;color:#71551b;font-size:18px;font-weight:650}
.sunshine-lesson .task-card{background:#eef3f2;border-radius:18px;padding:24px;min-width:0}
.sunshine-lesson .choice-card{border:2px solid #d3dfe1;border-radius:14px;background:#fff;color:#173f59;text-align:left;min-height:76px;padding:16px 20px;cursor:pointer;font-family:inherit;font-size:23px;font-weight:600;line-height:1.3;display:flex;align-items:center;gap:16px}
.sunshine-lesson .choice-card[aria-pressed=true]{background:#fff2bd;border-color:#c39425;box-shadow:0 0 0 2px #fff2bd}
.sunshine-lesson .choice-card:focus-visible{outline:3px solid #35799b;outline-offset:3px}
.sunshine-lesson .choice-letter{flex:none;display:grid;place-items:center;border-radius:50%;width:36px;height:36px;background:#e7eff0;font-size:18px}
.sunshine-lesson .reason-label{font-size:19px;font-weight:650;display:block;margin-bottom:8px}
.sunshine-lesson .lesson-field{box-sizing:border-box;width:100%;border:1px solid #9cb2ba;background:#fff;color:#173f59;border-radius:9px;padding:10px 12px;font:20px/1.4 ui-sans-serif,system-ui,sans-serif}
.sunshine-lesson .lesson-field:focus-visible{outline:3px solid #35799b;outline-offset:2px}
.sunshine-lesson .feedback{font-size:23px;line-height:1.4;padding:18px 22px;background:#fff0b8;border-radius:12px;color:#5d491e}
.sunshine-lesson .teacher-line{font-size:16px;color:#5b737a;line-height:1.4}
.sunshine-lesson .preview-shell{height:100%;display:grid;grid-template-rows:auto minmax(0,1fr)}
.sunshine-lesson .preview-gate{font-size:14px;background:#fff0b8;padding:8px 16px;display:flex;gap:16px;align-items:center}
.sunshine-lesson .word-card{background:#eef3f2;border-radius:18px;padding:20px 18px;min-height:310px;text-align:center}
.sunshine-lesson .word-card h3{font-size:36px;letter-spacing:-.02em;color:#173f59;margin:0}
.sunshine-lesson .word-meaning{font-size:21px;line-height:1.35;min-height:58px;margin:0;color:#476675}
.sunshine-lesson .word-phrase{font-size:18px;line-height:1.35;color:#8c671b;margin:0}
.sunshine-lesson .match-card{background:#eef3f2;border-radius:14px;padding:12px 18px}
.sunshine-lesson .match-card label{display:block;font-size:20px;line-height:1.35;min-height:58px;margin-bottom:10px}
.sunshine-lesson .match-card select{font-size:20px}
.sunshine-lesson .dialogue{background:#eaf0f1;border-radius:18px;padding:22px 24px}
.sunshine-lesson .dialogue p{font-size:24px;line-height:1.4;margin:0 0 18px}
.sunshine-lesson .dialogue p:last-child{margin-bottom:0}
.sunshine-lesson .dialogue strong{display:inline-block;min-width:52px;color:#866014;font-size:17px;text-transform:uppercase;letter-spacing:.04em}
.sunshine-lesson .check-choice{display:flex;align-items:center;gap:12px;font-size:21px;line-height:1.3;cursor:pointer}
.sunshine-lesson .check-choice input{width:22px;height:22px;accent-color:#ac7f22;flex:none}
.sunshine-lesson .talk-steps{font-size:25px;line-height:1.6;margin:0;padding-left:28px}
`;
