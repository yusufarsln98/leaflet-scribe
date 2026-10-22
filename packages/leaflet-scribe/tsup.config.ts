import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Options } from 'tsup'

/**
 * Copies stylesheet and spritesheet assets into `dist/`, and creates the
 * legacy `dist/leaflet.draw.js` alias so both modern and legacy import paths work.
 */
async function copyStaticAssets(): Promise<void> {
  const distDir = resolve(import.meta.dirname, 'dist')
  const stylesDir = resolve(import.meta.dirname, 'src/styles')
  mkdirSync(resolve(distDir, 'images'), { recursive: true })

  const cssFile = resolve(stylesDir, 'leaflet.draw.css')
  if (existsSync(cssFile)) {
    cpSync(cssFile, resolve(distDir, 'styles.css'))
    cpSync(cssFile, resolve(distDir, 'leaflet.draw.css'))
    cpSync(cssFile, resolve(distDir, 'leaflet.draw-src.css'))
  }

  const imagesDir = resolve(stylesDir, 'images')
  if (existsSync(imagesDir)) {
    cpSync(imagesDir, resolve(distDir, 'images'), { recursive: true })
  }

  const cjsEntry = resolve(distDir, 'index.cjs')
  if (existsSync(cjsEntry)) {
    cpSync(cjsEntry, resolve(distDir, 'leaflet.draw.js'))
  }
}

/**
 * Core entry ("." and "./core").
 * Fully framework-agnostic — no React import, so no "use client" banner.
 */
const core: Options = {
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  // First of the two sequential builds — wipes dist exactly once.
  clean: true,
  minify: true,
  external: ['leaflet'],
  onSuccess: copyStaticAssets,
}

/**
 * React entry ("./react").
 * Bundles the React `<EditControl>` component and utilities together with the
 * core plugin; React peer dependencies stay external and the "use client" banner
 * ships only here. `clean: false` keeps the core output from the build above.
 */
const react: Options = {
  entry: ['src/react.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: false,
  minify: true,
  // No `treeshake`: its Rollup pass runs after esbuild inserts the banner and
  // would strip the "use client" directive from the final output again.
  external: ['react', 'react-dom', 'leaflet', 'react-leaflet', '@react-leaflet/core'],
  banner: {
    js: '"use client";',
  },
}

export default defineConfig([core, react])

