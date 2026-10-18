# 本地 npm 发布

各包独立 SemVer，由维护者或 Agent 显式确定选包、版本与依赖范围。唯一发布算法 `scripts/release.ts` 消费已验收 tarball；不自动改版本、扩展选包、build、pack、提交或推送。稳定版显式使用 `latest`，测试版必须为 `x.y.z-alpha.N` 并显式使用 `alpha`。`*-slides.*` 等其它预发行格式不会被映射为 alpha。`meowslides` 已准备 `0.1.0-alpha.0` 公开候选，实际发布仍须本次明确授权；根与 showcase 不发布。

普通 push/PR 继续只运行 build/lint；真实发布仅由 `.github/workflows/npm-release.yml` 的手动 `workflow_dispatch` 触发，使用 npm Trusted Publishing OIDC，不使用 `NPM_TOKEN` 或个人 npm 登录态。用户已明确授权此方式替代原本地发包安排。脚本不创建 Git tag、GitHub Release 或部署。历史 tag/Release 与[原发布回执](records/2026-10-17-tail-book-press-publish.md)保持原样。当前流程支持 `meowjsx`、`meowcss`、`meowtail`、`meowbook`、`meowslides`、`meowpress` 的显式子集；选包接线不构成发布授权。四包和新增 Slides/Press 可以分别选择，未选中的包不会随批发布。Press 的 `0.1.1-alpha.0` 候选以必需 CSS/JSX peer 表达共享模块的宿主 owner，并保留稳定版与显式 alpha 的兼容范围；普通 CSS dependency 曾在真实混合安装图产生另一份稳定 CSS，故实际 tgz 验收仍须核模块身份、CLI、字体许可和自定义主题，不以放宽范围替代身份验证。

## 准备与固定输入

1. 明确受影响包及各自独立版本，更新源 manifest 与必要依赖/peer 范围。脚本使用 node-semver 正常预发行语义分别校验依赖与 peer；稳定范围通常不接受 alpha，应显式加入相应 alpha 基准范围。不会强制所有包同版或推断联动。
2. 按[开发检查](development-checks.md)完成必要检查，build/pack，并在仓库外空目录安装实际 tgz，验证公开入口、资源、CLI 和受影响行为。pack 不代表 build 已完成；本地 tgz 消费不等于 registry 消费。
3. 提交候选源码，固定候选完整 SHA 与已验收 tgz 的 SHA256。工具提交可为候选后继；候选须是工具 HEAD 的祖先。已跟踪工作区/index 须干净，origin 须与输入仓库一致。未跟踪内容（包括未知 `data/`）不参与检查，不读取或清理。
4. 在被忽略的 `artifacts/releases/<本批名称>/` 保存输入 JSON 与精确 tarball，之后不重打包、不改哈希假装同一批。

存在其它任务 WIP 时，保持其原目录和内容，使用已提交候选的独立干净 checkout 构建与验收，不 stash/reset、复制未验收源码或修改输入 hash 将其混入。新 ESM 修复后的候选必须使用新提交和精确哈希，旧 `857c0fb` 四包输入不得继续发布。具体批次与消费者回执见当次记录。

输入示例（哈希与 SHA 需替换为实际值）：

```json
{
  "repository": "lidessen/meowland",
  "commit": "完整的40位候选Git提交SHA",
  "packages": [
    {
      "name": "meowtail",
      "version": "0.2.0-alpha.0",
      "file": "./meowtail-0.2.0-alpha.0.tgz",
      "sha256": "已验收tarball的64位SHA256",
      "notes": "可选：本批说明，保存在本地输入中"
    }
  ]
}
```

`file` 相对 JSON 所在目录。`--packages` 必须再次显式选择唯一包名；只发布所选集合，不自动带上输入中的其它包。包名/版本必须同时匹配候选提交 manifest 与 tgz，公开 exports/bin 目标须齐全，不含未解析 workspace 依赖，并携带根 MIT LICENSE。内部依赖先于消费者发布，所选集合出现依赖环即失败。不会用工具后继提交中的新 manifest 替代候选 manifest。

## 手动触发与本地演练

本地先按已验收的完整源码 SHA 演练；省略 `--execute` 不联网、不触发 workflow：

```sh
bun run release:dispatch --commit <完整HEAD-SHA> --packages meowjsx,meowcss,meowtail,meowbook --channel alpha
```

获准推送的源码与 workflow 已到远端 `main`、npm trust 已由用户配置后，同一命令加 `--execute` 才请求运行：

```sh
bun run release:dispatch --commit <完整HEAD-SHA> --packages meowjsx,meowcss,meowtail,meowbook --channel alpha --execute
```

