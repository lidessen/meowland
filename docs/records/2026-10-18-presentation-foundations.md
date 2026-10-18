# 演示布局基础：列、列表与图片

## 目标与边界

在已有 Meowtail 演示体系内补齐常用两/三栏、原生正文列表与可靠的图片/图注组合。
本轮优先响应用户指定 a4 图片留白；逐空练习仅完成缺口研究，未实现，也未将 Reveal 描述成逐空组件。
保留课程问题、任务状态、媒体来源与配色；不修改 Rossovia、版本、依赖、锁文件或发布工具。
未知 `data/` 未读取或修改。没有推送、发布或部署。

## 第一轮：核实与反例

- 现有 `PresentationLayout` 已有 single/equal/wide-start/wide-end，equal 即两栏；通用 Grid 能三栏，但演示布局缺直接三栏。
- ListGroup 面向应用行列表，Timeline 面向事件流；两者均不能冒充投屏正文 ul/ol。
- 指定截图 Library `libfile_7ebd8cfd772c8191be98d1e6e14a6080` 已核实身份并打开原图。森林源为 5184×3456、3:2，原图没有内嵌边框。
- a4 实际槽位约 568×156.84；contain 图像只占宽 41.42%，左右各留约 166px。相同槽位强制 cover 会裁去约 59% 高度，不是可靠的通用默认。

布局/列表和图片分别由独立 owner 实施；独立质疑者先核对有限高度、原生语义、裁切/完整显示及简单 API，再写实现。

## 实现

- `PresentationLayout columns={1 | 2 | 3}`：1/2 复用既有 single/equal 分配，3 使用同一 body grid；旧字符串兼容。逻辑列不因物理窄窗口自动重排。
- `PresentationList items={...} as="ul" | "ol"`：真实 ul/ol/li 与浏览器标记，支持原生 start/reversed；复用演示正文 tokens，嵌套继承字号、长词可换行。静态 null/undefined/boolean 省略，数字 0 保留。
- `PresentationImage`：一个真实 ImagePreview 的 figure/frame/caption 薄适配。默认 ratio=16/9、contain、center；显式 cover 与九点 position；ratio="fill" 消费有限父级余高，图注自然占高。
- 加载/失败与事件复用原组件，不复制状态机；不改变全局 ImagePreview 默认，不添加 Lightbox、自动裁切或自动缩字。
- 根与 presentation 子路径共享组件/contract 身份，主题及 registry 同时接线。Meowbook 真实三页 gallery 和作者指南均已更新。

## 第二轮：组合发现与收敛

实际浏览器和截图共同发现两个不能用“无溢出”掩盖的问题：

1. 新图片主题早于基础 ImagePreview 样式，零特异性 part 规则被后者覆盖，实际 img 仍 180px/contain，遮住图注。将适配样式排在基础样式之后，补 actual img 与 frame 同边界、computed fit/position 回归；未增加选择器提权。
2. 仅改 cover 的两栏版本把森林裁成 568×122 的薄条，图注又占 84px。独立复看否决该构图。最终 Panda watch 用共享三栏将视频、森林和原有三条问题分开，森林约 373×316；用默认正文 PresentationList 替换私有 22px 列表 CSS。

数值比例在 grid 默认 stretch 下也可能被拉高，已用自身对齐与不 grow 保持首选比例；只有 fill 领余量。
最后把新图片的状态文字限定为演示 caption token，避免应用 12px 失败提示在投屏中太细。
原双照片观察页保持 contain；森林为明确标注裁切的环境图，不能作为森林变化的事实证据。

## 冻结版本验证

同一最终源码/dist：

- 根 build、root typecheck、完整 Meowtail tsc（含公共正负类型）、Panda tests tsc 通过。
- 全套单测 331/331，69 文件、2063 断言。
- 新布局/列表/图片真实 Chrome 浏览器 7/7；覆盖数值/旧别名、长词/超容量诊断、原生倒序/嵌套、数值比例、三种源图四角、显式裁切、加载→失败、自然图注。
- 既有 Presentation 浏览器 33/33；Panda 完整 13/13；Sunshine 定向 3/3。后者仅教师揭示、跨页状态和提示，不宣称全套 Sunshine 或全仓浏览器矩阵。
- Meowbook check：Panda 5 stories、Meowtail 115 stories。新增 gallery 只组合公共组件，无第二套组件实现。
- 正式 gallery 从 Meowbook 目录进入，三页×宽/窄/短共九图均由独立 owner 实际打开，无诊断或运行错误。短窗外围文档高 344 超过 330，但播放器目录在 y283–327 完整可达，逻辑画布未裁切；不将其宣称为完全无页面滚动。
- 仓库 fmt、lint、diff 检查通过，fmt/lint 明确排除 `data/**`。
- 新三包 tgz 在空的仓库外 `/tmp/meowland-component-consumer-a558Ij` 离线真实安装：root/subpath 组件与 contract 身份、严格类型七项负例、无 DOM core、四视口图片/列表/列布局浏览器通过；无源码 alias、父 node_modules 或逃逸 symlink。
- 当前 dist、打包 staging、安装文件逐文件 SHA 一致。Meowtail tgz SHA256：`c701aede4a8bf110d5259ab53295a9aab3f37c65cadd122e8f37ca127ff12a27`。此新 batch 仅用于本轮验收，不替换另一仓库迁移约定的旧 tgz。

安装回执：`artifacts/presentation-foundations-consumer-vuyqp0di/receipt.json`；
组件 owner 回执：`artifacts/panda-a4-independent-visual/IMAGE-REVIEW.md`；
独立组合观察：`artifacts/interaction-media-review/`（最终 watch 使用 `watch-final-three-*`，旧两栏图不作为交付）。

## 实际交付与截图

当前本地预览 `http://127.0.0.1:13014/`，a5 `chunk-03jpht82.js`；未停止既有服务，保留旧哈希资源供缓存页使用。
候选 12 文件逐字节核对后原子更新入口；manifest SHA256：
`6f7b79c2f06367d9d92b62afe3083bae995efa08020830c6a778ef573a71e518`。
最终 live 冷启动拍摄 11 图、无运行错误；根实际打开宽屏播放、窄/短 watch、宽屏双照片，另有独立 owner 实际打开两页三尺寸和失败/键盘图。

Library 完整 ID（均已成功上传并记录本地版本属性）：

| 用途                      | Library ID                                 |
| ------------------------- | ------------------------------------------ |
| 改前 a4 用户指定图        | `libfile_7ebd8cfd772c8191be98d1e6e14a6080` |
| 改后 a5 宽屏播放 1440×900 | `libfile_4e2fecad674481919b6b86da6e0bb8f9` |
| a5 窄窗口 390×844         | `libfile_af13ceca8f1c8191a0b1bd1377b7ce5b` |
| a5 短窗口 1280×330        | `libfile_a885800e1aec819198b62b4f2d424346` |

截图与测量在 `artifacts/presentation-foundations-a5/live/`，上传回执在相邻目录。
正式 gallery 证据在 `artifacts/presentation-foundations-gallery-final/`。
仅 Chrome/Chromium 实际验收，未测试 Safari、真实屏幕阅读器或触屏设备；窄/短是固定逻辑画布概览，不能宣称正文无需放大可读。
fill 仍需有限父级，cover 仍会裁内容；超过容量应改编排、精简或拆页，不能靠图片适配无限容纳文字。

共享实现、公共合同、测试与作者指南提交为 `aa11989`；Panda 消费与本记录单独提交。
