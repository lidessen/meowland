# Meowland

独立的 Bun / TypeScript UI 工具仓库。JSX/CSS 首版已正式发布，UI 独立包改名候选仍在本地验收，产品切换尚待后续；原 Rossovia 产品仓库的源码、服务、正式依赖和 Git remote 均未在这里切换。

## 包

| 包                                          | 职责                                                                                                |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [`meowjsx`](packages/meowjsx/README.md)     | 平台无关 JSX / reactive runtime；浏览器能力通过 `meowjsx/web` 显式加载                              |
| [`meowcss`](packages/meowcss/README.md)     | 通用 token / CSS 生成，另有 `/meowjsx` 与 `/web` 适配入口                                           |
| [`meowtail`](packages/meowtail/README.md)   | 组件、语义布局和具体标准主题；本轮完整 Assistant 与有限 JSON catalog 的本地实现及有限独立验收已完成 |
| [`meowbook`](packages/meowbook/README.md)   | 组件展示、检查、浏览器预览与截图工具                                                                |
| [`meowpress`](packages/meowpress/README.md) | Markdown / MDX 静态站点构建工具                                                                     |

[`apps/showcase`](apps/showcase/README.md) 是私有展板，不是第六个发布包。本轮完整 Assistant 与有限 JSON→UI 已完成本地实现及有限独立验收，实际同源输入、产物与未覆盖范围见[本地迁移回执](docs/local-migration-receipt.md)；早期混合产物的通过不作为本轮同源证据，也不表示 Rossovia 已切换或正式发布。

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

公开源码仓库为 [lidessen/meowland](https://github.com/lidessen/meowland)。`meowjsx@0.1.0`、`meowcss@0.1.0` 已完成 npm 发布、独立 registry 消费与正式 Release；原 tag 和资产保持不变。独立 UI 包由 `meowui` 改名为 `meowtail`，初始候选仍为 `0.1.0`，尚未发布或取得新名称发布权；404 查询不保证可注册。公开入口为 `meowtail`、`meowtail/chat`、`meowtail/json` 等，`createMeowUI`、`installMeowUI` 和既有 DOM/CSS 标记保持兼容，不合入 JSX/CSS。

`meowbook` 已改用新 UI 包，但旧 `meowbook@0.1.0` draft/tag 仍绑定原候选，不能承载新 bytes。其本地候选仅供验收；正式发布前须确定新的 Book 版本，或另行明确授权处理旧未公开 draft/tag。`meowpress` 本人发布返回 E409，观察窗口内仍未公开，后台处理原因未知；不盲目重发。后续单独授权的精确发布批次沿[本地发布](docs/releasing.md)执行，本轮改名实现不含推送、发包或远端资产变更。

自有代码采用 MIT，根 `LICENSE` 与五个包的 `license: "MIT"` 字段已实际写入；当前产物仍须按本轮精确输入验收，文件落地不代表已完成打包或正式发布。第三方资源继续适用其原许可证。
