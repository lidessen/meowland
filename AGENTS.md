# Meowland 开发入口

这是独立 UI 库仓库。库源码属于 `packages/`；`apps/showcase` 只负责展示与验证，不拥有另一套组件实现。Rossovia 的后端、业务状态、执行协议与权限实现不迁入这里。

- 先读根 README、所属包 README 与更深层 AGENTS。实现保持平台边界：MeowJSX 根不依赖 DOM；Web 通过 `meowjsx/web`；MeowCSS 根不依赖 JSX、UI 或 DOM。
- 包外使用明确的 public exports；构建保留共享模块图，不能为不同入口复制 runtime、Context、token 标识或 registry。
- 通用结构、完整 Assistant 组合、局部定制入口、具体主题与语义布局归 MeowUI；MeowCSS 只提供通用机制。场景传数据和受控 props，不复制组件或完整界面实现；产品事实与动作适配留宿主。
- 源码、测试和提交信息用英文，文档用中文。保留第三方 notices，不能用本仓库许可证覆盖第三方字体、图标或依赖许可。
- 修改前后核对当前文件状态并保留其它作者 WIP；启用 Git 后同时核对工作树与 index。只按明确授权的稳定范围提交；不批量暂存、不自动推送或发布。
- 测试保护真实行为、类型环境和发行资源。单测、类型通过、浏览器观察、独立 tarball 消费与正式发布分别报告。
- 本地命令见 README。复制源码、构建成功或生成 tarball 均不代表公开发布，也不代表 Rossovia 正式消费已经切换。
