/**
 * leaflet-scribe — core (framework-agnostic)
 *
 * Vector drawing and editing toolkit for Leaflet maps — draw and edit
 * polylines, polygons, rectangles, circles, circle markers, and markers.
 *
 * This module is the entire framework-agnostic public surface. It has zero
 * dependency on React or any UI framework, so it can be used directly from
 * vanilla JavaScript, TypeScript, Vue, Svelte, Angular, or a plain `<script>` tag.
 *
 * React users: see `leaflet-scribe/react` for `<EditControl>`.
 */

import pkg from '../../package.json'
import { L } from './shared/index.js'

export * from './types/index.js'
export * from './shared/index.js'
export * from './localization/index.js'
export * from './events/index.js'
export * from './ext/index.js'
export * from './ui/index.js'
export * from './draw/index.js'
export * from './edit/index.js'

export const VERSION: string = pkg.version

L.drawVersion = VERSION

export default L.Draw

