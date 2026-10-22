import type * as LTypes from 'leaflet'
import { L } from '../../shared/index.js'
import { EditSimpleShape } from './edit-simple-shape.js'

L.Edit = L.Edit || {}

/**
 * CircleMarker editing handler (`L.Edit.CircleMarker`).
 */
export const EditCircleMarker = EditSimpleShape.extend({
  _createMoveMarker() {
    const center = this._shape.getLatLng()

    this._moveMarker = this._createMarker(center, this.options.moveIcon)
  },

  _createResizeMarker() {
    this._resizeMarkers = []
  },

  _move(latlng: LTypes.LatLng) {
    if (this._resizeMarkers.length) {
      const resizemarkerPoint = this._getResizeMarkerPoint(latlng)
      this._resizeMarkers[0].setLatLng(resizemarkerPoint)
    }

    this._shape.setLatLng(latlng)

    this._map.fire(L.Draw.Event.EDITMOVE, { layer: this._shape })
  },
})

L.Edit.CircleMarker = EditCircleMarker

L.CircleMarker.addInitHook(function (this: LTypes.CircleMarker) {
  if (L.Edit.CircleMarker) {
    this.editing = new L.Edit.CircleMarker(this)

    if (this.options.editable) {
      this.editing?.enable()
    }
  }

  this.on('add', function (this: LTypes.CircleMarker) {
    if (this.editing && this.editing.enabled()) {
      this.editing.addHooks?.()
    }
  })

  this.on('remove', function (this: LTypes.CircleMarker) {
    if (this.editing && this.editing.enabled()) {
      this.editing.removeHooks?.()
    }
  })
})
