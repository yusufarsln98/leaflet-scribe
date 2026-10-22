import type * as LTypes from 'leaflet'
import { L } from '../../shared/index.js'
import { EditCircleMarker } from './edit-circle-marker.js'

L.Edit = L.Edit || {}

/**
 * Circle editing handler (`L.Edit.Circle`).
 */
export const EditCircle = EditCircleMarker.extend({
  _createResizeMarker() {
    const center = this._shape.getLatLng()
    const resizemarkerPoint = this._getResizeMarkerPoint(center)

    this._resizeMarkers = []
    this._resizeMarkers.push(this._createMarker(resizemarkerPoint, this.options.resizeIcon))
  },

  _getResizeMarkerPoint(latlng: LTypes.LatLng): LTypes.LatLng {
    const delta = this._shape._radius * Math.cos(Math.PI / 4)
    const point = this._map.project(latlng)
    return this._map.unproject([point.x + delta, point.y - delta])
  },

  _resize(latlng: LTypes.LatLng) {
    const moveLatLng = this._moveMarker.getLatLng()
    let radius: number

    if (L.GeometryUtil.isVersion07x()) {
      radius = moveLatLng.distanceTo(latlng)
    } else {
      radius = this._map.distance(moveLatLng, latlng)
    }
    this._shape.setRadius(radius)

    const editTooltip = this._map.editTooltip || this._map._editTooltip
    if (editTooltip) {
      editTooltip.updateContent({
        text:
          L.drawLocal.edit.handlers.edit.tooltip.subtext +
          '<br />' +
          L.drawLocal.edit.handlers.edit.tooltip.text,
        subtext:
          L.drawLocal.draw.handlers.circle.radius +
          ': ' +
          L.GeometryUtil.readableDistance(
            radius,
            true,
            this.options.feet,
            this.options.nautic,
          ),
      })
    }

    this._shape.setRadius(radius)

    this._map.fire(L.Draw.Event.EDITRESIZE, { layer: this._shape })
  },
})

L.Edit.Circle = EditCircle

L.Circle.addInitHook(function (this: LTypes.Circle) {
  if (L.Edit.Circle) {
    this.editing = new L.Edit.Circle(this)

    if (this.options.editable) {
      this.editing?.enable()
    }
  }
})
