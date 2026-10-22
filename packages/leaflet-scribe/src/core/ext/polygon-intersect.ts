import type * as LTypes from 'leaflet'
import { L } from '../shared/index.js'

/**
 * Self-intersection detection method mixed into `L.Polygon`.
 */
export const PolygonIntersectMixin = {
  /**
   * Checks a polygon for any intersecting line segments. Ignores holes.
   */
  intersects(this: LTypes.Polygon): boolean {
    const points = this._getProjectedPoints()

    if (this._tooFewPointsForIntersection()) {
      return false
    }

    const polylineIntersects = L.Polyline.prototype.intersects.call(this)

    if (polylineIntersects) {
      return true
    }

    const len = points.length
    const firstPoint = points[0]
    const lastPoint = points[len - 1]
    const maxIndex = len - 2

    // Check the line segment between last and first point. Don't need to check the first line segment (minIndex = 1)
    return this._lineSegmentsIntersectsRange(lastPoint, firstPoint, maxIndex, 1)
  },
}

L.Polygon.include(PolygonIntersectMixin)

