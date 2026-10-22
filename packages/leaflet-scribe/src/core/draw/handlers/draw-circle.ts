import type * as LTypes from 'leaflet'
import { L } from '../../shared/index.js'
import { DrawSimpleShape } from './draw-simple-shape.js'

/**
 * Circle drawing handler (`L.Draw.Circle`).
 */
export const DrawCircle = DrawSimpleShape.extend({
  statics: {
    TYPE: 'circle',
  },

  options: {
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
    showRadius: true,
    metric: true,
    feet: true,
    nautic: false,
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialize(map: LTypes.Map, options?: Record<string, any>) {
    this.type = DrawCircle.TYPE

    this._initialLabelText = L.drawLocal.draw.handlers.circle.tooltip.start

    DrawSimpleShape.prototype.initialize.call(this, map, options)
  },

  _drawShape(latlng: LTypes.LatLng) {
    let distance: number
    if (L.GeometryUtil.isVersion07x()) {
      distance = this._startLatLng.distanceTo(latlng)
    } else {
      distance = this._map.distance(this._startLatLng, latlng)
    }

    if (!this._shape) {
      this._shape = new L.Circle(this._startLatLng, distance, this.options.shapeOptions)
      this._map.addLayer(this._shape)
    } else {
      this._shape.setRadius(distance)
    }
  },

  _fireCreatedEvent() {
    const circle = new L.Circle(
      this._startLatLng,
      this._shape.getRadius(),
      this.options.shapeOptions,
    )
    DrawSimpleShape.prototype._fireCreatedEvent.call(this, circle)
  },

  _onMouseMove(e: LTypes.LeafletMouseEvent) {
    const latlng = e.latlng
    const showRadius = this.options.showRadius
    const useMetric = this.options.metric

    this._tooltip.updatePosition(latlng)
    if (this._isDrawing) {
      this._drawShape(latlng)

      const radius = this._shape.getRadius().toFixed(1)

      let subtext = ''
      if (showRadius) {
        subtext =
          L.drawLocal.draw.handlers.circle.radius +
          ': ' +
          L.GeometryUtil.readableDistance(
            radius,
            useMetric,
            this.options.feet,
            this.options.nautic,
          )
      }
      this._tooltip.updateContent({
        text: this._endLabelText,
        subtext,
      })
    }
  },
})

L.Draw.Circle = DrawCircle

