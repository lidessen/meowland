# Meowland

独立的 Bun / TypeScript UI 工具仓库。本轮本地迁移与有限验收完成，正式发布及产品切换尚待后续；原 Rossovia 产品仓库的源码、服务、正式依赖和 Git remote 均未在这里切换。

## 包

| 包                                          | 职责                                                                                                |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [`meowjsx`](packages/meowjsx/README.md)     | 平台无关 JSX / reactive runtime；浏览器能力通过 `meowjsx/web` 显式加载                              |
| [`meowcss`](packages/meowcss/README.md)     | 通用 token / CSS 生成，另有 `/meowjsx` 与 `/web` 适配入口                                           |
| [`meowui`](packages/meowui/README.md)       | 组件、语义布局和具体标准主题；本轮完整 Assistant 与有限 JSON catalog 的本地实现及有限独立验收已完成 |
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

目前没有公开发布或创建新的远程仓库。2026-10-16 官方 npm registry 查询中，`meowjsx`、`meowcss`、`meowui`、`meowbook` 返回 404，这不保证将来可注册；`meowpress` 返回历史撤包信息，名称归属与发布权尚待确认。本地同名 tarball 不表示拥有该名称。

用户已选择自有代码采用 MIT。当前 LICENSE 与 package license 字段的写入仍受工具审批阻断，尚未落入文件；该项不影响本地构建，正式公开发布前须解决。第三方资源继续适用其原许可证。
