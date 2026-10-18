# 演示内容布局

先根据观众要读什么划分区域，再放入内容。`PresentationLayout` 是通用页面骨架，
标题、图文、对比、数字、流程和总结继续组合现有组件。可运行的六页构图在 Meowbook 的
`presentation-layouts`，不改变现有图片演示或英语课件。

## 区域与比例

从 `meowtail/presentation` 导入 `PresentationLayout`，根入口重导同一实现。
`header`、`footer` 接收普通 Child，保持自然高度；`children` 进入占剩余高度的 body。
省略任一槽不会留下空行或额外间距。骨架不另加边缘，沿用 Presentation 画布的 inset。

| 关系               | `columns`        | 适合的内容                          |
| ------------------ | ---------------- | ----------------------------------- |
| 单一阅读轴         | `single`（默认） | 标题、引用、总结，或内部继续放 Grid |
| 同等重要           | `equal`          | 两个方案、前后对比、两组依据        |
| 主要内容在逻辑起点 | `wide-start`     | 数字或主图占 2 份，旁注占 1 份      |
| 主要内容在逻辑终点 | `wide-end`       | 说明占 1 份，图或实验占 2 份        |

双列构图通常提供两个直接子项。更多区域可在 `single` 中组合 `Grid columns={3}`。
超过两项会按普通网格新增行，仍需核对有限画布的内容量。
`gap` 使用 none/compact/normal/relaxed，默认 normal；主题的 `presentationTokens.spaceGroup`、
`spaceSection`、`spacePanel` 决定组内、区域和较宽间距，与工具栏控件间距独立。

```tsx
import { Stack, LayoutItem } from "meowtail";
import { PresentationLayout } from "meowtail/presentation";

<PresentationLayout
  columns="wide-end"
  header={<h2>同一观点，配一张能解释它的图</h2>}
  footer={<small>来源、条件与必要说明</small>}
>
  <Stack justify="center">
    <p>短主张和适用条件。</p>
  </Stack>
  <Stack style={{ height: "100%" }}>
    <LayoutItem grow basis="0%">
      <img
        src={image}
        alt="说明图片表达的内容"
        aria-describedby="slide-image-caption"
        style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }}
      />
    </LayoutItem>
    <LayoutItem shrink={false}>
      <small id="slide-image-caption">说明图中应观察的关系。</small>
    </LayoutItem>
  </Stack>
</PresentationLayout>;
```

占位阶段就用 AspectRatio 确定容器；替换真实图片后再核对长宽比、contain/cover 和必要的裁切。
骨架不下载素材、不默认裁切，不把图中文字当可访问的正文。
固定高度区域若同时包含媒体和说明，先用 Stack + LayoutItem grow 把余量交给媒体，
说明保持自然高度，再由 img 的 objectFit="contain" 保留图像比例；图片可用 aria-describedby 关联说明。
不要让按列宽计算的 AspectRatio 再加一段说明后侵入 footer。AspectRatio 更适合先确定自然高度的占位区域，
并须与整页剩余高度一起检查。

## 选用构图

| 目的         | 最小组合                                                                   |
| ------------ | -------------------------------------------------------------------------- |
| 标题与主张   | single + Stack justify="center"；主标题、副标题与上下文                    |
| 图文分栏     | wide-start/wide-end + Stack + figure/AspectRatio；根据证据的重要性选主次   |
| 并列对比     | equal；使用同样的标题层级与比较轴，避免两边内容量悬殊                      |
| 重点数字     | wide-start；数字、单位与条件组成一个区域，解释与来源另放，示意数值明确标记 |
| 流程或时间线 | single + Grid/Stack 内的原生 ol/li；保留顺序语义，必要时组合 Reveal        |
| 引用或总结   | single + blockquote/Stack；区分引用、作者结论、来源与下一步                |

阅读字号来自既有 `presentationTokens.fontTitle/fontSubtitle/fontBody/fontCaption`。
确需强调的标题可使用 `PresentationText` editorial 或 marker；正文默认 plain，不需要全页艺术化。
它仍是真实文本，可选择、换行、复制；原生 contenteditable 只是接缝，不构成编辑器。
打印和 forced-colors 保留普通文字。

