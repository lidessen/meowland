# 组件展板

本应用使用 `meowbook` 展示 `packages/meowtail/stories` 中的公共组件场景，不依赖 Rossovia 后端。

在仓库根目录运行：

```sh
bun run build
bun run --cwd apps/showcase dev
bun run --cwd apps/showcase check
bun run --cwd apps/showcase build
```

本地开发地址为 `http://127.0.0.1:13003`；静态构建输出到 `apps/showcase/dist`。
场景只传数据、控制 props 或排列变体，组件结构、样式与交互来自 Meowtail 实现。
预览样式负责展板容器，不补齐组件缺失的默认样式。

浏览器规格位于 `tests/`，执行 `bun run --cwd apps/showcase test`。

## 演示组件展板

独立的 `meowslides` 场景使用另一份 Meowbook 配置，通用 UI gallery 不反向依赖演示包：

```sh
bun run --cwd apps/showcase dev:slides
bun run --cwd apps/showcase check:slides
bun run --cwd apps/showcase build:slides
```

开发地址为 `http://127.0.0.1:13006`，静态产物在 `apps/showcase/slides/dist`。
`slides.preview.ts` 通过公共入口安装通用 UI 与演示 registry，并装配完整 `presentationTheme`。
两份展板用于开发和验收组件；普通讲稿从 [最小 MDX 作品](../../examples/presentation/README.md) 开始，
不要求作者复制 Meowbook 配置。
