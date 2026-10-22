/**
 * leaflet-scribe
 *
 * Vector drawing and editing toolkit for Leaflet maps — draw and edit
 * polylines, polygons, rectangles, circles, circle markers, and markers.
 *
 * The root entry is fully framework-agnostic (vanilla JS, Vue, Svelte, …).
 * React users should prefer the React subpath:
 *
 *     import { EditControl } from 'leaflet-scribe/react'
 *
 * which wraps the same core plugin exported here.
 */

export * from './core/index.js'
export { default } from './core/index.js'

