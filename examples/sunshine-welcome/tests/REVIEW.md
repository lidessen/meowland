# Sunshine Welcome 独立浏览器审查

2026-10-17，最终输入为父任务统一重建后的 `sunshine-welcome-a3`，正式 manifest 为 10 个构建资产。测试作者与课件正文/样式作者分离；只改本目录测试，不改运行时、正文或素材，未清理或重建主产物，不执行提交或发布。

## 先失败、后修复的实际问题

- 原生选择按钮把布尔 `aria-pressed` 写成空字符串，选中高亮与可访问状态同时失效。键盘 Space 后、跨页回访后的真实浏览器断言均先失败；作者仅在课件将状态明确写成 `"true"` / `"false"` 后通过，未改通用运行时。
- 作者 `.sunshine-lesson select` 表单规则影响播放器目录，覆盖专属 chrome。新增同页 computed 对照：只通过 CSSOM 暂时移除作者规则，保留公共主题作为参照；旧构建目录为白底、20px、1px 边框，与公共参照不一致，稳定失败。作者改为 `.lesson-field` 后目录与公共参照一致，正文 textarea 仍保有作者样式。断言没有固定审美颜色/字号常量。
- 首读发现 `font:600 23px/1.3 inherit` 无效 shorthand，作者拆属性；Redo 只清输入却保留参考答案的问题在首轮互动前收敛为清本题并回 step0。后续实际检查了选中态、题目重做、提示/答案收回，未声称这两项有旧构建失败截图。

## 最终执行与结果

```sh
bun test examples/sunshine-welcome/tests/session.test.ts
bun node_modules/typescript/bin/tsc --noEmit -p examples/sunshine-welcome/tests/tsconfig.json
bun node_modules/oxlint/bin/oxlint --deny-warnings examples/sunshine-welcome/tests
bun node_modules/oxfmt/bin/oxfmt --check examples/sunshine-welcome/tests
PLAYWRIGHT_CHANNEL=chrome bun node_modules/@playwright/test/cli.js test --config examples/sunshine-welcome/tests/playwright.config.ts
```

实际结果：10 项浏览器检查全部通过（5.7 s），同模块双工厂隔离 1 项 / 11 断言通过，测试类型、lint、格式检查通过。本机 Chrome 与独立 loopback 13032 服务消费正式 `dist/`；未把 Meowbook/开发服务器当作交付。

最后父任务只加深小字颜色并格式化 HTML、重新构建，未改布局/内容/状态。该最终输入补跑冷启动、CSS 隔离与新增对比诊断 3 项，全部通过（2.0 s）；没有重复无关课堂逻辑矩阵，也没有声称最初 10 项是在颜色调整后完整再跑。诊断读取九页最终步骤共 42 个可见小字样本，按实际前景与祖先合成背景计算：最小约 4.52:1，kicker 最小 5.57、source-tag 4.93、speaker 4.93、词义 5.47、人物短语 4.60，样本 opacity 均为 1。检查以可读性比例为门槛，不固定配色或像素。

浏览器覆盖：

- 选择、输入不推进教师步骤；提示、参考表达、理由分步显现。未揭示参考答案在可访问快照中缺席，回退收回提示/答案但保留作答。
- 选择与理由跨页保留；Redo this task 清本题并回第 0 步。
- 六项匹配保留错误输入，提示不提前出现参考 key；两项输入一项符合时显示 1 of 2，而不是把未填项判错。Redo 清全部匹配；空输入再揭示显示 No selections entered。
- 原生复选框 Space 操作、跨页选择保留；对话提示与参考反馈分离。
- 结对选项与写作、出口选词与写作跨页保留；出口摘要读取此前选择；Redo exit ticket 不清前面选择/理由。
- 按钮 Space、textarea 方向键、select 方向键不被翻页抢走。原生 select 验证键盘事件未被取消、页面/教师步骤未推进；选值另通过原生 selectOption 验证，不声称脚本已完成操作系统弹出菜单的人工键盘验收。
- normal / reduced motion 的提示与直接步骤，以及 1440×960 / 390×844 控件可达、输入和反馈。
- 新浏览器 context 阻断所有非交付 origin 请求，逐页解码全部实际图片；外部请求、请求失败、HTTP 错误和页面异常均为零。刷新回新会话首页。
- 九页在最终教师步骤的可见文字、图片和表单边界均在舞台内；截图不用作像素 golden。

同模块工厂测试分别创建两场课件，在第一场改变全部课堂 signals 与 position，确认第二场仍为空白首页；反向修改第二场也不污染第一场。这是同模块状态隔离检查，未冒充同屏双 DOM 完整浏览器验收。

## 原图与范围

完整浏览器运行会生成九页宽屏原图于 `test-results/lesson-all-classroom-scene-eeb0c-at-their-final-teacher-step/`；选择 B + 输入 Ask first + 第 2 步反馈的宽/窄图于 `test-results/lesson-wide-and-narrow-hos-6abcd-d-player-controls-reachable/choose-feedback-{1440,390}.png`。Playwright 后续定向运行会重置该临时目录；本次最后保留 `test-results/contrast-small-authored-te-05771--actual-composed-background/contrast-diagnostics.json`。这些均为可重新生成的忽略产物，不是交付运行依赖。已实际观看九页粗稿原图，a3 重点重看改动的两词汇页、匹配、结对以及宽/窄选中反馈；选中高亮与目录样式已恢复，没有剩余行为或裁切阻断。父任务另保留最后颜色调整后的 `artifacts/courseware-review/sunshine/final-a3-*.png` 作为交付视觉证据。

教材版本、教学事实与引用边界由独立内容审查和 `../SOURCES.md` 承接，本记录不声称浏览器检查证明教材准确。无人工屏幕阅读器、实体手机触控、真实教室投影或学习效果评估；窄屏采用固定画布缩放，控件可操作不表示缩小后的正文适合手机阅读。冷启动证据限本地 HTTP 与外网请求阻断，未声称 `file://`、任意部署子路径、持久化、多人作答或已发布。
