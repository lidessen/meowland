# 本地迁移回执

状态：本轮本地实现与有限独立验收完成。源码提交为 `543a5773e412c8fa396b2de6975321c1983033ee`，来源是 Rossovia 的 `046b044e1bfde8c79b186fab2948ba2260371790`。本页只收口本地结果，不表示公开发布、Rossovia 产品切换或完整平台验收。

## 本轮完成的范围

五个包为 `meowjsx`、`meowcss`、`meowui`、`meowbook`、`meowpress`。Web 源码合入 MeowJSX，以 `meowjsx/web` 显式消费；core 根和类型不加载 DOM。MeowCSS 提取通用生成机制与必要 adapter，具体主题、语义布局和完整 Assistant 留 MeowUI。

`meowui/chat` 提供完整 Assistant 组合，默认消息、安全 Markdown、代码、过程、composer、附件、活动/工作详情与待答问题使用同一实现。宿主继续提供数据、动作、权限与持久化，不迁入 Rossovia 后端。

JSON 通过 `meowjsx/json` 与有限 `meowui/json` catalog 构造同一组件。首片不是全 UI schema 或任意 TS Props 自动反射；默认没有本地 File ingestion，不开放任意 HTML、代码执行或任意宿主对象路径解析。JSON 文本交互、绑定与动作仍使用宿主显式注册合同。

## 同源与安装态证据

作者以冻结源码执行一次同源五包 build、根 types 和 pack，均退出 0。源码清单含 545 文件，独立逐 byte 核对无差异；没有用早期 first/mixed phase 结果代替本版。

- 源码清单：`/tmp/meowland-final-candidate.xYtXbO/source-final.sha256`，SHA256 `bbacf0bf805e7877aa48b6af1b1bb5d74af3df13c22b02bfe6c0d98cb4127859`。
- 五包产物清单：`/tmp/meowland-final-candidate.xYtXbO/tarballs.sha256`，SHA256 `bf536dc3019251659c3a9cfb063b16106f2201c8791bade5df77c0b42636118a`。
- 独立验收：`/tmp/meowland-final-consumer.QEzSbr/ACCEPTANCE.md`，SHA256 `5f5f0dacf75b8a7d79d07a0353162733abc6fd90f5e328e718769f0d4da954f2`。
- 完整身份：同目录 `identity.json`，SHA256 `d45b60ac570dc6a52f88efbbc0835040b8e574edc3ee8119c5c03dd6967ad74d`，绑定源码、五个 tgz、夹具、浏览器结果及七图。

独立消费者只安装这五个精确 tgz，第三方使用已下载缓存，没有源码 alias、原仓库 node_modules 或 workspace 逃逸。579 个已安装文件与 tgz 逐 byte 一致，10 条 canonical symlink 无悬空、无目录外逃逸。

实际环境为 Bun 1.4.2、TypeScript 7.0.2、Node 26.8.1、Chromium 153.0.8010.12。无 DOM 的公共类型、浏览器公共 Assistant/JSON 类型、真实 Node 共享模块身份及安装态浏览器构建均通过；没有用 Bun 冒充 Node。

浏览器六组行为通过，独立验收者实际查看七张最终图。覆盖 JSX/JSON 同一 Assistant、长过程与分页阅读、消息区域内回最新、发送快照接受后保留后续草稿/真实 File、活动详情与问题动作、窄/短窗明暗及焦点。JSON 默认无附件入口，文本发送真实调用夹具宿主动作。

Book/Press 不重复旧绿矩阵：最终 Book 相对已验修正版只有 README 变化，Press 的最终 tgz 完全相同；已有安装态 CLI、Book capture/公共宿主类型、Press 无产品图片依赖的 MDX/字体/OFL 证据据身份复用。CSS 仅 README 与一处 import 尾逗号格式变化，新 adapter 已由本版浏览器实际使用。独立报告保留首次失败、修正及复用范围，不将 `--help` 的 Usage/退出 1 写成帮助命令通过。

## 尚未完成与阻断

- 没有重跑全部 unit、所有浏览器配置、WebKit/Firefox、原生 App、真实触屏/IME/辅助技术完整矩阵；没有真实后端、上传、消息、模型或用户浏览器 profile 操作。
- 用户明确选择自有代码 MIT，但同一 `apply_patch` 路径的重试仍以 `user withheld` 拒绝；已停止且未换写入方式。LICENSE 与五包 license 字段尚未落入文件。字体 OFL 与 Lucide 等原 notices 保留，不被拟采用的 MIT 覆盖。
- `meowpress` 官方 registry 返回 200 撤包存根，owner、历史内容与重发权仍未知；`meowsite`、`meowpages`、`meowpub` 当时返回 404，只是候选，不保证可注册或获得发布权。没有自动改包名。
- 没有创建新 GitHub remote、推送、npm 发布、写发布凭据或恢复 CD。Rossovia 的原库源码未删，正式依赖、remote 与 Go module 尚未切换；原仓库保持 `b594e403`，本地分支的三个未推文档提交仍保留。

本次仅根 README 与本回执为收尾文档变化，不改变编译输入或已验五包产物；运行时证据继续绑定 `543a5773` 与上述清单，没有为文档再构建、测试、重打包或调用模型。