这是一条触发命令，成功仅说明已请求运行，不表示 npm 已发布。GitHub CLI 使用既有 GitHub 登录权限；脚本不登录、不扩大权限、不推送。源 SHA 必须等于本地 HEAD 和远端 main；workflow 的 SHA、checkout HEAD 与输入 SHA 也须完全一致。普通 push 不会发包。稳定版沿同一入口使用 `--channel stable` 与已显式准备的稳定版本；工具不把 alpha 自动升级成稳定版。

workflow 的 prepare job 在 GitHub-hosted runner 用固定 Bun 构建和检查源码，显式 pack 选包，生成包含 commit/版本/SHA256 的输入，在仓库外实际安装 tgz 验证公开入口、类型、共享身份和必要 CLI，再上传 manifest/tgz/消费回执。publish job 下载同一 artifact，不重新打包，经同一 release 算法检查后发布。两 job 都固定源码 SHA；只有 publish job 获 `id-token: write`，仓库权限为 `contents: read`。同仓库发布串行排队，不取消进行中的发布。

纯本地检查已打包产物仍可运行：

```sh
bun run release --manifest <release-input.json> --packages meowjsx,meowcss,meowtail,meowbook --channel alpha
# 加 --check 只查公开registry元数据，不证明OIDC trust配置正确
```

`release --execute` 只允许精确的 `lidessen/meowland`、`main`、`npm-release.yml` 手动 workflow 与 GitHub-hosted OIDC 上下文。它不在本机登录、不读取凭据文件，也不回退到 token；npm 在临时空目录用空 user/global config 运行，去除传统 npm 认证变量和 `npm_config_*` 覆盖，保留 Actions OIDC 上下文。官方 registry、禁用 scripts/workspaces 均由命令明确指定。

OIDC 不以 `npm whoami/access` 作权限预检：公开 metadata/依赖/bytes 可以只读核查，trust、direct publish 与 dist-tag 权限只能由其对应操作裁定。认证、网络、非法 JSON 与历史撤包失败均停止；不把任意错误当作未发布，不自动转其它认证方式。

## 用户一次性配置的 npm trust

这是持久发布授权，必须在用户动作时明确确认后由用户或获准操作配置；本仓库落地与 dry-run 不会写 npm 安全设置。四个已存在的包各自在 npm Settings → Trusted publishing 添加 GitHub Actions：

| 字段                 | 精确值                                                                                |
| -------------------- | ------------------------------------------------------------------------------------- |
| Organization or user | `lidessen`                                                                            |
| Repository           | `meowland`                                                                            |
| Workflow filename    | `npm-release.yml`（只填文件名）                                                       |
| Environment          | 留空；本 workflow 未声明 environment                                                  |
| Allowed actions      | 明确允许 `npm publish`；为同 bytes 重试时修复 alpha/latest tag，另允许 `npm dist-tag` |

需配置的包为 `meowjsx`、`meowcss`、`meowtail`、`meowbook`。当前新 trust 默认允许 staging，不能把默认值误当 direct publish 已启用。workflow 固定 Node 24/npm 11.21.0，覆盖 dist-tag OIDC 所需版本；使用 GitHub-hosted runner。首次成功发布须在新 trust 创建后两天内完成，否则需由用户重新配置。保存 trust 不等于服务端已验证匹配，首次实际发布才确立有效性。不需要长期 npm token，也不要求每次运行输入 npm 验证码。

Slides 的本地公开候选与脚本接线不创建 npm 包或 trust。首包名称/占位创建、所需 trust 配置与首次实际发布须在获用户明确授权后执行；不要复用四包授权自动增加第五包。新包引导若涉及公开占位或 staging，必须先说明该动作的公开影响；本地准备可完整完成，不以创建占位作为验收前置。

Press 已有稳定版包，准备新的 `0.1.1-alpha.0` 不需要新包占位；若选它发布，须确认该包的 trusted publisher 是否已配置，并按同一精确仓库/workflow/允许动作补齐所需授权。Press 的发布与持久授权也不由原四包授权自动覆盖。集中确认新增目标和动作即可，不重复逐包请求已经授予的相同授权。

