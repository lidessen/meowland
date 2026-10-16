# JSON 描述入口

`meowjsx/json` 把有限 JSON 描述构造成普通 MeowJSX VNode，使用原 runtime、Context、Signal、组件和 renderer 生命周期；core 根入口不反向导入 JSON 或 DOM。

```ts
import { createJsonView, defineJsonComponent, jsonSchema, parseJsonView } from "meowjsx/json";
import { h, signal, type MaybeSignal } from "meowjsx";

const Label = (props: { text: MaybeSignal<string> }) => h("span", null, props.text);
const catalog = new Map([["Label", defineJsonComponent(Label, {
  text: { kind: "value", schema: jsonSchema.string(), bindable: true, required: true },
})]]);
const text = signal("Hello");
const description = parseJsonView({ component: "Label", props: { text: { $binding: "label" } } }, catalog);
const child = createJsonView(description, { catalog, bindings: new Map([["label", text]]) });
```

节点支持字符串、有限数字、布尔、null、节点数组，以及 `{component, props?, children?}`。component 必须是宿主 catalog 的准确名称；不提供任意 HTML 标签、raw HTML、ref、代码、动态 import、表达式或对象路径。描述中的绑定为独占形状 `{$binding:"准确名称"}`，action 为 `{$action:"准确名称"}`。名称只作 Map 精确查询，不解析点号或路径，也不授予外部权限。

`parseJsonView` 仅校验、复制和冻结数据，不执行组件、action、事件投影、Signal getter 或 runtime hook。`createJsonView` 再按给定 catalog 校验，绑定宿主的只读 Signal 和真实函数，构造 VNode；挂载和解绑仍由原 renderer 管理。action 的参数由 metadata 中的有限 schema 校验；可由宿主在 metadata 提供可信 `mapArgs` 把原生事件投影成明确参数，JSON 不能提供执行代码。callback 的原返回值保留。

`jsonSchema` 支持 string/number/boolean/enum/array/object/optional/data/union，描述与校验共用这些定义。object 字段严格，union 必须命中一个完整分支；`data()` 仅承诺纯 JsonValue，不会凭泛型声称已经校验复杂业务类型。数据内部的 constructor、$binding 或 $action 普通字段仍是数据，不递归解释为控制。某个 prop 的最外层若恰是独占引用标记，则保留给引用；需要这个字面对象时由 host binding 提供，而不是额外引入转义 DSL。

`defineJsonComponent` 将有限 metadata 与原组件 Props 静态关联，排除开放 Props 的任意索引字段；它不自动反射 TS 类型，也不宣称已有全组件 schema。具体组件库必须明确支持集。`describeJsonCatalog` 与 `describeJsonSchema` 从同一 metadata 输出有限描述，不另维护 schema。函数、File、类实例、accessor、循环引用、稀疏数组和非有限数字不是 JSON 数据；宿主仍负责网络、权限、持久化及真正数据来源。

value metadata 可提供按同 schema 校验、复制冻结的字面 `default`，仅在描述缺少该属性时填入；false、0、空串不会被当作缺失。它不执行 action、绑定或回调，也不能改变该属性显式值仍须符合 schema 的要求。
