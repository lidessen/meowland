# Presentation 共享组件修复与课件复验

用户指出不能靠调整单份 PPT 修复共享问题，因此以 Protecting pandas 复现并验收，在 Meowtail 公共组件层统一处理。仓库正式包名仍为 `meowtail`，未重命名。保留用户材料、未知 `data/`、Rossovia 和 Sunshine 的课堂内容；本轮仅本地提交，不推送、发布或部署。

## 两轮实质闭环

第一轮在实际课件中复现标题样式影响播放器 chrome、支持面板隐藏时布局跳动，以及 body 内容穿过 footer 但 article 的 scrollHeight 仍为 720 的遗漏。独立审查将它们与普通内容设计分开：选择、草稿、重做状态属于宿主；删除重复文字、语义列宽和紧凑间距属于正常编排；隐藏/焦点/活动许可、内容类作用位置和区域溢出诊断属于共享组件合同。

第二轮在通用 Meowbook 压力场景、两份实际课件和独立安装目录复验。独立安装态继续找到了缩放时新旧几何混用和紧行高文字范围的误报，修复同样回到组件层。验证分别记录自动化断言、实际截图观察和安装态消费，不能互相替代。

## 公共合同与消费者

- `Reveal` 支持互斥的 `at` 或受控 `when`。两种模式共享同一保留几何、隐藏 AX/焦点、活动暂停与动画取消路径；同一节点和输入草稿保留，恢复活动不补播媒体或入场动画。未引入第二套显示状态组件。
- `Presentation.slideClassName` 将作品类放到当前 slide article，原 `className` 仍作用播放器根。它明确内容样式的挂载点，不承诺任意 CSS 的沙箱隔离。
- 溢出诊断检查画布及最近的 `PresentationLayout` header/body/footer 分配区域，支持文字行、动态内容及隐藏/显示变化。显式滚动或裁切的 owner 负责内部内容，其自身越界仍诊断；背景装饰及 top layer 不误算正文容量。诊断只警告，不自动裁切、缩字或扩张画布。

Panda a3 将作品自己的显隐接线替换为 `Reveal when`，由共享组件统一负责 visibility/inert/aria-hidden、焦点与活动许可；使用 `slideClassName` 并删除逐标题 class 补丁。选择、支持开关和草稿依然由作品工厂持有，课堂文字与素材来源保持不变。Sunshine 仅切换内容类挂载点，构建/服务增加候选输出目录，避免覆盖仍运行的旧预览。通用 stories 复用真实组件，覆盖长 token、嵌套 min-size、输入、活动与媒体。

## 验证边界

最终统一 build 后，根 typecheck、Meowtail 全包 tsc 与根单测通过：325 项、67 文件、2019 断言。
相关组件浏览器 15/15（诊断 6、受控 Reveal 4、既有布局 2、背景 3），既有 Presentation 合同全套 32/32。
Panda 全套 8/8（14.8 秒），Sunshine 定向 3/3（4.9 秒）；后者覆盖教师逐步揭示、跨页状态/显式重做、提示与 reduced motion，不冒充 Sunshine 全套验收。
全仓格式检查显式排除 `data/**`，lint 同样排除且 deny-warnings；skill 校验通过。八份相关文档的 26 个相对文件链接存在性检查通过，本轮此检查不覆盖锚点。

