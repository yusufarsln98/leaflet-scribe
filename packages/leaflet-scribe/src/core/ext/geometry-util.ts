import type * as LTypes from 'leaflet'
import { L } from '../shared/index.js'
import type { PrecisionOptions } from '../types/index.js'

const defaultPrecision: Required<PrecisionOptions> = {
  km: 2,
  ha: 2,
  m: 0,
  mi: 2,
  ac: 2,
  yd: 0,
  ft: 0,
  nm: 2,
}

/**
 * Geodesic area, distance formatting, and shape normalization utilities (`L.GeometryUtil`).
 */
export const GeometryUtil = {
  /**
   * Ported from the OpenLayers implementation.
   * Returns the geodesic area of a polygon ring in square meters.
   */
  geodesicArea(latLngs: LTypes.LatLngLiteral[]): number {
    const pointsCount = latLngs.length
    let area = 0.0
    const d2r = Math.PI / 180

    if (pointsCount > 2) {
      for (let i = 0; i < pointsCount; i++) {
        const p1 = latLngs[i]
        const p2 = latLngs[(i + 1) % pointsCount]
        area +=
          (p2.lng - p1.lng) * d2r * (2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r))
      }
      area = (area * 6378137.0 * 6378137.0) / 2.0
    }

    return Math.abs(area)
  },

  /**
   * Returns `n` in specified number format (if defined in `L.drawLocal.format.numeric`) and precision.
   */
  formattedNumber(n: string | number, precision?: number): string {
    let formatted = parseFloat(String(n)).toFixed(precision)
    const format = L.drawLocal?.format?.numeric
    const delimiters = format?.delimiters
    const thousands = delimiters?.thousands
    let decimal = delimiters?.decimal

    if (thousands || decimal) {
      const splitValue = formatted.split('.')
      formatted = thousands
        ? splitValue[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + thousands)
        : splitValue[0]
      decimal = decimal || '.'
      if (splitValue.length > 1) {
        formatted = formatted + decimal + splitValue[1]
      }
    }

    return formatted
  },

  /**
   * Returns a readable area string in yards or metric.
   * The value will be rounded as defined by the precision option object.
   */
  readableArea(
    area: number,
    isMetric?: boolean | string | string[],
    precision?: PrecisionOptions,
  ): string {
    let areaStr: string
    const mergedPrecision: Required<PrecisionOptions> = L.Util.extend(
      {},
      defaultPrecision,
      precision,
    )

    if (isMetric) {
      let units: string[] = ['ha', 'm']
      const type = typeof isMetric
      if (type === 'string') {
        units = [isMetric as string]
      } else if (type !== 'boolean' && Array.isArray(isMetric)) {
        units = isMetric
      }

      if (area >= 1000000 && units.indexOf('km') !== -1) {
        areaStr =
          L.GeometryUtil.formattedNumber(area * 0.000001, mergedPrecision.km) + ' km²'
      } else if (area >= 10000 && units.indexOf('ha') !== -1) {
        areaStr =
          L.GeometryUtil.formattedNumber(area * 0.0001, mergedPrecision.ha) + ' ha'
      } else {
        areaStr = L.GeometryUtil.formattedNumber(area, mergedPrecision.m) + ' m²'
      }
    } else {
      const sqYards = area / 0.836127 // Square yards in 1 meter

      if (sqYards >= 3097600) {
        // 3097600 square yards in 1 square mile
        areaStr =
          L.GeometryUtil.formattedNumber(sqYards / 3097600, mergedPrecision.mi) + ' mi²'
      } else if (sqYards >= 4840) {
        // 4840 square yards in 1 acre
        areaStr =
          L.GeometryUtil.formattedNumber(sqYards / 4840, mergedPrecision.ac) + ' acres'
      } else {
        areaStr = L.GeometryUtil.formattedNumber(sqYards, mergedPrecision.yd) + ' yd²'
      }
    }

    return areaStr
  },

  /**
   * Converts a metric distance to one of [ feet, nauticalMile, metric or yards ] string.
   * The value will be rounded as defined by the precision option object.
   */
  readableDistance(
    distance: number | string,
    isMetric?: boolean | string,
    isFeet?: boolean,
    isNauticalMile?: boolean,
    precision?: PrecisionOptions,
  ): string {
    let distanceStr: string
    let units: string
    let numDistance = typeof distance === 'number' ? distance : parseFloat(distance)
    const mergedPrecision: Required<PrecisionOptions> = L.Util.extend(
      {},
      defaultPrecision,
      precision,
    )

    if (isMetric) {
      units = typeof isMetric === 'string' ? isMetric : 'metric'
    } else if (isFeet) {
      units = 'feet'
    } else if (isNauticalMile) {
      units = 'nauticalMile'
    } else {
      units = 'yards'
    }

    switch (units) {
      case 'metric':
        // show metres when distance is <= 1km, then show km
        if (numDistance > 1000) {
          distanceStr =
            L.GeometryUtil.formattedNumber(numDistance / 1000, mergedPrecision.km) + ' km'
        } else {
          distanceStr =
            L.GeometryUtil.formattedNumber(numDistance, mergedPrecision.m) + ' m'
        }
        break
      case 'feet':
        numDistance *= 1.09361 * 3
        distanceStr =
          L.GeometryUtil.formattedNumber(numDistance, mergedPrecision.ft) + ' ft'
        break
      case 'nauticalMile':
        numDistance *= 0.53996
        distanceStr =
          L.GeometryUtil.formattedNumber(numDistance / 1000, mergedPrecision.nm) + ' nm'
        break
      case 'yards':
      default:
        numDistance *= 1.09361

        if (numDistance > 1760) {
          distanceStr =
            L.GeometryUtil.formattedNumber(numDistance / 1760, mergedPrecision.mi) +
            ' miles'
        } else {
          distanceStr =
            L.GeometryUtil.formattedNumber(numDistance, mergedPrecision.yd) + ' yd'
        }
        break
    }

    return distanceStr
  },

  /**
   * Returns true if the Leaflet version is 0.7.x, false otherwise.
   */
  isVersion07x(): boolean {
    const version = L.version.split('.')
    return parseInt(version[0], 10) === 0 && parseInt(version[1], 10) === 7
  },

  /**
   * Returns the default shape (first ring) of a Polyline or Polygon.
   * Uses `L.LineUtil.isFlat` to avoid the deprecated `L.Polyline._flat` method.
   */
  getDefaultShape(poly: LTypes.Polyline | LTypes.Polygon | LTypes.Rectangle): LTypes.LatLng[] {
    const latlngs = poly.getLatLngs() as LTypes.LatLng[] | LTypes.LatLng[][]
    if (!L.LineUtil.isFlat) {
      return latlngs as LTypes.LatLng[]
    }
    return L.LineUtil.isFlat(latlngs)
      ? (latlngs as LTypes.LatLng[])
      : (latlngs as LTypes.LatLng[][])[0]
  },
}

L.GeometryUtil = L.extend(L.GeometryUtil || {}, GeometryUtil)

