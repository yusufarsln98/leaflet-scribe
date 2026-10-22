import { describe, expect, it } from 'vitest'
import { L } from '../index.js'

describe('L.LatLngUtil', () => {
  it('clones flat LatLng arrays without mutating the source', () => {
    const latLngs = [{ lat: 0, lng: 0 }]
    const clone = L.LatLngUtil.cloneLatLngs(latLngs) as L.LatLng[]

    expect(clone[0].lat).toBe(latLngs[0].lat)

    clone[0].lat = 10
    expect(latLngs[0].lat).toBe(0)
  })

  it('clones nested LatLng arrays recursively', () => {
    const nested = [
      [
        { lat: 10, lng: 20 },
        { lat: 30, lng: 40 },
      ],
    ]
    const clone = L.LatLngUtil.cloneLatLngs(nested) as L.LatLng[][]

    expect(clone[0][1].lat).toBe(30)
    expect(clone[0][1].lng).toBe(40)

    clone[0][1].lat = 99
    expect(nested[0][1].lat).toBe(30)
  })
})

