import { afterEach, describe, expect, it } from 'vitest'
import { L } from '../index.js'

describe('L.GeometryUtil', () => {
  afterEach(() => {
    delete L.drawLocal.format
  })

  it('calculates geodesicArea accurately', () => {
    expect(
      L.GeometryUtil.geodesicArea([
        { lat: 0, lng: 0 },
        { lat: 0, lng: 10 },
        { lat: 10, lng: 10 },
        { lat: 10, lng: 0 },
        { lat: 0, lng: 0 },
      ]),
    ).toBe(1232921098571.292)
  })

  it('normalizes flat and nested rings via getDefaultShape', () => {
    const polyline = new L.Polyline([
      [41.0, 29.0],
      [41.1, 29.1],
    ])
    const polygon = new L.Polygon([
      [
        [41.0, 29.0],
        [41.1, 29.0],
        [41.1, 29.1],
      ],
    ])

    const lineShape = L.GeometryUtil.getDefaultShape(polyline)
    const polyShape = L.GeometryUtil.getDefaultShape(polygon)

    expect(Array.isArray(lineShape)).toBe(true)
    expect(lineShape.length).toBe(2)
    expect(lineShape[0].lat).toBe(41.0)

    expect(Array.isArray(polyShape)).toBe(true)
    expect(polyShape.length).toBe(3)
    expect(polyShape[0].lat).toBe(41.0)
  })

  describe('readableDistance', () => {
    describe('metric', () => {
      it('returns meters or kilometers', () => {
        expect(L.GeometryUtil.readableDistance(1000, true)).toBe('1000 m')
        expect(L.GeometryUtil.readableDistance(1500, true)).toBe('1.50 km')
      })

      it("is used when 'metric' is specified", () => {
        expect(L.GeometryUtil.readableDistance(1500, 'metric')).toBe('1.50 km')
      })

      it('is used even when other flags are set', () => {
        expect(L.GeometryUtil.readableDistance(1500, true, true, true)).toBe('1.50 km')
      })

      it('switches from meters to kilometers on more than 1000 meters', () => {
        expect(L.GeometryUtil.readableDistance(999, true)).toBe('999 m')
        expect(L.GeometryUtil.readableDistance(1000, true)).toBe('1000 m')
        expect(L.GeometryUtil.readableDistance(1001, true)).toBe('1.00 km')
        expect(L.GeometryUtil.readableDistance(1002, true)).toBe('1.00 km')
      })

      it('uses the precision specified', () => {
        const precision = {
          km: 0,
          m: 2,
        }

        expect(L.GeometryUtil.readableDistance(1000, true, false, false, precision)).toBe(
          '1000.00 m',
        )
        expect(
          L.GeometryUtil.readableDistance(100.123, true, false, false, precision),
        ).toBe('100.12 m')
        expect(
          L.GeometryUtil.readableDistance(100.456, true, false, false, precision),
        ).toBe('100.46 m')
        expect(L.GeometryUtil.readableDistance(1001, true, false, false, precision)).toBe(
          '1 km',
        )
        expect(L.GeometryUtil.readableDistance(1500, true, false, false, precision)).toBe(
          '2 km',
        )
        expect(L.GeometryUtil.readableDistance(2000, true, false, false, precision)).toBe(
          '2 km',
        )
      })
    })

    describe('imperial', () => {
      it('returns yards or miles', () => {
        expect(L.GeometryUtil.readableDistance(1609.3488537961)).toBe('1760 yd')
        expect(L.GeometryUtil.readableDistance(1610.3488537961)).toBe('1.00 miles')
      })

      it("is used when 'yards' is specified", () => {
        expect(L.GeometryUtil.readableDistance(1610.3488537961, 'yards')).toBe(
          '1.00 miles',
        )
      })

      it('switches from yards to miles on more than 1760 yards', () => {
        expect(L.GeometryUtil.readableDistance(1608.3488537961)).toBe('1759 yd')
        expect(L.GeometryUtil.readableDistance(1609.3488537961)).toBe('1760 yd')
        expect(L.GeometryUtil.readableDistance(1610.3488537961)).toBe('1.00 miles')
        expect(L.GeometryUtil.readableDistance(1611.3488537961)).toBe('1.00 miles')
      })

      it('uses the precision specified', () => {
        const precision = {
          mi: 0,
          yd: 2,
        }

        expect(
          L.GeometryUtil.readableDistance(1609.3488537961, false, false, false, precision),
        ).toBe('1760.00 yd')
        expect(
          L.GeometryUtil.readableDistance(1609.2488537961, false, false, false, precision),
        ).toBe('1759.89 yd')
        expect(
          L.GeometryUtil.readableDistance(1610.3488537961, false, false, false, precision),
        ).toBe('1 miles')
        expect(
          L.GeometryUtil.readableDistance(2415.3488537961, false, false, false, precision),
        ).toBe('2 miles')
        expect(
          L.GeometryUtil.readableDistance(3218.3488537961, false, false, false, precision),
        ).toBe('2 miles')
      })
    })

    describe('imperial feet', () => {
      it('always returns feet', () => {
        expect(L.GeometryUtil.readableDistance(1609.3488537961, false, true, false)).toBe(
          '5280 ft',
        )
        expect(L.GeometryUtil.readableDistance(1610.3488537961, false, true, false)).toBe(
          '5283 ft',
        )
      })

      it("is used when 'feet' is specified", () => {
        expect(L.GeometryUtil.readableDistance(1610.3488537961, 'feet')).toBe('5283 ft')
      })

      it('uses the precision specified', () => {
        const precision = {
          ft: 2,
        }

        expect(
          L.GeometryUtil.readableDistance(1609.3488537961, false, true, false, precision),
        ).toBe('5280.00 ft')
        expect(
          L.GeometryUtil.readableDistance(1609.4488537961, false, true, false, precision),
        ).toBe('5280.33 ft')
      })
    })

    describe('nautical', () => {
      it('always returns nautical miles', () => {
        expect(L.GeometryUtil.readableDistance(1609.3488537961, false, false, true)).toBe(
          '0.87 nm',
        )
        expect(L.GeometryUtil.readableDistance(1610.3488537961, false, false, true)).toBe(
          '0.87 nm',
        )
      })

      it("is used when 'nauticalMile' is specified", () => {
        expect(L.GeometryUtil.readableDistance(1610.3488537961, 'nauticalMile')).toBe(
          '0.87 nm',
        )
      })

      it('uses the precision specified', () => {
        const precision = {
          nm: 3,
        }

        expect(
          L.GeometryUtil.readableDistance(1609.3488537961, false, false, true, precision),
        ).toBe('0.869 nm')
        expect(
          L.GeometryUtil.readableDistance(1610.3488537961, false, false, true, precision),
        ).toBe('0.870 nm')
      })
    })
  })

  describe('formattedNumber', () => {
    it('accepts a thousands separator', () => {
      L.drawLocal.format = {
        numeric: {
          delimiters: {
            thousands: '#',
          },
        },
      }
      expect(L.GeometryUtil.formattedNumber(100)).toBe('100')
      expect(L.GeometryUtil.formattedNumber(1000)).toBe('1#000')
      expect(L.GeometryUtil.formattedNumber(1000000)).toBe('1#000#000')
      expect(L.GeometryUtil.formattedNumber(100, 0)).toBe('100')
      expect(L.GeometryUtil.formattedNumber(1000, 0)).toBe('1#000')
      expect(L.GeometryUtil.formattedNumber(1000000, 0)).toBe('1#000#000')
      expect(L.GeometryUtil.formattedNumber(100, 2)).toBe('100.00')
      expect(L.GeometryUtil.formattedNumber(1000, 2)).toBe('1#000.00')
      expect(L.GeometryUtil.formattedNumber(1000000, 2)).toBe('1#000#000.00')
    })

    it('accepts a decimal separator', () => {
      L.drawLocal.format = {
        numeric: {
          delimiters: {
            decimal: '$',
          },
        },
      }
      expect(L.GeometryUtil.formattedNumber(100)).toBe('100')
      expect(L.GeometryUtil.formattedNumber(1000)).toBe('1000')
      expect(L.GeometryUtil.formattedNumber(1000000)).toBe('1000000')
      expect(L.GeometryUtil.formattedNumber(100, 2)).toBe('100$00')
      expect(L.GeometryUtil.formattedNumber(1000, 2)).toBe('1000$00')
      expect(L.GeometryUtil.formattedNumber(1000000, 2)).toBe('1000000$00')
    })

    it('accepts a thousands and a decimal separator', () => {
      L.drawLocal.format = {
        numeric: {
          delimiters: {
            thousands: '#',
            decimal: '$',
          },
        },
      }
      expect(L.GeometryUtil.formattedNumber(100, 2)).toBe('100$00')
      expect(L.GeometryUtil.formattedNumber(1000, 2)).toBe('1#000$00')
      expect(L.GeometryUtil.formattedNumber(1000000, 2)).toBe('1#000#000$00')
    })

    it('defaults to no thousands and decimal dot', () => {
      delete L.drawLocal.format
      expect(L.GeometryUtil.formattedNumber(100)).toBe('100')
      expect(L.GeometryUtil.formattedNumber(1000)).toBe('1000')
      expect(L.GeometryUtil.formattedNumber(1000000)).toBe('1000000')
      expect(L.GeometryUtil.formattedNumber(100, 2)).toBe('100.00')
      expect(L.GeometryUtil.formattedNumber(1000, 2)).toBe('1000.00')
      expect(L.GeometryUtil.formattedNumber(1000000, 2)).toBe('1000000.00')
    })

    it('is used for readableDistance and readableArea', () => {
      L.drawLocal.format = {
        numeric: {
          delimiters: {
            thousands: '.',
            decimal: ',',
          },
        },
      }
      expect(L.GeometryUtil.readableDistance(1000, true)).toBe('1.000 m')
      expect(L.GeometryUtil.readableArea(50000, true)).toBe('5,00 ha')
    })
  })
})

