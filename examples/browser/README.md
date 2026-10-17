# 独立浏览器消费示例

先在仓库根执行构建与打包，将本目录复制到仓库之外的干净目录，再用绝对路径安装本轮三个本地包：

```sh
bun add /absolute/path/artifacts/meowjsx-0.1.0.tgz /absolute/path/artifacts/meowcss-0.1.0.tgz /absolute/path/artifacts/meowtail-0.1.0.tgz
bun run build
```

用本地静态 HTTP 服务打开 `index.html`，点击 Increment 应更新计数。示例不使用源码别名、相邻 workspace 链接或 Rossovia 后端。
该页验证公共包的基础组件接合；完整 Assistant、JSON→UI、Book 与 Press 的验收分别记录，不以此页代替。
