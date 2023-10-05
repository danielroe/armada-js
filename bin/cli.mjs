#!/usr/bin/env node
// @ts-check

import { runMain } from 'citty'
import { loadConfig } from 'c12'
import { defineNitroConfig } from 'nitropack/config'
import rollupPluginVue from 'rollup-plugin-vue'
import { defineLazyEventHandler, fromNodeMiddleware } from 'h3'
import { build as buildVite, createServer } from 'vite'
import vitePluginVue from '@vitejs/plugin-vue'
import autoImport from 'unplugin-auto-import/vite'
import {
  build,
  copyPublicAssets,
  createDevServer,
  createNitro,
  prepare,
  writeTypes,
} from 'nitropack'

const defaultConfig = defineNitroConfig({
  rollupConfig: {
    plugins: [rollupPluginVue()],
  },
  imports: {
    presets: [
      {
        from: 'vue',
        imports: ['ref', 'computed'],
      },
    ],
  },
  bundledStorage: ['templates'],
  devStorage: {
    templates: {
      driver: 'fs',
      base: '.nitro/templates',
    },
  },
  handlers: [
    {
      route: '/**',
      handler: './app/server',
    },
  ],
  publicAssets: [
    {
      baseURL: '/assets',
      dir: '.nitro/client/assets',
      maxAge: 60 * 60 * 24 * 365,
    },
  ],
  devHandlers: [
    {
      route: '/__vite',
      handler: defineLazyEventHandler(async () => {
        const server = await createServer({
          base: '/__vite',
          appType: 'custom',
          server: {
            middlewareMode: true,
          },
          plugins: [
            vitePluginVue(),
            autoImport({
              imports: [
                {
                  from: 'vue',
                  imports: ['ref', 'computed'],
                },
              ],
            }),
          ],
        })
        return fromNodeMiddleware(server.middlewares)
      }),
    },
  ],
})

runMain({
  subCommands: {
    dev: {
      async run() {
        const { config } = await loadConfig({
          configFile: 'armada.config',
          overrides: {
            dev: true,
          },
          defaultConfig,
        })
        const nitro = await createNitro(config)
        /** @type {string} */
        const template = await nitro.storage.getItem('root:index.html')
        await nitro.storage.setItem(
          'templates:index.html',
          template.replace(
            '<script type="module" src="@vite/client"></script>',
            `<script type="module" src="/__vite/@vite/client"></script><script type="module" src="/__vite/app/client"></script>`
          )
        )
        await prepare(nitro)
        const server = createDevServer(nitro)
        server.listen(3000)
        await build(nitro)
      },
    },
    build: {
      async run() {
        const { config } = await loadConfig({
          configFile: 'armada.config',
          overrides: {},
          defaultConfig,
        })
        const nitro = await createNitro(config)
        await prepare(nitro)
        await writeTypes(nitro)
        await buildVite({
          build: {
            outDir: '.nitro/client',
          },
          plugins: [
            vitePluginVue(),
            autoImport({
              imports: [
                {
                  from: 'vue',
                  imports: ['ref', 'computed'],
                },
              ],
            }),
          ],
        })
        /** @type {string} */
        const template = await nitro.storage.getItem('build:client:index.html')
        await nitro.storage.setItem('templates:index.html', template)
        await copyPublicAssets(nitro)
        await build(nitro)
      },
    },
  },
})
