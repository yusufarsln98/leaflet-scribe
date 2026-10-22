import type * as LTypes from 'leaflet'
import { L } from '../shared/index.js'

/**
 * Clones a LatLng or nested array of LatLngs (`L.LatLngUtil`).
 */
export const LatLngUtil = {
  /**
   * Clone the latLng point or points or nested points and return an array with those points.
   */
  cloneLatLngs(latlngs: unknown[]): unknown[] {
    const clone: unknown[] = []
    for (let i = 0, l = latlngs.length; i < l; i++) {
      if (Array.isArray(latlngs[i])) {
        clone.push(LatLngUtil.cloneLatLngs(latlngs[i] as unknown[]))
      } else {
        clone.push(this.cloneLatLng(latlngs[i] as LTypes.LatLngLiteral))
      }
    }
    return clone
  },

  /**
   * Clone the latLng and return a new LatLng object.
   */
  cloneLatLng(latlng: LTypes.LatLngLiteral): LTypes.LatLng {
    return L.latLng(latlng.lat, latlng.lng)
  },
}

L.LatLngUtil = LatLngUtil

