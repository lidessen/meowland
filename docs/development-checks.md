# 工程检查

状态：正在落地；命令以根 `package.json` 为准。检查与修复分开，检查失败返回非零，不自动改源码、更新 golden 或发布包。

## 安装与版本

使用 Bun 1.4.2，首次运行或 CI 先执行 `bun install --frozen-lockfile`。根开发依赖精确固定 Oxlint 1.88.0、Oxfmt 0.73.0 与 TypeScript 7.0.2，解析结果保存在唯一 `bun.lock`。

首次检查先执行 `bun run build`，再执行 `bun run check`。包间公共 exports 指向 dist，现有类型检查和单测会真实消费这些入口；源码或导出修改后重新 build，不能让旧 dist 代替当前源码。`check` 自身不隐式生成产物。

2026-10-16 从官方 npm registry 的 [Oxlint](https://registry.npmjs.org/oxlint/1.88.0) 与 [Oxfmt](https://registry.npmjs.org/oxfmt/0.73.0) 元数据核对版本。上游声明 Node `^20.19.0 || >=22.12.0`；本仓库脚本显式用 Bun 执行 JS launcher，再调用其平台原生 binding，不依赖 PATH 上的 Node。兼容性以本版本实际运行结果为准。

## 本地命令与范围

| 命令                        | 范围与作用                                                                                                                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run lint`              | Oxlint correctness 规则与默认插件，覆盖源码、单测、浏览器用例、示例、脚本和 TS 配置；警告也导致失败                                                                                               |
| `bun run lint:fix`          | 相同规则的普通 `--fix`；不启用 suggestions 或 dangerous fixes，修改后仍需审阅 diff                                                                                                                |
| `bun run format:check`      | Oxfmt 检查支持的源码、文档及配置，不写文件                                                                                                                                                        |
| `bun run format`            | Oxfmt 写入格式；局部任务优先直接传本次修改的精确路径，避免覆盖其它作者 WIP                                                                                                                        |
| `bun run typecheck`         | 六包生产入口、JSX core/renderer/Web 环境、无 DOM 的 CSS core、CSS/UI/Slides 公共类型用例，以及根工程脚本、MDX 作者互动组件、演示实验场、两份课件和展板 host；不等于全部 unit/prototype 的 TS 检查 |
| `bun run test`              | JSX/CSS/UI/Slides 单测、Slides MDX/build 工具测试、Book 的 Bun/单测与生命周期、Press 单测与根工程脚本单测；`.spec.ts(x)` 浏览器场景另用 Playwright                                                |
| `bun run test:presentation` | 演示组件的独立浏览器合同，包括跨页信号、Reveal、活动许可、媒体与清理；使用专属本地服务，不混入 Meowbook 组件展板配置                                                                              |
| `bun run check`             | 顺序执行 format:check → lint → typecheck → test；任一步失败即停止                                                                                                                                 |
| `bun run build`             | 构建六包 ESM 与声明及必要资源；清理并更新各包 dist，不发布                                                                                                                                        |
| `bun run pack`              | 把当前 dist 打成本地 tgz；不自动 build，不代表安装态或浏览器验收通过                                                                                                                              |

检查排除 `node_modules`、`dist`、`artifacts`、Playwright 报告、测试结果和 Book 生成目录。格式工具另外跳过 Bun 生成的锁文件及原样保留的 `packages/meowtail/THIRD_PARTY_NOTICES.md`；不因历史源码存在告警而整体忽略包或测试目录。具体边界在 `.oxlintrc.json` 与 `.oxfmtrc.json`。

两个 JSON 类型/行为用例文件对 `no-unused-vars` 设置 `_` 前缀的参数占位约定，保留回调 props 的类型推断；其它文件保持 Oxlint 默认规则选项，未用导入仍报错。Reactive effect 的信号读取具有订阅语义，不能作为普通无用表达式随意删除。

平台环境类型不能合并处理：JSX core 与 CSS core 不加载 DOM/Bun 类型，Web 与 UI 使用 DOM；Book 的 Bun/Playwright 入口保留自身所需宿主类型。`bun scripts/build.ts --check --package <name>` 仅检查该包的生产 build 配置，不包含根 typecheck 的额外环境和公共类型用例。

MDX 作者入口的构建和预览见[作者示例](../examples/presentation/README.md)，复杂图片演示与素材验收见[实验场](../examples/presentation-lab/README.md)。演示运行时合同 `bun run test:presentation` 使用独立端口；Meowbook 演示组件测试用 `bun node_modules/@playwright/test/cli.js test --config packages/meowslides/playwright.config.ts`，MDX 作者浏览器测试用 `bun node_modules/@playwright/test/cli.js test --config packages/meowslides/tests/browser/authoring/playwright.config.ts`，分别记录执行结果。

英语 Welcome 课件的课堂状态与浏览器验收见[课件 README](../examples/sunshine-welcome/README.md)。根 typecheck 包含作者组件、实验场和两件课件工程，作品浏览器用例仍按各自配置独立运行。正式 Web 产物与组件合同浏览器测试分别验收；字体/图片 ready、静态图与实际播放、断网冷启动也分别记录，不由其中一项代替另一项。

Protecting pandas 为另一独立课件，入口与构建/浏览器检查见[熊猫课件 README](../examples/protecting-pandas/README.md)。根 typecheck 同样覆盖其作品工程；浏览器配置独占 `13034`，用户预览使用 `13014`，不复用或覆盖 Sunshine 的作品与服务。

## CI 与发行验证

`.github/workflows/checks.yml` 是唯一工程 workflow，仅在 main push、pull request 或手动触发时执行 frozen install → build → lint。它不执行完整本地 check，也不执行格式检查、单测、浏览器、打包、tag 发布、npm 发布或部署；只有只读 repository 权限。

需要本地完整工程检查时执行 `bun run check`。UI/交互改动仍须按受影响场景实际打开页面；公开 exports、资源或打包改动须另做 build → pack → 独立目录安装消费。旧 tgz 的成功属于当时源码，不因为后续格式或工程配置改变而自动升级为本版发行验收。

## 修复与证据

先区分真实缺陷、类型表达与工具环境差异，再选择最小修复。不能用全局关闭有效规则、删除失败断言、放宽 props 或 `skipLibCheck` 隐藏当前问题。必要例外限于准确规则和范围，并说明原因。

检查结果应写清输入版本、实际命令和退出状态。格式、lint、类型、单测、浏览器观察、安装态消费和正式发布分别报告。检查脚本或 CI 本身有改动时，在隔离副本植入格式、lint、类型或断言错误，验证相应命令返回非零；负例不留在产品源码，不为它新增生产分支或常驻状态。

官方行为参考：[Oxlint 配置](https://oxc.rs/docs/guide/usage/linter/config)、[Oxlint CLI](https://oxc.rs/docs/guide/usage/linter/cli)、[Oxfmt 配置](https://oxc.rs/docs/guide/usage/formatter/config)。
