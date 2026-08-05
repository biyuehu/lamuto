import fs from 'node:fs'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import UnoCSS from '@unocss/svelte-scoped/vite'
import { marked } from 'marked'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      name: 'md-to-html',
      apply: 'build',
      async generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'book.html',
          source: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lamuto Language Guide Book</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; }
    pre { background: #f6f8fa; padding: 1rem; overflow: auto; }
    code { background: #f6f8fa; padding: 0.2em 0.4em; }
  </style>
</head>
<body>
${await marked.parse(fs.readFileSync('book.md', 'utf-8'))}
</body>
</html>`
        })
      }
    },
    UnoCSS({
      // injectReset: '@unocss/reset/normalize.css', // 见类型定义了解所有包含的重置选项或如何传入你自己的
      // ...其他 Svelte 作用域选项
    }),
    svelte()
  ]
})
