import { describe, expect, it } from 'vitest'
import { L } from '../../core/index.js'
import { deepEqual } from '../utils/deep-equal.js'

describe('deepEqual', () => {
  it('compares primitives and nested objects accurately', () => {
    expect(deepEqual(1, 1)).toBe(true)
    expect(deepEqual('a', 'b')).toBe(false)
    expect(
      deepEqual(
        { rectangle: false, polyline: { shapeOptions: { color: '#f00' } } },
        { rectangle: false, polyline: { shapeOptions: { color: '#f00' } } },
      ),
    ).toBe(true)
    expect(
      deepEqual(
        { rectangle: false, polyline: { shapeOptions: { color: '#f00' } } },
        { rectangle: false, polyline: { shapeOptions: { color: '#00f' } } },
      ),
    ).toBe(false)
  })

  it('compares arrays and class instances by reference', () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false)

    const iconA = new L.Icon.Default()
    const iconB = new L.Icon.Default()
    expect(deepEqual({ icon: iconA }, { icon: iconA })).toBe(true)
    expect(deepEqual({ icon: iconA }, { icon: iconB })).toBe(false)
  })
})

