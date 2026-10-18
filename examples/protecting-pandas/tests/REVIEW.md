# Protecting pandas 独立浏览器验收

## a4 图片与真实短片最终验收

最终交付 `protecting-pandas-a4` / `chunk-90dfy6sp.js`，build-manifest SHA256 为
`ae98dc35b5f563792d93943013fd79dd219bb61b699e4da78d4570828af6ab83`。
完整浏览器 **13/13 通过（18.3 秒）**，包括原八项与新增五项媒体合同。原八项已扩到八页目录/冷启动/三尺寸预算，新片段仍使用同源作品，不放宽正文或 footer 断言。

新增覆盖真实图片解码/alt、18 秒视频真实 metadata/videoWidth、本地来源、字幕 cues、初始暂停、键盘 Play/Pause/Back、时间实际推进/停住/归零、ended 不翻页、切页旧 src 释放/回访静默，以及保留行动草稿/支持状态。图片失败保留描述，视频失败反馈分块、文字替代保留，Retry 真恢复。

冷启动只将“已成功 metadata 且离页后旧节点已暂停/释放 src”的同一媒体 `net::ERR_ABORTED` 识别为预期取消；404、其他请求/解码失败和页面错误仍失败。trace 证明首轮取消对应 HTTP 206 媒体正常中断，并非缺资源。

首轮 watch 正常 444/457、失败 444/475 的预算缺陷由共享 media min-size/状态布局修复；森林图使用现有 LayoutItem 分配余高，不删除问题/缩字或裁正文。原失败图保留，最终严格预算通过。

根从最终 live 13014 拍 11 张新入口/观察/短片/播放/失败原图并记录脚本与预算，实际打开其中六张：三张宽屏主视觉/观察/播放，以及窄窗短片、极短窗短片、宽屏失败。结果见 `artifacts/protecting-pandas-media-a4/live/`；这不冒充十一张全部人工审阅。
独立作者此前逐看六张媒体三尺寸图，另独立视觉者逐看正常/播放/失败宽图与八张窄短代表图，证据保留其各自候选哈希；最终仅将两条纯文本 Fragment 改为同样文本字符串以通过 lint，根最终 live 复看承接该差异。

共享演示合同全套 33/33，随后新增音轨三个按钮可达断言定向 1/1；Sunshine 定向 3/3（2.4 秒）。静态/类型/单测及来源与许可另见[本轮回执](../../../docs/records/2026-10-18-protecting-pandas-media.md)。未做真实投影或完整 Safari/Firefox 媒体矩阵；窄短窗为固定画布缩放概览。

下文保留 a3 及更早历史结果，不能代替 a4。

2026-10-18。测试作者仅维护本目录，没有修改正文、样式、素材或旧 Sunshine 作品。

## 共享组件修复后的最终检查

`/Users/lidessen/workspaces/meowland/artifacts/protecting-pandas-candidate-a3` 的
`protecting-pandas-a3`（`chunk-zrg09fpk.js`）最终同版完整浏览器 **8/8 通过，14.8 秒**；
manifest SHA-256 为 `d881cd0d2275c91d3c2b420e5894fcaf644b1dfb325feb2fd5ab51d0e3739f4e`。
本目录类型、lint、格式检查通过。严格正文预算、画布边界和播放器样式隔离断言均保留。
新增第八项在 1100×760 的五题中检查默认、各提示单开、全开、全关：支持按钮位置和阅读框
位置/高度保持稳定，隐藏面板退出可访问树。作品改用共享 `Reveal when` 与 `slideClassName`，
没有把作品手写的可见性、inert 或 aria-hidden 实现当作组件修复。

同版 `artifacts/sunshine-component-candidate` 的旧 Sunshine 三项必要行为回归 **3/3 通过，4.9 秒**：
教师逐步揭示、跨页保留与显式重做、提示受控与 reduced motion。只读取旧作品，未改其正文或样式。
这不是 Sunshine 全量浏览器验收。

最终 live 13014 已更新为同一产物。1100×760 的 **37 张原图已逐张实际打开审阅**，
没有发现新增裁切、正文与支持/页脚重叠或提示栏跳动。完整逐图索引与测量位于
`artifacts/protecting-pandas-review/live-normal/a3/REVIEW.md` 和 `index.json`；每图都核对了
`chunk-zrg09fpk.js`。五题全部七态正文为 259/259，支持按钮 y 为 455.455 CSS px，
四题原文框位置/高度不变；页面异常及可见溢出诊断均为零。行动回访图等待入场动画结束后重拍并实际打开。

第 13/15/16 图保留内容边界：选 Having babies 时 Reference 是 forests 通用示例，
并非按当前选项生成。没有在组件修复任务中更改原文，也未将该内容关联边界作为共享组件故障。
旧 a1 图保留为历史证据，不能当作 a3 最终画面。独立 Chrome 页面没有操作用户已有标签页，
本结果也不证明其原 Safari 页面已刷新。

