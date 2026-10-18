# 8B Unit 6 · Sunshine for all · Welcome to the unit

九页浏览器课件，当前作品标识 `sunshine-welcome-a3`。面向译林八下英语Welcome导入课，只做六个关键词与帮助话题，不扩Reading、Comic strip或整个Unit。叙事与全部练习为教师改编，教材版本/公开资料核查边界见 [SOURCES.md](SOURCES.md)。

学生目标：能理解并使用六个词，提出尊重对方意愿的帮助建议，并用简单理由解释选择。课件保持英语任务句，教师可按学生基础口头补充中文。它是课堂讨论与展示工具，不是每人账号、自动评分或作答持久化平台。

## 运行与继续编辑

在同版本Meowland仓库、已有Bun 1.4.2与依赖/包构建的环境，从根目录运行：

```sh
bun examples/sunshine-welcome/build.ts
bun examples/sunshine-welcome/serve.ts
```

打开 `http://127.0.0.1:13012/`。本轮新API尚未正式发布，不能从旧稳定npm包安装后声称等价；缺依赖或包构建先沿根README处理。停止本次服务用Ctrl-C。可以设 `PORT=13022` 更换端口。源改动后重建并刷新，没有HMR，不执行全仓库清理或额外发布。

安全回归共享组件时可设 `SUNSHINE_OUTDIR` 构建到专用 `artifacts/` 子目录，再用 `SUNSHINE_DIST` 让独立测试服务读取该候选；默认入口和作品内容不变，不必覆盖用户正在看的 `13012` 产物。

入口 `index.html` → `main.tsx` → `lesson.tsx`，词汇事实在 `vocabulary.ts`，作品样式在 `lesson.styles.ts`。作品表单只用`.lesson-field`等内容class，不覆盖演示chrome的目录、控件或容器结构。逻辑画布1280×720，固定米白/深蓝/阳光黄；系统暗色偏好不改变所选作品颜色。

## 课堂节奏与教师推进

约40分钟，可按课堂讨论压缩，不是自动计时。普通播放器Next先推进本页步骤，再翻页；Previous回退不擦除学生输入。没有全舞台任意点击翻页，也没有计时自动揭晓。

| 稳定页id       | 建议时间 | 目的与推进                                                                           |
| -------------- | -------- | ------------------------------------------------------------------------------------ |
| `welcome`      | 2分钟    | 课名与情境；第1步出现目标                                                            |
| `notice`       | 3分钟    | 先观察再提问；第1步思考线索，第2步先问/倾听                                          |
| `words-people` | 4分钟    | blind/deaf/disabled；第1步定义，第2步自然人物表达                                    |
| `words-life`   | 4分钟    | elderly/homeless/poor；同样分步，不凭外貌或词给人下结论                              |
| `match`        | 5分钟    | 六个文字线索配对；第1步提示，第2步本作品参考匹配；无输入提示口头比较，已填项单独核对 |
| `read-talk`    | 6分钟    | 读原创Part B主题改编对话，多选理解；第1步提示，第2步参考表达                         |
| `choose`       | 5分钟    | 选择与理由；0思考，1提示，2参考B与解释，3可能理由                                    |
| `pair-talk`    | 8分钟    | 两人选择情境、写建议与理由，口头问/建议/解释/回应；第1步给一个示例                   |
| `take-action`  | 3分钟    | 一个词+一个可提出的行动；第1步自查目标，并可回访先前选择                             |

开放题的参考不是唯一答案。学生可以用真实或想象情境，不要求透露本人或家庭处境，也不按帮助经历多少评判学生。

## 输入、回访与显式重做

每场作品由`createSunshineLesson`一次创建普通signals。词义配对、多选、情境选择、理由、口语草稿和出口题跨页保留；回访只改变叙事位置。两场实例不串值，刷新开启新会话，不暗示保存到云端。

- `Redo matching`只清配对并回该题第0步。
- `Redo this task`只清选择与理由，并回`choose`第0步收起提示/答案。
- `Redo exit ticket`只清出口题并收起其自查。
- `Revisit the idea`、`Revisit the words`、`Revisit my choice`只导航，不清输入。

学生按钮可键盘选择，配对/文本输入使用原生控件。选择不会自动揭晓或翻页；教师通过步骤决定反馈。学生输入与教师参考分别持有，回退不撤销作答。直达夹具例如 `http://127.0.0.1:13012/?slide=choose&step=0` 与 `?slide=choose&step=3`。

## Meowbook预览

同源作品在各入口分别创建会话。仓库根运行：

```sh
bun packages/meowbook/src/cli.ts check --config examples/sunshine-welcome/meowbook.config.ts
bun packages/meowbook/src/cli.ts serve --config examples/sunshine-welcome/meowbook.config.ts --port 13013 --capture
```

审阅夹具`sunshine-welcome-cover/question/feedback/words`从首次挂载传`active=false`。`sunshine-welcome-interactive`也默认false，前台画布明确点击Activate后才开放许可；宿主许可不能只由document.visibility推断。当前作品没有音视频或持续动画，不为能力覆盖硬塞媒体。ready等待真实图片解码与本地字体。

## 交付与验证

构建输出在忽略目录`dist/`，包含运行所需JS/全部SVG、来源声明、构建清单，以及`source/`可编辑课件源与根manifest/bun.lock参考。源码快照须放回同版本Meowland checkout继续编辑；这份快照不冒充独立npm稳定包工程。产物可由普通静态HTTP提供，无外部运行资源；不默认支持双击file://。

已从三页粗稿逐步接成九页，保留开场蓝黄方向；局部修过选择按钮ARIA字符串与内容表单选择器范围。实际图、交互与冷启动测试分别记录，不把截图成功当课堂接受或完整行为验收。独立测试位于`tests/`，由独立owner维护，最终执行结果沿父任务回执。
