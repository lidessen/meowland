# Meowland

独立的 Bun / TypeScript UI 工具仓库。五包已完成 npm 发布、独立 registry 消费验收及正式 GitHub Release，产品切换尚待后续；原 Rossovia 产品仓库的源码、服务、正式依赖和 Git remote 均未在这里切换。

## 包

| 包                                          | 职责                                                                                                |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [`meowjsx`](packages/meowjsx/README.md)     | 平台无关 JSX / reactive runtime；浏览器能力通过 `meowjsx/web` 显式加载                              |
| [`meowcss`](packages/meowcss/README.md)     | 通用 token / CSS 生成，另有 `/meowjsx` 与 `/web` 适配入口                                           |
| [`meowtail`](packages/meowtail/README.md)   | 组件、语义布局和具体标准主题；本轮完整 Assistant 与有限 JSON catalog 的本地实现及有限独立验收已完成 |
| [`meowbook`](packages/meowbook/README.md)   | 组件展示、检查、浏览器预览与截图工具                                                                |
| [`meowpress`](packages/meowpress/README.md) | Markdown / MDX 静态站点构建工具                                                                     |

[`apps/showcase`](apps/showcase/README.md) 是私有展板，不是第六个发布包。本轮完整 Assistant 与有限 JSON→UI 已完成本地实现及有限独立验收，实际同源输入、产物与未覆盖范围见[本地迁移回执](docs/local-migration-receipt.md)；早期混合产物的通过不作为本轮同源证据，也不表示 Rossovia 产品已切换或发布。

浏览器演示创作见 [presentation-authoring skill](.agents/skills/presentation-authoring/SKILL.md) 与[图片等待演示](examples/presentation/README.md)：文稿、视觉、素材和互动围绕同一可运行作品迭代，复用 Meowtail 演示组件和 Meowbook。演示样例是私有消费者，不新增发布包；首期浏览器交付，PPT 导出留待以后。[设计与取舍](docs/designs/2026-10-17-presentation-authoring.md)保留职责、状态和验收边界；同版检查、独立审查与包外消费结果见[首期实施回执](docs/records/2026-10-17-presentation-authoring.md)，截图反馈后的专属外围主题见[控制层优化回执](docs/records/2026-10-17-presentation-chrome.md)。

课件实作见 [8B Unit 6 · Sunshine for all / Welcome](examples/sunshine-welcome/README.md)：依照核实的课时范围创作课堂活动，教师控制提示和参考答案，学生输入由作品 signals 保留；教材来源、课堂改编与启动方式在样例中区分说明，验证与限制见[课件回执](docs/records/2026-10-17-sunshine-welcome.md)。

## 本地开发

使用 Bun 1.4.2：

```sh
bun install
bun run build
bun run pack
```

构建输出 ESM JavaScript 与声明文件，保留模块图；五个 tarball 放到未跟踪的 `artifacts/`。这些命令只构建或打本地包，不发布 npm。包的公开入口不指向 TypeScript 源码。

维护者首次安装后先 `bun run build`，再执行 `bun run check`，顺序检查格式、lint、类型与单测。检查和自动修复分开；工程脚本、类型环境、测试范围及仅 build/lint 的 CI 见[工程检查](docs/development-checks.md)。`typecheck` 不覆盖全部 unit/prototype 源码；各包 README 另列自己的检查入口。展板检查使用 `bun run --cwd apps/showcase check`，浏览器检查按消费者的 Playwright 配置分别运行。列出命令不表示本轮所有项目均已通过；验证须绑定实际输入版本，旧产物通过不替代当前源码验收。

源码来自 Rossovia 仓库的库目录，在独立目录迁移；不使用原仓库的 workspace 链接、产品后端或真实数据。现有第三方声明随源码保留。

## 发布状态

公开源码仓库为 [lidessen/meowland](https://github.com/lidessen/meowland)。当前正式版本为 `meowjsx@0.1.0`、`meowcss@0.1.0`、`meowtail@0.1.0`、`meowbook@0.1.1`、`meowpress@0.1.0`，均已完成 npm 发布、独立 registry 安装验收和正式 GitHub Release。JSX/CSS 原 tag 与资产保持不变；本批精确候选、产物与验收范围见[发布回执](docs/records/2026-10-17-tail-book-press-publish.md)。

独立 UI 包由 `meowui` 改名为 `meowtail`，公开入口为 `meowtail`、`meowtail/chat`、`meowtail/json` 等；`createMeowUI`、`installMeowUI` 和既有 DOM/CSS 标记保持兼容，不合入 JSX/CSS。Book 使用新 UI 包并以 `0.1.1` 发布，旧 UI 与 Book `0.1.0` draft/tag 保留，未移动或覆盖。Press 的先前 E409 保留为历史，本批获明确授权后仅重试一次，现已完成发布和消费验收。后续发布继续沿[本地发布](docs/releasing.md)执行，不覆盖同名同版资产。

自有代码采用 MIT，正式包携带相应 `LICENSE` 与第三方 notices；第三方资源继续适用其原许可证。构建、安装验收和正式发布的区别仍按本次精确输入分别记录。
