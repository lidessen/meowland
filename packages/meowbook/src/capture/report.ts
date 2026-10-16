import { writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { CaptureManifest, CaptureScene, CaptureSummary } from "./types";

export function summarizeCapture(scenes: readonly CaptureScene[]): CaptureSummary {
  const summary: CaptureSummary = {
    requested: scenes.length,
    successful: 0,
    failed: 0,
    unmatched: 0,
    unexecuted: 0,
    matched: 0,
    images: 0,
    outsideSelection: 0,
    transparent: 0,
    hidden: 0,
    offscreen: 0,
    clipped: 0,
    noVisualOutput: 0,
  };
  for (const scene of scenes) {
    const images = new Set<string>();
    if (scene.status === "success") summary.successful++;
    else if (scene.status === "failed") summary.failed++;
    else if (scene.status === "unmatched") summary.unmatched++;
    else summary.unexecuted++;
    summary.matched += scene.matched;
    for (const node of scene.nodes) {
      if (scene.status === "success" && node.image) images.add(node.image);
      if (node.selection === "outside-selection" || node.selection === "depth")
        summary.outsideSelection++;
      if (node.transparent) summary.transparent++;
      if (node.visibility === "hidden") summary.hidden++;
      if (node.visibility === "offscreen") summary.offscreen++;
      if (node.visibility === "clipped") summary.clipped++;
      if (node.visibility === "no-visual-output") summary.noVisualOutput++;
    }
    summary.images += images.size;
  }
  return summary;
}

/** JSON is embedded as data, including when trusted fixtures contain HTML-like strings. */
export function createCaptureReport(manifest: CaptureManifest): string {
  const data = JSON.stringify({ ...manifest, summary: summarizeCapture(manifest.scenes) })
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Meowbook capture</title><style>
.focus-comparison{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.focus-comparison figure{min-width:0;margin:0}.focus-comparison figcaption{margin-bottom:8px;font-size:13px}.focus-comparison .photo{display:block;width:100%;box-sizing:border-box}.focus-heading{margin-bottom:8px}@media(max-width:640px){.focus-comparison{grid-template-columns:minmax(0,1fr)}}
:root{font-family:system-ui,sans-serif;color:#20232a;background:#f4f5f7;color-scheme:light dark}body{margin:0 auto;max-width:1300px;padding:24px}h1{margin:0 0 8px}h2{margin-top:0}a{color:#245bcc}p{overflow-wrap:anywhere}.summary{font-variant-numeric:tabular-nums;line-height:1.7}.scene{background:white;border:1px solid #dce0e6;border-radius:12px;padding:20px;margin:20px 0}.photo{max-width:100%;max-height:440px;object-fit:contain;object-position:left top;border:1px solid #dce0e6}.tree{list-style:none;padding-left:22px}.tree:first-child{padding-left:0}.node{border-left:2px solid #dce0e6;padding:6px 10px;margin:8px 0}.node summary{cursor:pointer;overflow-wrap:anywhere}.meta{font-size:13px;color:#596273;white-space:pre-wrap;overflow-wrap:anywhere}button{font:inherit;padding:6px 10px;cursor:pointer}.crop{position:relative;overflow:hidden;border:1px solid #dce0e6;margin-top:8px}.crop img{position:absolute;max-width:none}.warning{color:#a12a20}.links{display:flex;gap:16px;flex-wrap:wrap}pre{white-space:pre-wrap;overflow-wrap:anywhere}dialog{max-width:92vw;max-height:92vh;overflow:auto;border:1px solid #dce0e6;border-radius:12px}dialog img{max-width:none}dialog button{position:sticky;top:0;display:block;margin-bottom:12px}@media(prefers-color-scheme:dark){:root{color:#e5e9f0;background:#17191e}.scene{background:#20232a;border-color:#3a404c}.meta{color:#a6b0c0}a{color:#8eb6ff}.warning{color:#ffb4a9}}
.overview{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:16px;margin:24px 0}.preview{min-width:0;border:1px solid #dce0e6;border-radius:12px;padding:12px;background:white}.preview h3{font-size:15px;margin:0 0 6px;overflow-wrap:anywhere}.preview p{margin:6px 0}.preview .photo{display:block;width:100%;height:220px;max-height:none;object-fit:contain;object-position:center top;box-sizing:border-box;background:#f4f5f7}.preview .links{gap:12px}.missing{display:grid;place-items:center;min-height:220px;background:#f4f5f7;border:1px dashed #dce0e6}.scene>summary{font-size:18px;font-weight:600;cursor:pointer;overflow-wrap:anywhere}.scene-content{margin-top:16px}.scene .back{font-size:13px;font-weight:400}@media(prefers-color-scheme:dark){.preview{background:#20232a;border-color:#3a404c}.preview .photo,.missing{background:#17191e;border-color:#3a404c}}
</style></head><body><h1>Meowbook capture</h1><p id="summary" class="summary"></p><p>Photos show the original viewport and its local regions. Capture success does not certify UI correctness.</p><h2 id="overview">Visual overview</h2><div id="overview-grid" class="overview"></div><h2>Scene details</h2><div id="scenes"></div><dialog id="viewer"><button type="button">Close original-size image</button><img alt="Original-size capture"></dialog>
<script id="capture-manifest" type="application/json">${data}</script>
<script>
const manifest=JSON.parse(document.getElementById('capture-manifest').textContent);
const summary=manifest.summary;
document.getElementById('summary').textContent=manifest.status+' · '+summary.requested+' scenes · '+summary.successful+' successful · '+summary.failed+' failed · '+summary.unexecuted+' unexecuted · '+summary.unmatched+' without a match · '+summary.matched+' matching instances · '+summary.images+' local images · '+summary.outsideSelection+' outside selection/depth · '+summary.transparent+' transparent · '+summary.hidden+' hidden · '+summary.offscreen+' offscreen · '+summary.clipped+' clipped · '+summary.noVisualOutput+' without visual output';
if(manifest.input.selectionError){const warning=document.createElement('p');warning.className='warning';warning.textContent=String(manifest.input.selectionError);document.getElementById('summary').after(warning)}
const viewer=document.getElementById('viewer');viewer.querySelector('button').onclick=()=>viewer.close();
function element(tag,text,className){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node}
function path(value){return typeof value==='string'&&/^s[0-9]+\\/(?:nodes\\/n[0-9]+\\.png|frame\\.png|full-page\\.png|guides\\.png|guides-full-page\\.png|measurements\\.json|focus\\.png|focus-full-page\\.png|focus-guides\\.png|focus-guides-full-page\\.png|focus\\.json|diagnostic\\.png|aria\\.yml)$/.test(value)?value:null}
function imageLink(file,label){const safe=path(file);if(!safe)return element('span','Invalid artifact path','warning');const link=element('a');link.href=safe;const image=element('img',undefined,'photo');image.src=safe;image.alt=label;image.loading='lazy';link.append(image);link.onclick=(event)=>{event.preventDefault();viewer.querySelector('img').src=safe;viewer.querySelector('img').alt=label;viewer.showModal()};return link}
function region(scene,node){const crop=node.cropRect,frame=path(scene.frame),viewport=scene.environment?.viewport;if(!crop||!frame||!viewport)return null;const button=element('button','View region in saved frame');button.type='button';const holder=element('div');holder.append(button);button.onclick=()=>{button.remove();const scale=Math.min(1,400/crop.width,280/crop.height);const view=element('div',undefined,'crop');view.style.width=crop.width*scale+'px';view.style.height=crop.height*scale+'px';const img=element('img');img.src=frame;img.alt=node.name+' in saved frame';img.style.width=viewport.width*scale+'px';img.style.height=viewport.height*scale+'px';img.style.left=-crop.x*scale+'px';img.style.top=-crop.y*scale+'px';view.append(img);holder.append(view)};return holder}
function environmentLabel(scene){const env={...manifest.environment,...scene.environment};const viewport=env.viewport;const dpr=scene.environment?.dpr??scene.environment?.deviceScaleFactor??manifest.environment?.dpr??manifest.environment?.deviceScaleFactor;return [viewport&&viewport.width+' × '+viewport.height,dpr!==undefined?'DPR '+dpr:null,env.colorScheme,env.reducedMotion?'motion: '+env.reducedMotion:null].filter(Boolean).join(' · ')||'Environment not recorded'}
for(const [index,scene] of manifest.scenes.entries()){
  const section=element('details',undefined,'scene');section.id='scene-'+index;section.open=manifest.scenes.length===1;
  section.append(element('summary',scene.story.title+' · '+scene.story.id+(scene.name?' / '+scene.name:'')));
  const content=element('div',undefined,'scene-content');
  const preview=element('article',undefined,'preview');preview.dataset.status=scene.status;
  preview.append(element('h3',scene.story.title+(scene.name?' / '+scene.name:'')),element('p',[scene.story.group,scene.story.id].filter(Boolean).join(' · '),'meta'),element('p',scene.status+(scene.diagnostic?' · diagnostic image':''),scene.status==='failed'?'warning':'meta'),element('p',environmentLabel(scene),'meta'));
  const previewFile=path(scene.frame)||path(scene.diagnostic);
  if(previewFile)preview.append(imageLink(previewFile,scene.diagnostic&&!scene.frame?'Diagnostic, not a successful capture: '+scene.story.id:'Viewport capture: '+scene.story.id));
  else preview.append(element('p','No viewport image saved','missing meta'));
  const previewLinks=element('p',undefined,'links');
  const detailLink=element('a','Scene details');detailLink.href='#'+section.id;detailLink.onclick=()=>{section.open=true};previewLinks.append(detailLink);
  if(path(scene.fullPage)){const full=element('a','Full-page image');full.href=scene.fullPage;previewLinks.append(full)}
  if(path(scene.aria)){const aria=element('a','ARIA snapshot');aria.href=scene.aria;previewLinks.append(aria)}
  preview.append(previewLinks);document.getElementById('overview-grid').append(preview);
  const back=element('a','Back to overview','back');back.href='#overview';content.append(back);
  const images=new Set(scene.nodes.map(n=>n.image).filter(Boolean));
  content.append(element('p',scene.status+' · '+scene.matched+' matches · '+images.size+' local image files'),element('p',environmentLabel(scene),'meta'));
  const source=scene.story.file+(scene.story.line?':'+scene.story.line:'')+(scene.story.exportName?' / '+scene.story.exportName:'');
  content.append(element('p',source,'meta'));
  if(scene.source?.kind==='page')content.append(element('p','Live page: '+scene.source.url+' · DOM root: '+scene.source.root+' · DOM regions, not a component tree','meta'));
  if(scene.error)content.append(element('p',scene.error,'warning'));
  if(scene.focus){
    section.open=true;
    content.append(element('h3','Original and focus','focus-heading'),element('p','Focus is a processed photo, not a design improvement. Use the original to judge color, contrast and visual hierarchy.','meta'));
    const comparison=element('div',undefined,'focus-comparison');
    for(const [file,label] of [[scene.frame,'Original viewport'],[scene.focus.frame,'Processed focus viewport']]){const figure=element('figure');figure.append(element('figcaption',label),imageLink(file,label+' '+scene.story.id));comparison.append(figure)}
    content.append(comparison);
    if(scene.focus.fullPage){const full=element('details');full.append(element('summary','Original and focus · full page'));const comparison=element('div',undefined,'focus-comparison');for(const [file,label] of [[scene.fullPage,'Original full page'],[scene.focus.fullPage,'Processed focus full page']]){const figure=element('figure');figure.append(element('figcaption',label),imageLink(file,label+' '+scene.story.id));comparison.append(figure)}full.append(comparison);content.append(full)}
    if(scene.focus.guides||scene.focus.fullPageGuides){const combined=element('details');combined.append(element('summary','Focus with alignment guides'),element('p','Guide targets are independent of focus targets and may lie in weakened regions.','meta'));if(scene.focus.guides)combined.append(imageLink(scene.focus.guides,'Focus with guides '+scene.story.id));if(scene.focus.fullPageGuides)combined.append(imageLink(scene.focus.fullPageGuides,'Full-page focus with guides '+scene.story.id));content.append(combined)}
    if(path(scene.focus.metadata)){const link=element('a','Focus metadata JSON');link.href=scene.focus.metadata;content.append(link)}
  }else if(scene.frame)content.append(imageLink(scene.frame,'Scene '+scene.story.id));
  if(scene.fullPage){const full=element('details');full.append(element('summary','Full-page image'),imageLink(scene.fullPage,'Full-page scene '+scene.story.id));content.append(full)}
  if(scene.guides){
    const guides=element('details');guides.append(element('summary','Alignment guides · '+scene.guides.targets.length+' targets'));
    guides.append(element('p','Annotations measure bounding boxes in CSS pixels, not text baselines or design correctness. Numbered targets map to the measurements.','meta'),imageLink(scene.guides.frame,'Alignment guides '+scene.story.id));
    if(scene.guides.fullPage)guides.append(imageLink(scene.guides.fullPage,'Full-page alignment guides '+scene.story.id));
    if(path(scene.guides.measurements)){const link=element('a','Measurements JSON');link.href=scene.guides.measurements;guides.append(link)}
    const measurements=element('details');measurements.append(element('summary','Target geometry and differences'),element('pre',JSON.stringify(scene.guides.targets,null,2),'meta'));guides.append(measurements);content.append(guides);
  }
  if(scene.diagnostic)content.append(element('p','Diagnostic image from a failed capture','warning'),imageLink(scene.diagnostic,'Diagnostic, not a successful capture'));
  const links=element('p',undefined,'links');
  if(path(scene.aria)){const aria=element('a','ARIA snapshot');aria.href=scene.aria;links.append(aria)}
  content.append(links);
  if(scene.testLocation)content.append(element('p','Replay this interaction through '+scene.testLocation,'meta'));
  else if(scene.replay)content.append(element('pre',scene.replay,'meta'));
  if(scene.boundaries?.length)content.append(element('p',scene.boundaries.join('; '),'meta'));
  if(scene.activeFocus||scene.scrollViews){const facts=element('details');facts.append(element('summary','DOM focus and scroll facts'),element('p','Current DOM facts are read-only. Focus part identifies the nearest containing part, not necessarily the active element itself. Declared scroll ownership and actual overflow are separate; unknown boundaries and geometry do not certify readiness, native focus or UI correctness.','meta'));if(scene.activeFocus)facts.append(element('h3','Active DOM focus'),element('pre',JSON.stringify(scene.activeFocus,null,2),'meta'));if(scene.scrollViews)facts.append(element('h3','Scroll viewports'),element('pre',JSON.stringify(scene.scrollViews,null,2),'meta'));content.append(facts)}
  if(scene.replacements?.length)content.append(element('pre',JSON.stringify(scene.replacements,null,2),'meta'));
  const toggle=element('input');toggle.type='checkbox';
  const toggleLabel=element('label');toggleLabel.append(toggle,document.createTextNode(' Show full instance tree'));
  content.append(toggleLabel);
  const tree=element('ul',undefined,'tree');
  function renderTree(){
    tree.replaceChildren();
    const nodes=scene.nodes.filter(n=>toggle.checked||!n.transparent||n.selection==='selected');
    const all=new Map(nodes.map(n=>[n.id,n]));
    const children=new Map();
    for(const node of nodes){const parent=toggle.checked?node.parentId:node.captureParentId;const key=all.has(parent)?parent:null;if(!children.has(key))children.set(key,[]);children.get(key).push(node)}
    function appendNodes(parent,list,visited){
      for(const node of children.get(parent)||[]){
        if(visited.has(node.id))continue;
        const next=new Set(visited);next.add(node.id);
        const li=element('li',undefined,'node');
        const details=element('details');details.open=!node.transparent||node.selection==='selected';
        const label=node.name+(node.originalName&&node.originalName!==node.name?' (replaces '+node.originalName+')':'');
        details.append(element('summary',label+' · '+node.id+' · '+node.selection+' · '+node.visibility));
        details.append(element('p','Capture depth: '+(node.captureDepth??'outside')+'; capture parent: '+(node.captureParentId??'root')+(node.transparent?'; transparent: '+(node.transparentReason||'metadata'):'')+(node.approximate?.length?'; approximate: '+node.approximate.join(', '):''),'meta'));
        if(node.image)details.append(imageLink(node.image,label));
        else{const preview=region(scene,node);if(preview)details.append(preview)}
        details.append(element('p','Layout rectangles: '+JSON.stringify(node.rects)+'; visible rectangles: '+JSON.stringify(node.visibleRects),'meta'));
        const nested=element('ul',undefined,'tree');appendNodes(node.id,nested,next);if(nested.childNodes.length)details.append(nested);
        li.append(details);list.append(li);
      }
    }
    appendNodes(null,tree,new Set());
  }
  toggle.onchange=renderTree;renderTree();content.append(tree);section.append(content);document.getElementById('scenes').append(section);
}
</script></body></html>`;
}

export async function writeCaptureReport(
  directory: string,
  manifest: CaptureManifest,
): Promise<{ manifestPath: string; reportPath: string }> {
  manifest.summary = summarizeCapture(manifest.scenes);
  const manifestPath = resolve(join(directory, "manifest.json"));
  const reportPath = resolve(join(directory, "index.html"));
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx" });
  await writeFile(reportPath, createCaptureReport(manifest), { flag: "wx" });
  return { manifestPath, reportPath };
}
