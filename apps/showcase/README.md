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