```sh
PANDA_DIST=/Users/lidessen/workspaces/meowland/artifacts/protecting-pandas-candidate-a3 \
  bunx --no-install playwright test --config examples/protecting-pandas/tests/playwright.config.ts
SUNSHINE_DIST=/Users/lidessen/workspaces/meowland/artifacts/sunshine-component-candidate \
  bunx --no-install playwright test --config examples/sunshine-welcome/tests/playwright.config.ts \
  --grep 'teacher steps reveal|page visits preserve|warm-up hints'
```

## a1 历史候选与截图

历史输入为 `/Users/lidessen/workspaces/meowland/artifacts/protecting-pandas-candidate`，版本标识
`protecting-pandas-a1`；浏览器脚本为 `chunk-0cehad9c.js`，manifest 的 SHA-256 为
`a5ecd3b6cda6b3b5bf1cac05f50c83694a7a6eb62c6634d9bcf2baffb3ca5965`。

## 发现与闭环

- 首版正文标题的宽泛 h1 规则放大了播放器标题。最终标题改用作品专有 class；浏览器通过 CSSOM
  暂时移除作品规则，对比播放器标题和目录的计算样式，确认它们不依赖或受到作品样式覆盖。
- 首版正文与教师提示区域相叠。第一候选仍有保护页正文可用高 259、实际滚动高 324，含义页 259/313；
  实际后代进入 footer。作者收敛重复说明和布局后，最终六页三尺寸全展开均通过严格的正文预算检查。
  未放宽为仅检查整张画布，也未删除重叠断言。最终行动页长草稿在输入内部滚动，不扩张正文。
- 测试初次把受 CSS 大写影响的 innerText 与默认读取 textContent 的断言相比较，属于测试表示不一致；
  改为前后读取原始 textContent，再检查证据标记，未将其报告为课件缺陷。
- 新消费者最初缺少私有 ESM package.json，Playwright 无法加载 import.meta 配置；由宿主作者补齐，
  没有修改旧作品或降低测试合同。

## a1 检查记录

```sh
PANDA_DIST=/Users/lidessen/workspaces/meowland/artifacts/protecting-pandas-candidate \
  bunx --no-install playwright test --config examples/protecting-pandas/tests/playwright.config.ts
bun node_modules/typescript/bin/tsc --noEmit -p examples/protecting-pandas/tests/tsconfig.json
bun node_modules/oxlint/bin/oxlint --deny-warnings examples/protecting-pandas/tests
bun node_modules/oxfmt/bin/oxfmt --check examples/protecting-pandas/tests
```

a1 完整浏览器 **7/7 通过，10.9 秒**；当时测试类型、lint、格式检查通过。使用本机 Chrome、独立
loopback 13034 和正式 Web 候选产物；没有把 Meowbook 开发预览当作正式交付。

覆盖五题 Hint / Reference / Evidence 独立开关、撤回与恢复、aria-controls/expanded 与隐藏后退出可访问树；
原始摘录文本不变，证据高亮可撤回。跨页保留选择、教师支持状态与草稿，明确重做只清当前题。
课堂选项全部直接可见，以原生按钮、选中语义和键盘操作，不以播放器目录的原生 select 当作缺陷。
方向键、空格等输入操作不推进页面，行动起点不自动写草稿或揭示参考，开放表达不按唯一答案判分。

全新浏览器阻断非交付 origin，请求失败、HTTP 错误、外部请求和页面异常均为零；六页图片实际解码。
直达任务与 reduced motion 保持教师支持初始隐藏。六页在 1440×900、390×844、1280×330 下全展开，
含封面最终步骤和长行动草稿；实际文字/控件在画布内、正文不侵入 footer，目录与设置入口可聚焦到达。

## 原图与验证边界

18 张最终原图另存于 `artifacts/protecting-pandas-review/`，文件名为
`final-{welcome|growth|problems|protect|meaning|act}-{1440x900|390x844|1280x330}-expanded.png`。
已实际打开六张宽图，以及成长/保护/行动窄图、成长/含义/行动短图，确认主要阅读关系与教师支持分区。
初次候选失败图及非断言测量保留为 `candidate1-*`，不得用其冒充最终画面。

本验收不证明教材版本、原文事实或图片授权，来源由 `../SOURCES.md` 与素材 notices 负责。
未做人工屏幕阅读器、实体手机、真实投影教室或学习成效观察。窄短窗仍为固定演示画布整体缩放，
控件可达不等于正文适合手机阅读；冷启动限本地 HTTP，不声称 file://、任意子路径部署或持久化。
测试服务随 Playwright 结束关闭；一次额外布局探针的自有 13034 服务已单独关闭，未操作 13014 或 13012。
