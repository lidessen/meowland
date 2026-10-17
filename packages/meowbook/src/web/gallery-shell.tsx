import { h, createRuntime } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { installMeowUI, Button, SearchInput, Select, Disclosure, Toolbar } from "meowtail";
import { Icon } from "meowtail/icons";
import { standardTheme } from "meowtail/theme";
import { applyTheme } from "meowcss/web";

/** Only tool composition lives here; controls, icons and theme are Meowtail. */
export function mountGallery() {
  const runtime = createRuntime();
  installMeowUI(runtime);
  applyTheme(document.documentElement, standardTheme);
  createWebRenderer(runtime).render(
    <div className="workshop-shell">
      <aside className="workshop-sidebar" id="sidebar">
        <a className="workshop-brand" href="/">
          <Icon name="notebook-tabs" size={21} />
          <strong>Meowbook</strong>
          <span>UI</span>
        </a>
        <SearchInput
          className="workshop-search"
          id="search"
          label="查找组件"
          placeholder="查找组件…"
        />
        <div className="catalog-label">
          组件目录 <span id="story-count" />
        </div>
        <nav id="catalog" aria-label="组件样例">
          <p>正在加载样例…</p>
        </nav>
        <div className="workshop-local">
          <label className="workshop-appearance">
            工具外观
            <Select id="gallery-scheme" aria-label="工具外观">
              <option value="auto">跟随系统</option>
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </Select>
          </label>
          <span className="workshop-local-note">
            <span className="status-dot" />
            本地组件环境
          </span>
        </div>
      </aside>
      <button id="catalog-backdrop" aria-label="关闭组件目录" tabindex={-1} hidden />
      <main className="workshop-main">
        <header className="workshop-header">
          <Button
            id="toggle-sidebar"
            variant="quiet"
            aria-label="切换组件目录"
            aria-controls="sidebar"
            aria-expanded="false"
          >
            <Icon name="panel-left" size={17} />
          </Button>
          <span id="group">组件预览</span>
          <span className="breadcrumb-separator">/</span>
          <span id="breadcrumb-component">Meowbook</span>
          <a
            id="standalone"
            href="/canvas.html"
            target="_blank"
            rel="noopener"
            aria-label="独立预览"
            title="独立预览"
          >
            <Icon name="external-link" size={16} />
          </a>
        </header>
        <section className="workshop-intro" aria-label="当前组件场景">
          <h1 id="title" tabindex={-1}>
            Meowbook
          </h1>
          <p id="scenario-description" />
          <nav id="variants" aria-label="组件场景" />
        </section>
        <Toolbar className="workshop-toolbar" label="预览工具">
          <span className="preview-label">
            <Icon name="eye" size={15} />
            预览
          </span>
          <div id="viewport" className="workshop-viewport" role="group" aria-label="预览设备">
            {[
              ["1100", "桌面"],
              ["390", "移动端"],
              ["768", "平板"],
              ["fluid", "自适应"],
            ].map(([value, label]) => (
              <Button variant="quiet" size="small" data-width={value} aria-pressed="false">
                {label}
              </Button>
            ))}
          </div>
          <span id="viewport-size" className="viewport-size">
            1100 px
          </span>
          <Button id="reset" variant="quiet" size="small" title="重置样例">
            <Icon name="refresh-cw" size={14} />
            <span>重置样例</span>
          </Button>
          <Select id="measure-mode" aria-label="标注类别">
            <option value="off">标注关闭</option>
            <option value="controls">控件尺寸</option>
            <option value="text">文字排版</option>
            <option value="spacing">间距布局</option>
            <option value="structure">结构轮廓</option>
          </Select>
          <Button id="text-placeholder" variant="quiet" size="small" aria-pressed="false">
            文字占位
          </Button>
        </Toolbar>
        <div className="workshop-stage">
          <iframe id="canvas" title="组件预览画布" />
        </div>
        <section id="measurement-detail" aria-label="选中元素详情" hidden>
          <p id="measurement-help">点击画布元素查看实际数值；关闭标注恢复普通点击。</p>
          <dl id="measurement-values" />
        </section>
        <Disclosure
          className="workshop-observations"
          id="inspection-panel"
          contentClassName="inspection-body"
          summary={[
            <Icon name="list-checks" size={15} />,
            <strong>检查与说明</strong>,
            <span id="latest-event" role="status" hidden />,
            <span id="inspection" role="status">
              等待画布…
            </span>,
          ]}
        >
          <section className="workshop-description" aria-label="样例说明">
            <p id="description">加载中…</p>
            <div id="covers" />
          </section>
          <div className="workshop-observation-head">
            <strong>交互记录</strong>
            <Button id="inspect" variant="quiet" size="small">
              重新检查
            </Button>
            <Button id="clear-log" variant="quiet" size="small">
              清空记录
            </Button>
          </div>
          <ol id="events" aria-live="polite" />
          <section className="workshop-batch" aria-label="全部样例检查">
            <div className="workshop-observation-head">
              <Button id="inspect-all" variant="outline" size="small" disabled>
                检查全部样例
              </Button>
              <Button id="cancel-inspection" variant="quiet" size="small" hidden>
                取消检查
              </Button>
              <span id="batch-status" role="status">
                按当前宽度检查所有场景。
              </span>
            </div>
            <ul id="batch-results" />
          </section>
          <p className="workshop-limits">检查渲染、横向溢出与控件名称；不替代交互和视觉验收。</p>
        </Disclosure>
      </main>
    </div>,
    document.body,
  );
}
