/**
 * leaflet-scribe/react — subpath entry for React components and utilities.
 *
 * Kept as a separate entry point so React peer dependencies are only ever
 * pulled in by consumers who explicitly import `leaflet-scribe/react`.
 * The core (`leaflet-scribe` / `leaflet-scribe/core`) stays framework-agnostic.
 */

export * from './react/index.js'

