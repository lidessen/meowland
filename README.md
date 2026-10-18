# Meowland

独立的 Bun / TypeScript UI 工具仓库。原五包已完成 npm 发布、独立 registry 消费验收及正式 GitHub Release；本轮新增 `meowslides` 为本地候选，尚未发布。产品切换尚待后续；原 Rossovia 产品仓库的源码、服务、正式依赖和 Git remote 均未在这里切换。

## 包

| 包                                            | 职责                                                                                                |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [`meowjsx`](packages/meowjsx/README.md)       | 平台无关 JSX / reactive runtime；浏览器能力通过 `meowjsx/web` 显式加载                              |
| [`meowcss`](packages/meowcss/README.md)       | 通用 token / CSS 生成，另有 `/meowjsx` 与 `/web` 适配入口                                           |
| [`meowtail`](packages/meowtail/README.md)     | 组件、语义布局和具体标准主题；本轮完整 Assistant 与有限 JSON catalog 的本地实现及有限独立验收已完成 |
| [`meowslides`](packages/meowslides/README.md) | 独立演示播放、内容布局、渐显、媒体、主题和可信本地 MDX 创作工具；本地候选                           |
| [`meowbook`](packages/meowbook/README.md)     | 组件展示、检查、浏览器预览与截图工具                                                                |
| [`meowpress`](packages/meowpress/README.md)   | Markdown / MDX 静态站点构建工具                                                                     |

[`apps/showcase`](apps/showcase/README.md) 是私有展板，不是第六个发布包。本轮完整 Assistant 与有限 JSON→UI 已完成本地实现及有限独立验收，实际同源输入、产物与未覆盖范围见[本地迁移回执](docs/local-migration-receipt.md)；早期混合产物的通过不作为本轮同源证据，也不表示 Rossovia 产品已切换或发布。

浏览器演示从 [MDX 作者示例](examples/presentation/README.md)开始，创作方法见 [presentation-authoring skill](.agents/skills/presentation-authoring/SKILL.md)。普通作者维护讲稿、素材和必要的 MeowJSX 互动组件；共享播放、默认主题、构建和预览由 `meowslides` 提供，Meowbook 用于额外审查。[图片加载讲解](examples/image-loading/README.md)是一件完整的五页自定义互动作品，围绕编码、网速估算和真实受控录屏组织，源码、专用动画与审阅工具各有归属；通用音轨展示在包 stories 中。首期浏览器交付，PPT 导出留待以后。[拆包与 MDX 设计](docs/designs/2026-10-18-presentation-package-mdx.md)记录职责与信任边界；首期历史见[原实施回执](docs/records/2026-10-17-presentation-authoring.md)。

课件实作见 [8B Unit 6 · Sunshine for all / Welcome](examples/sunshine-welcome/README.md)：依照核实的课时范围创作课堂活动，教师控制提示和参考答案，学生输入由作品 signals 保留；教材来源、课堂改编与启动方式在样例中区分说明，验证与限制见[课件回执](docs/records/2026-10-17-sunshine-welcome.md)。

共享演示工具带的标准布局、窄容器目录重排与设置浮层见[布局复验回执](docs/records/2026-10-18-presentation-toolbar.md)，同时覆盖图片演示与英语课件。

八上 Unit 5 的另一件作品见 [Protecting pandas 阅读课件](examples/protecting-pandas/README.md)：成长、问题与后果、保护措施到个人行动，课堂选项直接展开，提示/参考/依据可分别撤回与恢复。两件课件独立保留，全部演示入口见 [examples 索引](examples/README.md)。

## 本地开发

使用 Bun 1.4.2：

```sh
bun install
bun run build
bun run pack
```

构建输出 ESM JavaScript 与声明文件，保留模块图；六个 tarball 放到未跟踪的 `artifacts/`。这些命令只构建或打本地包，不发布 npm。包的公开入口不指向 TypeScript 源码。

维护者首次安装后先 `bun run build`，再执行 `bun run check`，顺序检查格式、lint、类型与单测。检查和自动修复分开；工程脚本、类型环境、测试范围及仅 build/lint 的 CI 见[工程检查](docs/development-checks.md)。`typecheck` 不覆盖全部 unit/prototype 源码；各包 README 另列自己的检查入口。展板检查使用 `bun run --cwd apps/showcase check`，浏览器检查按消费者的 Playwright 配置分别运行。列出命令不表示本轮所有项目均已通过；验证须绑定实际输入版本，旧产物通过不替代当前源码验收。

源码来自 Rossovia 仓库的库目录，在独立目录迁移；不使用原仓库的 workspace 链接、产品后端或真实数据。现有第三方声明随源码保留。

## 发布状态

当前操作采用[手动 Actions + npm OIDC 发布](docs/releasing.md)：显式选包、独立版本；测试版使用 `alpha`，稳定版使用 `latest`。普通 push 只检查，发布由手动 workflow 触发，不依赖长期 npm token。脚本不管理 GitHub Release，以下已完成发行仍保留历史事实。JSX/CSS/Tail/Book 四包 alpha 与新增 Slides `0.1.0-alpha.0` 已接入本地准备，均尚未发布；新增第五包的实际发布须单独明确授权。

公开源码仓库为 [lidessen/meowland](https://github.com/lidessen/meowland)。当前正式版本为 `meowjsx@0.1.0`、`meowcss@0.1.0`、`meowtail@0.1.0`、`meowbook@0.1.1`、`meowpress@0.1.0`，均已完成 npm 发布、独立 registry 安装验收和正式 GitHub Release。JSX/CSS 原 tag 与资产保持不变；本批精确候选、产物与验收范围见[发布回执](docs/records/2026-10-17-tail-book-press-publish.md)。

独立 UI 包由 `meowui` 改名为 `meowtail`，公开入口为 `meowtail`、`meowtail/chat`、`meowtail/json` 等；`createMeowUI`、`installMeowUI` 和既有 DOM/CSS 标记保持兼容，不合入 JSX/CSS。Book 使用新 UI 包并以 `0.1.1` 发布，旧 UI 与 Book `0.1.0` draft/tag 保留，未移动或覆盖。Press 的先前 E409 保留为历史，本批获明确授权后仅重试一次，现已完成发布和消费验收。后续发布继续沿[本地发布](docs/releasing.md)执行，不覆盖同名同版资产。

自有代码采用 MIT，正式包携带相应 `LICENSE` 与第三方 notices；第三方资源继续适用其原许可证。构建、安装验收和正式发布的区别仍按本次精确输入分别记录。
