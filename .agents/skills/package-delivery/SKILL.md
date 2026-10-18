---
name: package-delivery
description: Change public exports, types, dependencies, CLI or package resources; verify clean tarball consumers or prepare the documented local release workflow. Not ordinary internal UI edits.
---

# 包合同与本地交付

从受影响包的 manifest、README 和实际外部用法确定范围。各包独立 semver；Web 随 `meowjsx`、CSS adapters 随 `meowcss`，演示归 `meowslides`，根与 showcase 私有。普通按钮修复不因本技能存在就强制全包发行验收。

## 验证真正的消费边界

exports 的 JS 与 types 都指向正式包内产物；浏览器入口不夹 Bun/Node/Playwright，core/CSS 根的声明也保持环境独立。共享 core 或 opaque CSS 值的 peer 范围与实际安装图一起核，不能只看包版本相同。CLI 运行必需工具正常声明，不靠 workspace 根 hoist 补齐。

`files` 应携带所需模板/HTML/字体/notices 与声明，不带整个源码仓库兜底缺资产。Meowbook 自建画布、摄影与宿主类型，MeowPress 的 MDX/主题/字体和非 root cwd 都是真实消费边界；遵循各自 README，不拿库内编译成功替代它们。

构建、类型与打包命令以[开发检查](../../../docs/development-checks.md)为准。pack 本身不证明已重新 build，使用一个明确源码版本生成并记录精确产物；已冻结同 byte 产物的有效证据可复用，不能因文档提交或摘要变化重复全矩阵。

需要安装态证据时，在仓库外空目录安装实际 tgz，不带源码 aliases、相邻 checkout、父 node_modules 或逃逸 symlink。验证受影响的公共子路径/类型和消费者可观察行为；必要时让 Signal/Context 或 token/fragment 穿过包边界。用哪些第三方缓存、override 和模拟宿主应说清，不把 fixture 反馈当真实后端通过。

## 版本与发布

维护者或 Agent 准备受影响包的源 manifest 独立版本、依赖范围与发布说明，按[本地发布](../../../docs/releasing.md)当前合同执行；不要求每个 commit、PR 或纯文档改动都生成版本记录。build/pack 并验收选定产物后，在 release manifest 显式列出包与目标版本，交本地唯一发布脚本核对源 manifest、tarball、目标和依赖范围。脚本不推断版本联动，技能不另编版本算法、固定版本组、命令表或发布账本。

Actions 只做 build/lint，不发 npm、不部署，也不以 tag 自动发布。只有本次任务已授权真实发布时才进入脚本的执行模式；否则停在其本地 dry-run/只读计划。选定版本与 tarball 不因进入发布阶段重新打包。tag/draft Release、npm 成功及正式 Release 是不同结果；中断恢复沿同一已核身份接续，不覆盖已发版本或盲目重发。

名称可查询、代码已有许可决定或本地包可用，都不自动提供当前账号的发布权。当前阻断从根 README、发布合同与实际回执读取，不把一次工具拒绝或历史 npm 查询写成永久规范。保留第三方许可，既定用户决定不因技能示例被改写。

返回本次包/版本、源码与产物身份、实际消费环境、通过/失败/复用证据和未覆盖范围；未获发布授权或未执行发布时明确止于本地结果。
