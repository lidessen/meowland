# MeowJSX

## Render-tree context

`createContext(defaultValue)` 返回类型化的 Context 和 `Provider` 组件。
`<Context.Provider value={value}>…</Context.Provider>` 不创建宿主节点；后代组件在同步
render 中通过 `useContext(Context)` 读取最近的祖先值，没有 Provider 时得到默认值。
显式提供 `undefined` 仍是一个值，不会退回默认值。兄弟、独立根节点和 runtime 不共享环境。

环境跟随渲染树遍历，而非 VNode 创建时的位置。预先创建的 VNode、数组、宿主包装层和
Signal 后续替换的子树使用当前区域捕获的环境；Promise 与 AsyncIterable 的延迟挂载同样保留它。
同步 HTML 输出采用相同祖先规则，但仍不支持 Promise / AsyncIterable 内容，遇到时抛错。

`useContext` 只在组件同步执行期间读取环境。事件处理和 `await` 后需要使用 render 中预先
捕获的值，不把它当异步局部存储。Provider 不添加整树重渲染或依赖追踪；需要动态共享值时，
可将 Signal 对象作为 value，消费者使用原有 Signal 绑定。更换 Provider 的普通 value 不会
自动重跑已挂载后代。Context 的内部 scope 由 renderer 传递，用户不应修改它。

`RuntimePlugin.resolveComponent({ component, props, runtime })` 可在组件调用前选择替代函数。
按 `pre`、普通、`post` 和各组注册顺序调用；首个非 `undefined` 结果胜出，返回原函数也停止，
结果不再递归解析。选择发生在 lifecycle scope 创建前，所选组件使用自己的 contract、parts
和清理逻辑，原组件不执行。`props` 是只读类型视图，不会复制或冻结对象。

此 hook 属于执行 runtime：预先创建的 VNode、Signal/Promise 后续挂载以及同步 HTML 均适用。
`runtime.use()` 返回的 cleanup 卸载规则，不改写已挂载实例；其他 runtime 不受影响。
它不拦截模块副作用或直接函数调用，也不改变 `create` / `render` hook 的含义。

## 开发 metadata 与实例观察

组件函数可赋值 `metadata?: ComponentMetadata`。`ComponentMetadata` 是开放的类型扩展接口，
开发工具通过 declaration merging 注册自己的命名空间；core 不解释或读取其中的工具字段。
`Component<Props>` 和 `defineComponent` 返回值均保留这个约束，普通函数可用
`satisfies ComponentMetadata` 检查赋值。metadata 不属于 props 或组件运行选项。

`runtime.createRenderer(strategy, { observer })` 可启用目标中立的实例观察：
`onComponent(instance)` 报告创建，`onUnmount(instance)` 报告卸载；可选的
`onNode(instance, node, mounted)` 报告节点关联变化。实例包含本 renderer 内的 `id`、
`parent`、原函数 `originalComponent`、实际执行函数 `component`，以及实时只读的 `nodes` 集合。
集合含该实例及后代的宿主和文本输出，排除内部 marker；Signal、Promise、AsyncIterable 更新后仍保持当前关联。
数组和宿主标签不增加组件层级，直接函数调用不会产生组件实例。

内置 Fragment 和 Context Provider 按实际执行函数身份报告 `semantic` 为 `fragment` 或
`context-provider`，不按名称猜测。替换组件使用所选函数的语义身份和 metadata。
观察不增加宿主包装层；未启用时不创建实例或节点索引。回调同步执行，抛错按挂载或清理失败处理，
工具应在自身边界处理诊断。实例卸载后从工具投影中移除，`id` 不用于跨次运行定位。

可选 `onFlush(changed)` 在微任务中合并实例失效通知，覆盖组件加卸载、节点关联及已挂载
宿主 Signal 属性更新；异常与回滚也通知当前事实可能改变的实例。`changed` 使用真实实例
identity，包含本轮已卸载实例，不是成功提交记录。集合在调用前清空，回调引起的新变化进入
下一轮，不递归投递。它不表示 DOM layout、paint、全部异步工作或应用 ready；没有此回调时
不建立额外 dirty 集合或微任务。此回调抛错走 renderer 的 `onError(error, "async")`，不回滚
已发生的渲染；未提供错误出口则异步抛出。

