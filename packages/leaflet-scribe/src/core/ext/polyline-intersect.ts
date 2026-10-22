import type * as LTypes from 'leaflet'
import { L } from '../shared/index.js'

type PolylineInternal = Omit<LTypes.Polyline, '_map'> & {
  _map?: LTypes.Map | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

/**
 * Self-intersection detection methods mixed into `L.Polyline`.
 */
export const PolylineIntersectMixin = {
  /**
   * Check to see if this polyline has any line segments that intersect.
   * NOTE: does not support detecting intersection for degenerate cases.
   */
  intersects(this: PolylineInternal): boolean {
    const points = this._getProjectedPoints()
    const len = points ? points.length : 0

    if (this._tooFewPointsForIntersection()) {
      return false
    }

    for (let i = len - 1; i >= 3; i--) {
      const p = points[i - 1]
      const p1 = points[i]

      if (this._lineSegmentsIntersectsRange(p, p1, i - 2)) {
        return true
      }
    }

    return false
  },

  /**
   * Check for intersection if new latlng was added to this polyline.
   * NOTE: does not support detecting intersection for degenerate cases.
   */
  newLatLngIntersects(
    this: PolylineInternal,
    latlng: LTypes.LatLng,
    skipFirst?: boolean,
  ): boolean {
    if (!this._map) {
      return false
    }

    return this.newPointIntersects(this._map.latLngToLayerPoint(latlng), skipFirst)
  },

  /**
   * Check for intersection if new point was added to this polyline.
   * `newPoint` must be a layer point.
   */
  newPointIntersects(
    this: PolylineInternal,
    newPoint: LTypes.Point,
    skipFirst?: boolean,
  ): boolean {
    const points = this._getProjectedPoints()
    const len = points ? points.length : 0
    const lastPoint = points ? points[len - 1] : null
    // The previous previous line segment. Previous line segment doesn't need testing.
    const maxIndex = len - 2

    if (this._tooFewPointsForIntersection(1) || !lastPoint) {
      return false
    }

    return this._lineSegmentsIntersectsRange(
      lastPoint,
      newPoint,
      maxIndex,
      skipFirst ? 1 : 0,
    )
  },

  /**
   * Polylines with 2 sides can only intersect in cases where points are collinear.
   * Cannot have intersection when < 3 line segments (< 4 points).
   */
  _tooFewPointsForIntersection(this: PolylineInternal, extraPoints?: number): boolean {
    const points = this._getProjectedPoints()
    let len = points ? points.length : 0
    len += extraPoints || 0

    return !points || len <= 3
  },

  /**
   * Checks a line segment intersections with any line segments before its predecessor.
   */
  _lineSegmentsIntersectsRange(
    this: PolylineInternal,
    p: LTypes.Point,
    p1: LTypes.Point,
    maxIndex: number,
    minIndex?: number,
  ): boolean {
    const points = this._getProjectedPoints()
    const min = minIndex || 0

    for (let j = maxIndex; j > min; j--) {
      const p2 = points[j - 1]
      const p3 = points[j]

      if (L.LineUtil.segmentsIntersect(p, p1, p2, p3)) {
        return true
      }
    }

    return false
  },

  _getProjectedPoints(this: PolylineInternal): LTypes.Point[] {
    const points: LTypes.Point[] = []
    const shape = L.GeometryUtil.getDefaultShape(this)

    if (!this._map || !shape) {
      return points
    }

    for (let i = 0; i < shape.length; i++) {
      points.push(this._map.latLngToLayerPoint(shape[i]))
    }
    return points
  },
}

L.Polyline.include(PolylineIntersectMixin)