官方另有[新包 staged creation](https://github.blog/changelog/2026-10-02-npm-staged-publishing-now-supports-creating-new-packages/) 路径：使用用户本地登录会话暂存首版，再由维护者以 2FA 审核批准；不要求长期 token 或 token bypass。对不存在的包，暂存会创建公开 `0.0.0-stage` 占位，真实版本须经批准才可安装，详见 [staged publishing](https://docs.npmjs.com/staged-publishing/)。这是有独立公开影响的新包引导流程，不是现有四包的正常 OIDC 自动发布，也没有接入本脚本；首次引导、维护者批准及之后的 trust 绑定应在一次明确授权中说明，不能假定尚不存在的包已经有可用 trust。OIDC 本身兼容禁止传统 token 的发布设置，不要求启用 Bypass 2FA。

不降低账户 2FA，不建议开启 bypass。npm 2026-07-31 公告说明 bypass 的管理权限已限制、直接发包也在弃用；本流程直接采用短期 OIDC。之后如要删除旧 token 或调整 package publishing access，须另获授权，不随配置自动执行。

版本选择仍固定 Node 24/npm 11.21.0，后者覆盖本流程需要的 OIDC dist-tag 支持；不随 npm 的 `latest` 自动升级。用户提供的 [2026-07-08 公告](https://github.blog/changelog/2026-07-08-npm-install-time-security-and-gat-bypass2fa-deprecation/) 说明 npm 12 默认不运行依赖安装脚本，默认不解析 Git 与远程 URL 依赖，并预计约在 2027 年 1 月取消 bypass token 的直接发布。该时间是公告预期，不把长期 bypass token 当作新流程前提。

当前准备 job 使用固定 Bun、frozen lock 和 `--ignore-scripts` 安装；npm 本身的安装与实际 publish 也显式禁用 scripts。发布目标是本地精确 tgz，包间依赖为 registry semver，源码仓库 URL 仅为 repository 元信息，不是 Git 安装依赖。升级 npm 12 时须复验完整锁定的传递依赖和安装/发布命令，不自动加 `--allow-git`、`--allow-remote` 或安装脚本许可；本轮未声称完成 npm 12 实装矩阵。新 trust 的两日首次成功发布期限不构成发布授权：只有候选与授权就绪后才配置/执行，过期则经授权重新配置，不为赶期限擅自发布。

## 执行与恢复

所有选包的本地、workflow 上下文、registry、完整 bytes 和依赖检查完成后，才开始任何变更。每次变更前再核工具 HEAD、已跟踪状态、origin、输入及全部 tgz 哈希，且复核当前 tags 未被其它发布者改变。不要同时启动第二个发布者或修改输入。

- 未存在的精确版本：只运行 `npm publish <绝对tgz路径> --access public --tag alpha|latest --ignore-scripts`，同一 runner 固定 registry/config，由 npm 自动交换 OIDC 短期凭据。
- 精确版本已存在且 SHA512 相同：跳过 publish；所选 tag 未指向该版本时只修复所选 tag。不同 bytes 直接停止，不覆盖、换哈希或自动换版本。
- 所选 tag 已指向更新版本：拒绝倒退。alpha 全程只写 `alpha`；发包和 tag 修复后均核 `latest` 与预检完全一致，包括原本不存在的情况。发现并发变化即失败，不自动反向改 `latest`。
- 每包变更后核 exact integrity 与所选 tag。某条失败即停止，不隐式重试或回滚；保留同一输入与 tgz，排除具体原因后重入。优先重新运行该 Actions run 的失败 publish job，继续下载原 artifact；新 dispatch 若重建得到不同 bytes，会被 exact integrity 检查拒绝，不能改哈希伪装成同批。registry 的实际版本/integrity/tags 是恢复依据，不维护第二份进度 ledger。

publish 响应未知或版本暂不可见时，不因脚本退出非零就盲目重新发送。先确认官方 registry 状态；重入会检查相同 bytes 并跳过已成功版本。全部脚本成功后还需从 registry 安装精确版本做独立消费验收，才能报告真实发布与消费结果；构建、打包、dry-run 或只读检查都不等于已发布。

## 验证与依据

定向测试 `bun test scripts/release.test.ts` 使用真实临时 tarball 与隔离 Git 仓库，mock registry 边界，覆盖渠道、依赖/peer、拓扑、全选预检、部分失败恢复、同 bytes/tag 修复、latest 保护、输入变化和OIDC 上下文及传统认证隔离；dispatch 测试核纯本地预演、远端 SHA 不符零触发、固定 main 参数和手动 workflow 权限。mock 通过不等于真实 trust、Billing 或发包通过。

官方依据：[npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)、[bypass 限制公告](https://github.blog/changelog/2026-07-31-restricting-npm-bypass-2fa-granular-access-tokens/)、[workflow_dispatch](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onworkflow_dispatch)、[npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/)、[dist-tag](https://docs.npmjs.com/cli/v11/commands/npm-dist-tag/)、[npmrc 配置优先级](https://docs.npmjs.com/cli/v11/configuring-npm/npmrc/)、[变量占位符](https://docs.npmjs.com/using-private-packages-in-a-ci-cd-workflow/)、[node-semver](https://github.com/npm/node-semver)。