工具可设置 `observer.roots`，按 child 对象引用限定观察子树；省略时观察整棵渲染树，
空数组时不观察实例。进入每个根后，首层组件的 `parent` 为 `null`，外层容器仍正常渲染、
传递 context 和执行 lifecycle，但不进入观察投影。根可为 VNode、Signal、Promise 或
AsyncIterable，延迟输出继续使用该范围。调用方若把内容数组展开交给容器，应传入其中的
实际 child 引用。此范围不增加组件调用，不影响 runtime hooks 或组件替换。

多消费者使用 `createComponentObservation<TNode>({ roots?, onError? })`，而不是各自复制
实例 Map。它返回 `observer`、`read(root?)`、`subscribe(listener, { root? })` 和 `dispose()`。
将 `observer` 接入 renderer 后，先订阅再读取即可取得当前状态和后续失效通知：

```ts
const observation = createComponentObservation<HostNode>({ onError: reportObserverError });
const renderer = runtime.createRenderer(strategy, { observer: observation.observer });
const unsubscribe = observation.subscribe(() => inspect(observation.read()));
const current = observation.read();
```

`read` 返回当前实例成员数组的副本，实例 `nodes` 仍是 renderer 所有的实时集合；它不是
不可变历史快照。`root` 是真实实例对象，包含其自身及后代；已卸载根读取为空。根内改动与
祖先改动均可使订阅失效，通知允许保守，不承诺精确的布局影响集。订阅没有隐式首次回放；
投递使用订阅名单快照，调用前再次检查有效性，因此本轮取消的订阅不再执行，新加入的
订阅从后续通知开始。一个消费者抛错不阻断其他消费者，错误交给观察中心的 `onError`；
缺少该出口或出口再次抛错时异步报错，不静默吞错。

`dispose` 只停止观察并清理投影，不卸载视图。之后 `read` 为空、`subscribe` 拒绝；已有
renderer 的迟到通知被忽略。通常一个观察中心接一个 renderer；实现按实例 identity 存储，
不会因不同 renderer 的数字 id 相同而覆盖。`roots` 可使用 getter，但范围仍在创建 renderer
时读取并固定，适用于工具在创建前设置真实 child；不是运行时动态切换入口。纯宿主或文本根
没有组件实例，外部 DOM/样式、字体加载和浏览器尺寸变化也不属于该观察合同。

MeowJSX 的 core：JSX/VNode 工厂、Signal/batch/effect、组件与 part 契约、shadow/plugin/theme
契约、lifecycle 与 context，以及目标中立的 renderer seam（`RenderStrategy<TNode>` /
`createRenderer()`）。core 不知道目标平台。

```text
JSX 源码 / 组件逻辑
          │
meowjsx（本包：core + JSX contract）
       └─→ meowjsx/web   同包的 DOM / event / HTML / mount 模块
```

## 导出

- `.`、`./runtime`：`h`、`Fragment`、`raw`、`part`、`signal`/`batch`/`mapSignal`、
  `createRuntime`、`defaultRuntime`、`defineComponent`、`defineShadow`、
  `createThemePlugin`，以及 VNode/Signal/契约类型。
- `./renderer`：`RenderStrategy<TNode>`、`createRenderer()`、`Renderer`/`Rendered`/
  `RendererOptions`、`ComponentObserver`/`ObservedComponent` 等 target seam 类型。`createRenderer()` 注入 component lifecycle、
  render hook、override 和 `key`/`componentPart` 身份，target 只实现节点与属性落地。
