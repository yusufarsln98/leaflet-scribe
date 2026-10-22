import type * as LTypes from 'leaflet'
import { L } from '../shared/index.js'

/**
 * Line segment intersection helpers attached to `L.LineUtil`.
 */
export const LineUtilIntersect = {
  /**
   * Checks to see if two line segments intersect. Does not handle degenerate cases.
   * http://compgeom.cs.uiuc.edu/~jeffe/teaching/373/notes/x06-sweepline.pdf
   */
  segmentsIntersect(
    p: LTypes.Point,
    p1: LTypes.Point,
    p2: LTypes.Point,
    p3: LTypes.Point,
  ): boolean {
    return (
      this._checkCounterclockwise(p, p2, p3) !== this._checkCounterclockwise(p1, p2, p3) &&
      this._checkCounterclockwise(p, p1, p2) !== this._checkCounterclockwise(p, p1, p3)
    )
  },

  /**
   * Check to see if points are in counterclockwise order.
   */
  _checkCounterclockwise(p: LTypes.Point, p1: LTypes.Point, p2: LTypes.Point): boolean {
    return (p2.y - p.y) * (p1.x - p.x) > (p1.y - p.y) * (p2.x - p.x)
  },
}

L.Util.extend(L.LineUtil, LineUtilIntersect)