## 背景与阅读区域

Presentation.background 设整场默认，SlideDefinition.background 可逐页完整覆盖。
两者接收 `SlideBackground` 或其 Signal；页值为 undefined 时继承整场，整场 undefined 沿主题。
显式 `"theme"` 回到主题背景与文字，不继承整场的图像、遮罩或颜色。
对象中的字段不与整场对象合并；fill 省略使用主题纸色。

```tsx
const slides: readonly SlideDefinition[] = [
  {
    id: "opening",
    title: "开场",
    background: {
      fill: "#173d36",
      image: { src: coast, fit: "cover", position: "top right" },
      overlay: "linear-gradient(90deg, rgba(12, 34, 31, .9), rgba(12, 34, 31, .15))",
      foreground: "light",
    },
    render: () => (
      <PresentationLayout>
        <h1>让阅读区域保持清楚</h1>
      </PresentationLayout>
    ),
  },
];
```

fill 和 overlay 使用 CSS 颜色或渐变。image.fit 默认 cover，可选 contain；position 默认 center，
也可选 top/bottom/left/right、top left/top right/bottom left/bottom right。
cover 允许裁切，contain 保持完整比例并露出底色；检查实际图片与文字的位置，不依赖背景细节传达关键事实。
foreground 的 light/dark 指文字颜色，省略使用主题文字；它不会检测图片或自动判断对比度。

背景覆盖 1280×720 整张画布，独立裁切自己的装饰；正文仍使用原有 inset 与溢出诊断。
图片错误后仍保留 fill、overlay 与 foreground，因此要实际检查无图可读性，不把成功下载当作可读的前提。
背景不进入可访问树；有内容含义的图片保留正文、alt 与说明，不挪进装饰层。
背景 Signal 可在同一页更新，不重挂草稿、媒体或内容实例；视频仍使用正文媒体组件，不作为背景输入。
同页背景更新只替换装饰层，不触发切页入场动画。
运行场景 `presentation-backgrounds` 可观察整场渐变、逐页图、contain、主题恢复、深色、失败与动态更新。

## 画布与重排的边界

Presentation 的逻辑画布为 1280×720。窄窗口或短窗口使用 contain 整体缩放，
不会把两栏暗中改成上下排列；本骨架的命名比例属于逻辑画布。
需要手机优先阅读页时另用 Container/Stack/Grid 自然布局，不靠演示缩放承载大量正文。
`RegionLayout` 面向工具区、命名区域与滚动 owner，不作为演示文档 schema。

有限画布容不下任意长文。长标题先领取自然高度，正文区可能因此不足；
默认不裁切、不自动缩小文字、不添加隐藏滚动，保留 Presentation 的溢出诊断。
优先精简、拆页或重新安排区域，再观察目标尺寸；原尺寸模式不能代替可读性验收。
Reveal 隐藏时保留区域几何，逐步呈现不会把相邻内容突然推开。

验证宽屏整页、窄屏、短窗以及真实图片、最长标题和最终步骤。
Meowbook ready 和静态截图不证明互动、媒体或动画合同，这些按作品实际能力另验。

## 教学片段与可撤回支架

先明确学生任务、可观察产出、依据与反馈，再选择上面的构图。任务和原始材料可以同时可见，
提示、参考表达与教师的依据标记分别出现。不要把页数、素材量或动画次数当作学习目标，
也不要求先写完教案再预览；先试一个片段，再调整最影响理解的内容与状态。

以下是一个约八分钟的原创阅读改编，用来说明方法，不是教材原文、真实实验记录或可直接运行的 story。
受众和词汇难度应按实际班级调整。给学生的中性标题为“Read the garden notes”，不先宣布结论。

> On Monday, the plants near the wall looked dry. The team moved two pots into the shade and watered them.
> On Friday, the leaves looked greener. The team did not record how much water each pot received.

