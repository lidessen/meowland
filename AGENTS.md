# Meowland 开发入口

这是独立的 UI 能力库。先读[根 README](README.md)、所属包 README 和更深层 AGENTS，再从[技能索引](.agents/README.md)按任务加载方法，不预读所有技能或历史记录。

## 容易破坏的边界

- MeowJSX 根及其类型不依赖 DOM；Web 显式走 `meowjsx/web`。MeowCSS 根不依赖 JSX、UI 或 DOM，组件与 Web 适配由子路径承担。
- 同一渲染图共享 core 模块，同次主题组装共享 CSS token/fragment 身份；不能把各入口分别内联成多份 runtime、Context 或 Symbol/WeakMap。显式创建多个 Runtime 仍是合法隔离。
- Meowtail 拥有通用结构、完整 Assistant、具体主题和语义布局。`apps/showcase` 与 stories 只传场景数据和驱动交互，不复制组件实现；后端、业务事实、权限、上传与持久化留宿主。
- Meowslides 拥有演示播放、演示内容布局、渐显、媒体和创作工具；单向依赖 Meowtail 的通用能力。MDX 是可信本地代码，不把上传或生成的任意文本默认执行。
- JSON 入口复用同一组件与有限合同，不把任意业务 JSON、函数或对象路径变成执行能力。支持集以包内 JSON 说明和实际导出为准。
- 包外消费使用 public exports；源码、测试和提交信息用英文，文档用中文。第三方资源继续保留自己的 notices。

## 按风险推进

独立工作可以并行，共享文件先对齐 owner 并保留无关 WIP。复杂任务先明确目标、依赖和可观察结果；改变职责、公共合同或生命周期等机制时，先与独立质疑者达成有界共识，普通实现、局部修复和文案不必重走设计流程。

检查命令及覆盖范围见[开发检查](docs/development-checks.md)。视觉和交互变化实际打开对应场景；静态检查、行为观察、安装态验收与正式发布分别报告。必要检查成立后，只为新改动、失败或未决风险补测，不用重复全矩阵代替判断。

发布合同见[本地发布](docs/releasing.md)。普通 push/PR 的 Actions 只做 build/lint；npm 发布仅走用户已授权的手动 workflow_dispatch + Trusted Publishing OIDC，不部署；构建、打包、tag 或 draft Release 都不等于完成发布。提交、推送与真实发布仍按本次任务授权执行。
