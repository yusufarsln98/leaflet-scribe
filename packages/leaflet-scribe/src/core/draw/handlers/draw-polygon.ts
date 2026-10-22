import type * as LTypes from 'leaflet'
import { L } from '../../shared/index.js'
import { DrawPolyline } from './draw-polyline.js'

/**
 * Polygon drawing handler (`L.Draw.Polygon`).
 */
export const DrawPolygon = DrawPolyline.extend({
  statics: {
    TYPE: 'polygon',
  },

  Poly: L.Polygon,

  options: {
    showArea: false,
    showLength: false,
    shapeOptions: {
      stroke: true,
      color: '#3388ff',
      weight: 4,
      opacity: 0.5,
      fill: true,
      fillColor: null,
      fillOpacity: 0.2,
      clickable: true,
    },
    metric: true,
    feet: true,
    nautic: false,
    precision: {},
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialize(map: LTypes.Map, options?: Record<string, any>) {
    DrawPolyline.prototype.initialize.call(this, map, options)
    this.type = DrawPolygon.TYPE
  },

  _updateFinishHandler() {
    const markerCount = this._markers.length

    if (markerCount === 1) {
      this._markers[0].on('click', this._finishShape, this)
    }

    if (markerCount > 2) {
      this._markers[markerCount - 1].on('dblclick', this._finishShape, this)
      if (markerCount > 3) {
        this._markers[markerCount - 2].off('dblclick', this._finishShape, this)
      }
    }
  },

  _getTooltipText() {
    let text: string
    let subtext: string | null | undefined

    if (this._markers.length === 0) {
      text = L.drawLocal.draw.handlers.polygon.tooltip.start
    } else if (this._markers.length < 3) {
      text = L.drawLocal.draw.handlers.polygon.tooltip.cont
      subtext = this._getMeasurementString()
    } else {
      text = L.drawLocal.draw.handlers.polygon.tooltip.end
      subtext = this._getMeasurementString()
    }

    return {
      text,
      subtext,
    }
  },

  _getMeasurementString(): string | null {
    const area = this._area
    let measurementString = ''

    if (!area && !this.options.showLength) {
      return null
    }

    if (this.options.showLength) {
      measurementString = DrawPolyline.prototype._getMeasurementString.call(this)
    }

    if (area) {
      measurementString +=
        '<br>' +
        L.GeometryUtil.readableArea(area, this.options.metric, this.options.precision)
    }

    return measurementString
  },

  _shapeIsValid(): boolean {
    return this._markers.length >= 3
  },

  _vertexChanged(latlng: LTypes.LatLng, added: boolean) {
    if (!this.options.allowIntersection && this.options.showArea) {
      const latLngs = this._poly.getLatLngs()
      this._area = L.GeometryUtil.geodesicArea(latLngs)
    }

    DrawPolyline.prototype._vertexChanged.call(this, latlng, added)
  },

  _cleanUpShape() {
    const markerCount = this._markers.length

    if (markerCount > 0) {
      this._markers[0].off('click', this._finishShape, this)

      if (markerCount > 2) {
        this._markers[markerCount - 1].off('dblclick', this._finishShape, this)
      }
    }
  },
})

L.Draw.Polygon = DrawPolygon