独立质疑者读实际 diff，并以真实浏览器验证 16 个共享合同点及 8 个缩放点；最终字体修订另补 8/8，包括 direct text、inline span、真实多行越 footer、横向长 token、撤去清除和窄短缩放。
普通窗口 1100×760 的 live a3 37/37 原图已由独立审查者逐张打开：封面初/终两态，五题默认、选中、Hint 单开、Reference 单开、Evidence 单开、全开、回访七态。没有新增重叠、裁切或支持栏跳动；pageerror 与可见诊断均为零。逐图索引为 `artifacts/protecting-pandas-review/live-normal/a3/REVIEW.md` 与 `index.json`。
另一独立审查者在 1440×1000、1280×500 的同版 live 各拍同样 37 态，共 74/74 原图逐张实际打开。选中、长草稿、高亮、单开/全开与回访均完整；每题七态支持栏位置不变，body 259/scrollHeight 259，正文与 footer 保留 16 逻辑 px。原图、74 行逐图索引 `VISUAL-INDEX.md` 与 `facts.json` 归档 `artifacts/protecting-pandas-review/live-visual/a3/`。根另实际查看宽屏问题全支持、普通窗口成长默认、短窗行动全支持。共 111 张 live 图逐张审阅，不包括下列另拍的 18 张自动化图。
同版全展开自动化另拍六页 × 1440×900、390×844、1280×330，共 18 图，归档 `artifacts/protecting-pandas-review/a3/automated-scenes/`；根实际查看窄窗成长页和极短窗长草稿行动页，不宣称这 18 图全部人工看过。
历史 a1 的截图与私有 a2 候选保留为过程证据，不计入 a3 的完整逐图结果。

安装态使用三个全新 tgz，在仓库外 `/tmp/meowland-component-consumer-BkHwcQ` 离线真实安装，无源码别名、逃逸链接或父级依赖。当前 dist、打包副本和安装文件逐文件 SHA 一致；严格公共类型正例/五项负例、无 DOM core、root/subpath 身份及实际浏览器消费通过。
原始 `48px / 1.1` 标题反例与纯 inline 换行已原样复验；真实多行、nowrap、inline-block 越界仍诊断。四视口九张截图实际查看，pageerror 为零。
回执为 `artifacts/presentation-components-final-consumer-p66ucuuu/receipt.json`；Meowtail tgz SHA256
`55d755f1b404aca8cdb79f22ab308c871b4404bb5361a960b5e9beafb8dee433`。这是本地安装态验收，未发布 registry。

最终 Web 脚本 `chunk-zrg09fpk.js`，build-manifest SHA256 为
`d881cd0d2275c91d3c2b420e5894fcaf644b1dfb325feb2fd5ab51d0e3739f4e`。
候选七个文件与 live 逐字节核对后原子更新 index，HTTP 200；保留旧哈希资源与 `13014` 进程，不重启用户现场。
作品外围标题含 `a3`，旧标签页需要刷新；刷新会清空本场草稿。旧 Sunshine `13012` 保留，回归使用独立候选目录与测试服务。

代表图使用实际 live 的“问题与后果”全支持宽屏原图，根与独立审查者均实际查看后，替换已有 Library 文件到 version 1：
`libfile_95916a411e8c8191a2ee5da6a478b07c`。
本地副本与完整上传回执为 `artifacts/protecting-pandas-review/a3/`，保留 a1 历史，不重复建立另一个同名 Library 文件。

本轮根测试、组件和 Presentation 浏览器分别完整运行；没有运行全部无关组件浏览器矩阵。类型、静态检查、行为断言、视觉观察和安装态分开记录；build、pack 与本地提交都不等于正式发行。

保留一项内容边界：问题页 Reference 是 forests 的通用示例，保护页也是通用关联提示，不随当前选择动态生成。本轮按用户要求保留课堂原文字，不将此解释关联问题伪装成共享组件故障。

实现与相关规范本地提交 `bf5208d`；验证用源码哈希与独立安装回执一致，提交前后无生产源码变化。
根自有正式图测试服务 `13009`、组件审查 `13058` 与各测试/安装态临时服务均已退出；用户预览 `13014` 和旧作品 `13012` 保留。

未做 Firefox、人工屏幕阅读器、实体手机、真实课堂投影或学习成效观察。窄短窗口采用整体画布缩放；控件可达不代表手机正文适合阅读。诊断是有限演示画布的可视警告，不是通用 CSS 验证器。没有改变课件来源事实、无关整体配色或后端持久化职责。
