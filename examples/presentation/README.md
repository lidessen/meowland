# 最小浏览器演示：Read a landscape

作者主要编辑 [slides.mdx](slides.mdx)：普通 Markdown、双栏、图片、逐步呈现和一个课堂问答。
完整自定义互动讲解见[图片加载作品](../image-loading/README.md)；通用媒体场景与压力验证归 Meowslides stories/tests，不作为每份讲稿的起点。

刚开始只需要下面这样的 `slides.mdx`，不用 import、页数组或 `Slide` 声明：

```mdx
# Observe first

Describe what you can see.

---

# Explain with evidence

Use one visible detail to support your claim.
```

目录标题、默认布局和排版由工具生成。本目录的七页实稿继续展示可选的双栏、图片、渐显、互动和音频；
不需要这些能力时不必保留对应页面或 TSX 文件。需要长期引用某页时再显式填写稳定 id。

Panda 完整课件单独位于 [examples/protecting-pandas](../protecting-pandas/README.md)，不在这个最小示例中。同版包就绪后，从仓库根运行：

```sh
bun examples/protecting-pandas/build.ts
bun examples/protecting-pandas/serve.ts
```

打开 `http://127.0.0.1:13014/`。课件独立保留，教学内容没有复制到本例。

## 预览与构建

先在同版本 Meowland checkout 按根 README 安装依赖并构建包，然后从仓库根运行：

```sh
bun run --cwd examples/presentation dev
bun run --cwd examples/presentation build
```

`dev` 自动重建并刷新浏览器；这是整页重载，会开启新会话，不是保留状态的 HMR。
默认打开 `http://127.0.0.1:3030/`，可用 `bun run --cwd examples/presentation dev -- --port 13029` 指定端口。
`build` 输出 `dist/`，用普通静态 HTTP 服务打开；不默认支持双击 `file://`。
当前拆包与 MDX 工具尚未发布，不用旧 npm 包冒充同版本环境。

## 作者写什么

- 普通文字、列表与图片直接用 Markdown，默认主题负责排版。
- 顶层、空行包围的 `---` 分页；代码围栏与嵌套内容里的横线不分页。
- 每页首个 `#` 标题同时用于画面和目录，只显示一次。`Slide id` 提供稳定定位；改标题时保留 id。
- 双栏显式写 `<Slide columns={2} />` 和两组 `<div>` 内容，不按段落数猜左右。
- `Reveal at` 与本页 `steps` 控制呈现次序；互动选择不会自动翻页或揭晓。
- 自定义课堂逻辑在 [QuickCheck.tsx](components/QuickCheck.tsx)，继续用普通 MeowJSX signals 和通用组件。

问答的 `createSession` 每场演示创建一次，选择与反馈跨页保留；`Reset check` 才清除本题，刷新创建新会话。
MDX 中只引入工厂与组件，不把可变 signal 放在模块顶层让不同演示串值。
作者不复制 main、服务器、构建脚本、主题装配、组件注册或媒体声明文件。
`tsconfig.json` 仅供仓库维护者检查自定义 TSX 组件，不是 MDX 工具启动或普通作者必写的文件。
MDX 是可信本地代码，按正常源码审阅；它不是接收不可信上传内容的运行入口。

素材为仓库原创插画与六秒纯音，来源见 [NOTICES](assets/NOTICES.md)。
本例不依赖 Meowbook；组件场景和复杂工作夹具仍可独立使用 Meowbook。
