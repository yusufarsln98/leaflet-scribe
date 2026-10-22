import LDefault, * as LNamespace from 'leaflet'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MutableLeaflet = typeof LNamespace & Record<string, any>

/**
 * Resolves the mutable Leaflet namespace object across CJS, ESM, and browser globals.
 */
export function getLeaflet(): MutableLeaflet {
  const globalL =
    typeof globalThis !== 'undefined'
      ? (globalThis as unknown as { L?: MutableLeaflet }).L
      : undefined

  if (globalL && typeof globalL === 'object') {
    return globalL
  }

  if (LDefault && typeof LDefault === 'object') {
    return LDefault as unknown as MutableLeaflet
  }

  return LNamespace as unknown as MutableLeaflet
}

/**
 * Mutable Leaflet instance with all `L.*` constructors, utilities, and Scribe extensions attached.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const L: any = getLeaflet()
