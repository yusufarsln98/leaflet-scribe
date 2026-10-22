import type * as LTypes from 'leaflet'
import { L } from '../../shared/index.js'
import { DrawFeature } from './draw-feature.js'
import { DrawMarker } from './draw-marker.js'

/**
 * CircleMarker drawing handler (`L.Draw.CircleMarker`).
 */
export const DrawCircleMarker = DrawMarker.extend({
  statics: {
    TYPE: 'circlemarker',
  },

  options: {
    stroke: true,
    color: '#3388ff',
    weight: 4,
    opacity: 0.5,
    fill: true,
    fillColor: null,
    fillOpacity: 0.2,
    clickable: true,
    zIndexOffset: 2000,
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialize(map: LTypes.Map, options?: Record<string, any>) {
    this.type = DrawCircleMarker.TYPE

    this._initialLabelText = L.drawLocal.draw.handlers.circlemarker.tooltip.start

    DrawFeature.prototype.initialize.call(this, map, options)
  },

  _fireCreatedEvent() {
    const circleMarker = new L.CircleMarker(this._marker.getLatLng(), this.options)
    DrawFeature.prototype._fireCreatedEvent.call(this, circleMarker)
  },

  _createMarker(latlng: LTypes.LatLng): LTypes.CircleMarker {
    return new L.CircleMarker(latlng, this.options)
  },
})

L.Draw.CircleMarker = DrawCircleMarker

