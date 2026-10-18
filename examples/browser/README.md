# Standalone browser consumption example

First build and pack at the repository root, copy this directory to a clean directory outside the repository, then install this round's three local packages by absolute path:

```sh
bun add /absolute/path/artifacts/meowjsx-0.1.0.tgz /absolute/path/artifacts/meowcss-0.1.0.tgz /absolute/path/artifacts/meowtail-0.1.0.tgz
bun run build
```

Open `index.html` with a local static HTTP server; clicking Increment should update the count. The example uses no source aliases, adjacent workspace links or Rossovia backend.
This page verifies basic component assembly of the public packages; acceptance for the complete Assistant, JSON-to-UI, Book and Press is recorded separately and is not replaced by this page.
