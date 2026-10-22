import { beforeEach, describe, expect, it } from 'vitest'
import { L } from '../index.js'

describe('LineUtil and Polyline/Polygon intersection', () => {
  let map: L.Map

  beforeEach(() => {
    map = L.map(document.createElement('div')).setView([0, 0], 15)
  })

  it('detects intersecting and non-intersecting line segments', () => {
    const p0 = L.point(0, 0)
    const p1 = L.point(10, 10)
    const p2 = L.point(0, 10)
    const p3 = L.point(10, 0)

    expect(L.LineUtil.segmentsIntersect(p0, p1, p2, p3)).toBe(true)

    const q0 = L.point(0, 0)
    const q1 = L.point(10, 0)
    const q2 = L.point(0, 10)
    const q3 = L.point(10, 10)

    expect(L.LineUtil.segmentsIntersect(q0, q1, q2, q3)).toBe(false)
  })

  it('detects self-intersection on a Polyline added to a map', () => {
    const nonIntersecting = new L.Polyline([
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 0],
    ]).addTo(map)
    expect(nonIntersecting.intersects()).toBe(false)

    const intersecting = new L.Polyline([
      [0, 0],
      [1, 1],
      [0, 1],
      [1, 0],
    ]).addTo(map)
    expect(intersecting.intersects()).toBe(true)
  })

  it('detects self-intersection on a Polygon added to a map', () => {
    const validPolygon = new L.Polygon([
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 0],
    ]).addTo(map)
    expect(validPolygon.intersects()).toBe(false)

    const bowTiePolygon = new L.Polygon([
      [0, 0],
      [1, 1],
      [0, 1],
      [1, 0],
    ]).addTo(map)
    expect(bowTiePolygon.intersects()).toBe(true)
  })
})

