# 浏览器演示与课件

以下作品均在仓库根按各自 README 构建和启动，使用独立端口；不是 PPTX 文件或已发布网站。

| 作品                                                    | 入口与启动说明                                 | 默认本机地址              |
| ------------------------------------------------------- | ---------------------------------------------- | ------------------------- |
| 八上 Unit 5 · Wild animals — Reading: Protecting pandas | [熊猫阅读课件](protecting-pandas/README.md)    | `http://127.0.0.1:13014/` |
| 八下 Unit 6 · Sunshine for all — Welcome                | [Sunshine Welcome](sunshine-welcome/README.md) | `http://127.0.0.1:13012/` |
| MDX 作者起手示例                                        | [演示创作](presentation/README.md)             | 以作品 README 为准        |
| 图片加载：同图、不同等待                                | [完整互动讲解](image-loading/README.md)        | 以作品 README 为准        |

作品持有内容、课堂状态与来源；共享演示画布、内容布局、媒体和导航由 Meowslides 提供，通用 UI 与布局来自 Meowtail。
先预览一个关键片段，再根据反馈继续修改；素材与原文核实、浏览器行为和实际课堂效果分别记录。

Panda 完整课件在 `examples/protecting-pandas`，独立于 MDX 起手示例和图片加载讲解。同版依赖/包构建就绪后，从仓库根运行：

```sh
bun examples/protecting-pandas/build.ts
bun examples/protecting-pandas/serve.ts
```

打开 `http://127.0.0.1:13014/`；教学内容、素材依据和改稿方式见[熊猫课件 README](protecting-pandas/README.md)。