任务是说明小组改变了什么、观察到了什么，并指出这份记录还不能回答什么。
每人先标出一句依据，每对同伴形成两句简短表达，再各自改写一句带依据或不确定性的判断。
反馈看是否区分措施与观察、是否能指回原句、是否承认记录的局限；合理措辞可以不同。
“变绿发生在两项措施之后”不能证明其中一项独自有效。

用 single 的一条阅读轴放短材料，或 equal 让材料与学生记录并列；首轮只试一个构图。
保留原句，不把标注后的结果替代原文。必要的关键词、高亮或关系线应指向对应文字且有文字关系说明，
线条只表达“措施—随后观察”的关系，不暗示已经证明因果。参考表达用普通正文，不靠背景图传递证据。

| 可重看的状态 | 学生看到与做什么                                 | 教师反馈与支架                                       |
| ------------ | ------------------------------------------------ | ---------------------------------------------------- |
| 首次阅读     | 原文、问题、空白记录；先独立找依据               | 不显示关键词、结论式标题或参考句                     |
| 请求提示     | 原文不变，增加如 change / observation 的定位词   | 只帮助定位，不直接把原句归类给学生                   |
| 对照解释     | 先听取或查看学生表达，再并置措施与观察原句       | 需要时给完整示例，再撤到关键词或句框；不要求全部展示 |
| 撤回支架     | 保留可查原文和学生草稿，隐藏示例与句框，独立改写 | 学生仍可再次请求提示，不因求助清空草稿               |
| 重看或重做   | 回退重看保留草稿；明确“重新作答”才清空本题记录   | 切到新材料时明确重置本题提示；不默默清空其他任务     |

需要完整示例时，可用“The leaves looked greener after the changes. We need more information to know why.”，
再只留 changes / observation / unknown，或提供“The notes show __. We still need __.”。
顺序和层数由学生需要决定，最终表达不要求逐字复现示例。后续若问“What would you check next?”，
按能否回应记录缺口讨论不同建议，不设唯一选项分数，也不把一个建议冒充已验证的科学结论。

时间可先试独立阅读一分钟、同伴表达两分钟、全班对照两分钟、独立改写两分钟、反馈一分钟；
以实际产出调整。分享时听众也需核对依据或修订一句话，不只让少数表达熟练者反复汇报。
时间预算用于保留学习机会，不驱动自动揭晓答案；材料太满时先删减或拆分。

### 接线与验收边界

`Reveal at={n}` 只在 `step >= n` 时累计显现，后退到阈值之前会隐藏；它保留几何，
隐藏内容退出键盘和可访问树。用它处理必要的先后；稳定复述句框可以直接静态呈现，
不为每句加动画。`transition` 只装饰入场，background 只装饰画布，都不定义教学反馈。

上例中局部提示开关、支架层级与草稿是不同作品状态，可以用普通 signals 和现有原生/库控件组织。
它们不是新的 Presentation props；提高 step 也不会自动撤掉旧的 Reveal。
支架撤回也可以是下一次任务不再提供例句，无需把每个教学选择做成按钮或运行时状态。
若使用作品自定义隐藏，须同时处理视觉、键盘、可访问树和当前焦点，不能只改透明度。
草稿跨页保留于作品会话，页 DOM 与媒体仍按现有生命周期卸载，重进不自动开声。
显示隐藏属于课堂呈现，不是权限或防作弊；参考答案进入观众 bundle 后仍可能被查看。

当前没有专用的选词挖空创作器、逐空反复显隐组件、证据高亮连线编辑器、支架层级组件或评分引擎。
这些只是可按真实创作困难继续验证的需求，不从本例推导新 API 或一次实现所有能力。
普通 signals 能承载状态，也不意味着库已提供这些教学交互的结构、默认视觉或可访问性保证。

预览覆盖表中所有关键状态，尤其未提示时的标题/图注、撤回后是否仍泄题、重新求助、回退与重做；
最长学生草稿、目标投影尺寸与窄短窗口也要实际查看。键盘操作需有可读名称、可见焦点和明确状态，
隐藏答案不应仍被辅助技术读取，反馈不能仅靠颜色或连线。静态全展开截图不能证明这些行为，
没有在真实课堂观察时，也不能把操作检查报告成学习成效。
