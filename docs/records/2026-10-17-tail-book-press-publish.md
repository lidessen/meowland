# Tail、Book 与 Press 发布回执

日期：2026-10-17（北京时间）。本批按用户明确授权正常推送并发布 `meowtail@0.1.0`、`meowbook@0.1.1`、`meowpress@0.1.0`。三包均已从官方 registry 实际安装验收，并在验收后完成正式 GitHub Release。

## 精确来源与产物

| 包              | tag 和 Release 绑定的源码候选              | tarball SHA256                                                     |
| --------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| meowtail 0.1.0  | `9ced4b9c4083ae8a9c1b80628330df857bf22256` | `c28809b605355a77eb8a7892edf5ff2f128a3c98849884c644a6a186bc4e3281` |
| meowbook 0.1.1  | `04b9256d7addc1bb11ebd8fb05b9c230e09a678f` | `74186f86e69a88a566c8d66481c04350765fb4585c06fb707a7f7d235c14d186` |
| meowpress 0.1.0 | `16745c148b9e740db6815c6ad0a34fe90cd33d5b` | `8fb23cef85d988da53e3d4a06703e0214ca590c864ec558dacd5fb0a46893b96` |

发布工具运行于已正常推送的 `04b9256d7addc1bb11ebd8fb05b9c230e09a678f`，候选与工具提交按本地发布合同分开核验。Book 本次只改版本、中性 README 安装说明及必要 lock；新包 66 个文件中仅 manifest.version 和 README 有变化，其余 64 个文件与前次已验 Book 包逐字节相同。隔离 build、类型和 pack 通过，688 个依赖链接无逃逸；未重复已成立的 314 项源码测试矩阵。

本地稳定输入与 SHA256：

- `artifacts/releases/meowtail-0.1.0/release-input.json`：`f95eff98a01892fe62c81b88b1bddc37faf6abf4852eb123d123a0bacec9da9c`。
- `artifacts/releases/meowbook-0.1.1/release-input.json`：`4f3539721bfbf9106f785f50765d4a6d54ac9556ed506e45e72e8ed5074e5aa4`。
- `artifacts/releases/initial-0.1.0/release-input.json`：`3cadbdc0ab36c76c69f2e86319bff5d54453637968958a98db334f3bec73c50f`，本次只选择 Press，原输入未改。

JSX/CSS 已发包、原 tag 和资产未动。旧 UI 与 Book 0.1.0 draft/tag 保留；Book 以新的 0.1.1 发布，没有移动旧身份。未知 `data/` 未读取、暂存或发布。

## 实际发布与中断恢复

源码改名 `9ced4b9`、阶段文档 `4969f58`、Book 准备 `04b9256` 正常推送；初次自动审批未认可转述授权而拒绝 push，远端当时没有变更。用户随后直接确认精确提交后，同一正常 push 成功，远端 SHA 读回一致；没有 force 或换路径绕过拒绝。

三包分别经同一 `scripts/release.ts` 算法检查、准备精确 tag/draft/资产，再运行原生 npm 发布；需要本人验证时只打开 npm 官方页面，由本人完成，没有代填 OTP/token。Press 在确认旧 E409 后目标版本仍不存在、且本轮明确获准的前提下，仅重试一次，继续用原候选、输入和 tarball。

三个原生命令都显示接受处理及 `+ name@version`，但紧接的 exact 查询暂时返回 404，导致组合脚本总退出 1。这些退出没有被当成可以重发的依据。随后只读等到官方 exact metadata、SHA512 integrity 和真实归档字节全部匹配，独立消费完成后，沿原输入正式化。

正式化的临时调用保护层仍使用同一发布算法，只准当次已验单包的 `draft=false` 操作，禁止再次 npm publish、tag/push、创建或改写资产；保护层获独立有限源码读审，未成为新的发布实现或仓库内状态账本。三次正式化均 exit 0，未再次发包。

## 独立 registry 消费

各消费者从空目录、官方精确版本和新缓存开始；先实际下载官方归档并与冻结 tar 逐字节核对，再正常 registry 安装。没有本地 file/override、源码 alias、旧 node_modules、旧 lock 或工作区 hoist 补丁。

| 包    | 实际通过范围                                                                                                                                              | 独立回执 SHA256                                                    |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Tail  | 497 个公开文件、fresh 安装 52 包、真实 ESM 同 core、公开类型、代表 Assistant/JSON 动作；两张画面实际查看                                                  | `04a0249fe49f078e8c917149b0e34da6ee3b5cb7e7165c88c089eff909fc717c` |
| Book  | 四包官方归档、563 文件、6 链接无逃逸、fresh 安装 67 包、类型与 Node 同 core、公开 buildStories 与真 CLI list/check/capture；1 请求/1 成功，frame 实际查看 | `8198c708ede62e59b7bd9b905f4fe01f0e683cdeb556345f4f8d117c0dbdd9ac` |
| Press | 94 文件、4 链接、fresh 安装 138 包；非 root cwd 的真 CLI、MDX、5 字体资源及 OFL、页面实际查看                                                             | `2169e25bd84cbf5af141d9b97327c55e71c7197d81ece7c5b126e8ef9ba4e725` |

Tail 首次浏览器夹具选错临时工具路径，Press 首次夹具误期待原规则会移除的正文 H1；只修临时验证器并补相应浏览器步骤，未改源码、tar 或安装包字节，原误判保留在各自回执。没有以最终成功抹掉先前失败。

最终 GitHub 验证器一度把 Release 的 `target_commitish: main` 当成 tag 的实际 commit；纠正后改核真实 tag ref、Release 正文与资产字节。该字段本身不是已有 tag 的指针，未为通过检查更改远端记录。

## 正式 Release 和范围

- [meowtail@0.1.0](https://github.com/lidessen/meowland/releases/tag/meowtail%400.1.0)
- [meowbook@0.1.1](https://github.com/lidessen/meowland/releases/tag/meowbook%400.1.1)
- [meowpress@0.1.0](https://github.com/lidessen/meowland/releases/tag/meowpress%400.1.0)

tag、候选与公开资产按各自输入核对；正式化不抢仓库全局 Latest。Actions 只做 build/lint，未部署产品或静态站点。包发布与代表浏览器验收不等于原生 App、WebKit、真实业务、模型、全平台或 Rossovia 产品切换通过。

此回执以及发布后的 Press README 是后继文档；不重新打包或替换已发 0.1.0 的原 README bytes。发布候选、输入与归档身份保持上表，不能把最后的文档 HEAD 冒充所有包共同源码候选。
