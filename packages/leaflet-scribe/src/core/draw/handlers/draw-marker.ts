import type * as LTypes from 'leaflet'
import { L } from '../../shared/index.js'
import { DrawFeature } from './draw-feature.js'

/**
 * Marker drawing handler (`L.Draw.Marker`).
 */
export const DrawMarker = DrawFeature.extend({
  statics: {
    TYPE: 'marker',
  },

  options: {
    icon: new L.Icon.Default(),
    repeatMode: false,
    zIndexOffset: 2000,
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialize(map: LTypes.Map, options?: Record<string, any>) {
    this.type = DrawMarker.TYPE

    this._initialLabelText = L.drawLocal.draw.handlers.marker.tooltip.start

    DrawFeature.prototype.initialize.call(this, map, options)
  },

  addHooks() {
    DrawFeature.prototype.addHooks.call(this)

    if (this._map) {
      this._tooltip.updateContent({ text: this._initialLabelText })

      if (!this._mouseMarker) {
        this._mouseMarker = L.marker(this._map.getCenter(), {
          icon: L.divIcon({
            className: 'leaflet-mouse-marker',
            iconAnchor: [20, 20],
            iconSize: [40, 40],
          }),
          opacity: 0,
          zIndexOffset: this.options.zIndexOffset,
        })
      }

      this._mouseMarker.on('click', this._onClick, this).addTo(this._map)

      this._map.on('mousemove', this._onMouseMove, this)
      this._map.on('click', this._onTouch, this)
    }
  },

  removeHooks() {
    DrawFeature.prototype.removeHooks.call(this)

    if (this._map) {
      this._map.off('click', this._onClick, this).off('click', this._onTouch, this)
      if (this._marker) {
        this._marker.off('click', this._onClick, this)
        this._map.removeLayer(this._marker)
        delete this._marker
      }

      this._mouseMarker.off('click', this._onClick, this)
      this._map.removeLayer(this._mouseMarker)
      delete this._mouseMarker

      this._map.off('mousemove', this._onMouseMove, this)
    }
  },

  _onMouseMove(e: LTypes.LeafletMouseEvent) {
    let latlng = e.latlng

    this._tooltip.updatePosition(latlng)
    this._mouseMarker.setLatLng(latlng)

    if (!this._marker) {
      this._marker = this._createMarker(latlng)
      this._marker.on('click', this._onClick, this)
      this._map.on('click', this._onClick, this).addLayer(this._marker)
    } else {
      latlng = this._mouseMarker.getLatLng()
      this._marker.setLatLng(latlng)
    }
  },

  _createMarker(latlng: LTypes.LatLng): LTypes.Layer {
    return new L.Marker(latlng, {
      icon: this.options.icon,
      zIndexOffset: this.options.zIndexOffset,
    })
  },

  _onClick() {
    this._fireCreatedEvent()

    this.disable()
    if (this.options.repeatMode) {
      this.enable()
    }
  },

  _onTouch(e: LTypes.LeafletMouseEvent) {
    this._onMouseMove(e)
    this._onClick()
  },

  _fireCreatedEvent() {
    const marker = new L.Marker.Touch(this._marker.getLatLng(), { icon: this.options.icon })
    DrawFeature.prototype._fireCreatedEvent.call(this, marker)
  },
})

L.Draw.Marker = DrawMarker

