# Meowpress

`meowpress` 提供静态站点的内容读取、页面渲染、主题和构建流程。
消费者持有站点配置与内容，通过本包构建；本包不持有应用的文章或输出目录。

本包是独立内容发布库，源码位于 `packages/meowpress`，已有公开构建入口、独立测试与类型检查，
不依赖 Assistant、WorkCell、Deno 或特定 Blog 的内容与运行状态。样式生成来自 `meowcss`，
HTML 渲染来自 `meowjsx/web`，无需安装 MeowUI。

## 入口

- `meowpress/build`：`meowSite()` 定义配置，`buildSite()` 执行构建；这是唯一对外 export。
  内容读取、页面渲染、技能索引与主题是包内模块。
- `meowpress --config ./site.config.ts`：Bun CLI，加载消费者提供的配置并构建。

```ts
import { meowSite } from "meowpress/build";

export default meowSite({
  content: [{ directory: "/path/to/content" }],
  skillsDirectory: "/path/to/workspace",
  outputDirectory: "/path/to/dist",
});
```

配置中的目录由应用明确提供；默认主题从本包解析，不依赖启动目录。
可通过 `theme: defineTheme(...)` 替换整套主题；所有静态页面输出该主题的根属性和默认选项。
构建将 `theme.cssText` 写入临时 CSS，再由 Bun 处理字体与其他资源，最终通过 stylesheet 链接交付，
无需客户端 JavaScript 即可应用主题。默认字体 Geist 的文件随站点打包，不依赖外部字体服务。
使用默认字体时，输出同时包含 `licenses/geist-OFL.txt`，保留字体的 SIL OFL 许可。
默认插画使用包内矢量与 CSS，不要求业务图片。可用 `site.images` 的 `hero`、`feed`、`about`
显式设置装饰图路径，例如 `images/cover.svg`；路径相对内容根的 `assets/`，库负责各页面深度，
资源沿现有资产构建流程交付。未设置 About 图片时使用站点名首字母。
内容源包含 `posts/`、`thoughts/` 和可选资源；以下划线开头的草稿不进入发布输出。
站点有自己的主题，不隐式安装 MeowUI 的应用主题。

## 验证与构建

当前迁移提供本地构建与 tarball，尚未正式发布 npm。安装本轮 `meowpress`、`meowcss`、
`meowjsx` 产物后，在消费者目录运行：

```sh
bunx --no-install meowpress --config ./site.config.ts
```

CLI 需要 Bun，输出位置由 `outputDirectory` 决定。字体文件从本包的正式 Geist 依赖解析，
不要求消费者复制源码、安装工作区根依赖或访问外部字体服务。

## 独立验证

仓库依赖就绪后运行 `bun run --cwd packages/meowpress test` 和
`bun run --cwd packages/meowpress typecheck`。测试位于 `tests/unit/`；真实构建测试通过公开
`meowpress/build` 入口创建临时内容、主题和图片，
覆盖 Markdown、MDX、Thought 输出及草稿页面/资产排除，不读取 Blog 内容或调用 Blog 构建。