- `./jsx-runtime`：`jsx`/`jsxs`/`jsxDEV`/`Fragment`。
- `./jsx-dev-runtime`：development 自动 JSX 所需的 `jsxDEV`/`Fragment`，重用同一实现。
- `./web`：DOM mount、静态 HTML、Web shadow、实例观察来源和骨架视觉控制。
- `./json`：有限描述、host binding/action 引用、单源 metadata 校验与 catalog 描述，见 [JSON 入口](JSON.md)。
- `Runtime.targetHooks`：target 自己拥有输出路径时（Web 的静态 HTML）复用 runtime 的
  组件调用、render hook 与 override 语义，不必在 target 里复制一套。

core 根没有 `render`/`renderToHtml`：`render(node, Element)` 与 HTML 序列化从
`meowjsx/web` 导入。根不回导 Web；两者使用同一份 core 模块，多个显式 Runtime 仍可独立创建。

## 不变量：core 不含平台

core 源码（含类型）不出现 `document`、`window`、DOM `Element`/`HTMLElement`、
浏览器 `Event`、CSS API 或终端 API。`packages/meowjsx/tsconfig.core.json` 在不含
`dom` lib、`types: []` 的配置下检查整个 core：

```sh
bun node_modules/typescript/bin/tsc -p packages/meowjsx/tsconfig.core.json
```

上面命令从仓库根运行，只检查无 DOM 的 core 分组。包内 `bun run typecheck` 依次运行 core、renderer、Web 三个配置，最后的 Web 分组明确包含 DOM；它不等价于仅 core 的无 DOM 检查。`tsconfig.renderer.json` 独立检查目标中立 renderer seam，行为用例使用 fake target。

`ShadowContext.element` 是目标提供的 host handle，core 里类型为泛型 `TNode`
（默认 `unknown`）；Web 模块把它收窄成真实元素。主题契约（`Theme`/`ThemeRule`/
`ThemeStyle` 及其合并规则）按规划留在 core，它只承载值，不接触任何样式 API。

## 验证

- `bun test packages/meowjsx/tests/unit`：Signal、VNode、plugin、契约、fake target seam，以及 Web 宿主测试。
- `tests/types/` 中 core 与 Web 类型用例分别检查；core 类型环境不包含 DOM。

## Web 模块

```ts
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";

const web = createWebRenderer(createRuntime());
const mounted = web.render(h("p", {}, "Hello"), document.querySelector("main")!);
mounted.unmount();
```

Web 源码位于 `web/`，DOM 类型只从该入口到达。静态 `renderToHtml` 不挂载 DOM、不执行 shadow；
`createSkeletonController` 调用时才需要真实文档与 CSS Custom Highlight 支持。
模块导入会创建默认 Web renderer 和观察 Context，不会安装样式或监听器。
`createWebRenderer(runtime)` 尊重该 runtime 已安装的组件、主题和 plugin；显式传入观察来源时，
其生命周期由消费者管理，不建立跨 renderer 的全局观察树。

公共 JS 产物保留模块关系：根、runtime、自动 JSX 与 Web 入口引用同一份 core。
发布构建不能为每个入口复制一份 defaultRuntime、Context 或响应式调度器。

## 有身份的动态列表

`keyed(items, key, render)` 让同 key 的行保持组件、节点、Context 与观察父链；更新只改变该行的只读 item Signal，
删除释放该行生命周期，重新排列移动已有范围。普通数组与 Signal 的整体替换语义不变。

```ts
const items = signal([{ id: "one", label: "First" }]);
const rows = keyed(
  items,
  (item) => item.id,
  (item) =>
    h(
      "p",
      {},
      mapSignal(item, (value) => value.label),
    ),
);
```

`render` 构造 Child，不是额外的生命周期 hook；在组件内读取 Signal 时仍用现有 Signal 属性或 `mapSignal`。
key 必须唯一，且为字符串或有限数字；重复/非法 key、新行挂载失败保留原行与值，后续合法更新仍可继续。
目标的 insert/remove 失败不提供事务回滚。普通前后追加不移动旧行；任意重排时原生焦点是否保留取决于目标移动能力。
静态 HTML 读取一次列表，不订阅或挂载 DOM。
