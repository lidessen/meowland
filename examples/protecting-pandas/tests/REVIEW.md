# Protecting pandas 独立浏览器验收

2026-10-18。测试作者仅维护本目录，没有修改正文、样式、素材或旧 Sunshine 作品。
最终输入为 `/Users/lidessen/workspaces/meowland/artifacts/protecting-pandas-candidate`，版本标识
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

## 最终检查

```sh
PANDA_DIST=/Users/lidessen/workspaces/meowland/artifacts/protecting-pandas-candidate \
  bunx --no-install playwright test --config examples/protecting-pandas/tests/playwright.config.ts
bun node_modules/typescript/bin/tsc --noEmit -p examples/protecting-pandas/tests/tsconfig.json
bun node_modules/oxlint/bin/oxlint --deny-warnings examples/protecting-pandas/tests
bun node_modules/oxfmt/bin/oxfmt --check examples/protecting-pandas/tests
```

最终完整浏览器 **7/7 通过，10.9 秒**；测试类型、lint、格式检查通过。使用本机 Chrome、独立
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
