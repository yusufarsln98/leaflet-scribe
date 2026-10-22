import type * as LTypes from 'leaflet'
import { L } from '../../shared/index.js'
import { EditSimpleShape } from './edit-simple-shape.js'

L.Edit = L.Edit || {}

/**
 * Rectangle editing handler (`L.Edit.Rectangle`).
 */
export const EditRectangle = EditSimpleShape.extend({
  _createMoveMarker() {
    const bounds = this._shape.getBounds()
    const center = bounds.getCenter()

    this._moveMarker = this._createMarker(center, this.options.moveIcon)
  },

  _createResizeMarker() {
    const corners = this._getCorners()

    this._resizeMarkers = []

    for (let i = 0, l = corners.length; i < l; i++) {
      this._resizeMarkers.push(this._createMarker(corners[i], this.options.resizeIcon))
      this._resizeMarkers[i]._cornerIndex = i
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _onMarkerDragStart(e: any) {
    EditSimpleShape.prototype._onMarkerDragStart.call(this, e)

    const corners = this._getCorners()
    const marker = e.target
    const currentCornerIndex = marker._cornerIndex

    this._oppositeCorner = corners[(currentCornerIndex + 2) % 4]

    this._toggleCornerMarkers(0, currentCornerIndex)
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _onMarkerDragEnd(e: any) {
    const marker = e.target

    if (marker === this._moveMarker) {
      const bounds = this._shape.getBounds()
      const center = bounds.getCenter()

      marker.setLatLng(center)
    }

    this._toggleCornerMarkers(1)

    this._repositionCornerMarkers()

    EditSimpleShape.prototype._onMarkerDragEnd.call(this, e)
  },

  _move(newCenter: LTypes.LatLng) {
    const latlngs = L.GeometryUtil.getDefaultShape(this._shape)
    const bounds = this._shape.getBounds()
    const center = bounds.getCenter()
    const newLatLngs: [number, number][] = []

    for (let i = 0, l = latlngs.length; i < l; i++) {
      const offset: [number, number] = [
        latlngs[i].lat - center.lat,
        latlngs[i].lng - center.lng,
      ]
      newLatLngs.push([newCenter.lat + offset[0], newCenter.lng + offset[1]])
    }

    this._shape.setLatLngs(newLatLngs)

    this._repositionCornerMarkers()

    this._map.fire(L.Draw.Event.EDITMOVE, { layer: this._shape })
  },

  _resize(latlng: LTypes.LatLng) {
    this._shape.setBounds(L.latLngBounds(latlng, this._oppositeCorner))

    const bounds = this._shape.getBounds()
    this._moveMarker.setLatLng(bounds.getCenter())

    this._map.fire(L.Draw.Event.EDITRESIZE, { layer: this._shape })
  },

  _getCorners(): LTypes.LatLng[] {
    const bounds = this._shape.getBounds()
    const nw = bounds.getNorthWest()
    const ne = bounds.getNorthEast()
    const se = bounds.getSouthEast()
    const sw = bounds.getSouthWest()

    return [nw, ne, se, sw]
  },

  _toggleCornerMarkers(opacity: number) {
    for (let i = 0, l = this._resizeMarkers.length; i < l; i++) {
      this._resizeMarkers[i].setOpacity(opacity)
    }
  },

  _repositionCornerMarkers() {
    const corners = this._getCorners()

    for (let i = 0, l = this._resizeMarkers.length; i < l; i++) {
      this._resizeMarkers[i].setLatLng(corners[i])
    }
  },
})

L.Edit.Rectangle = EditRectangle

L.Rectangle.addInitHook(function (this: LTypes.Rectangle) {
  if (L.Edit.Rectangle) {
    this.editing = new L.Edit.Rectangle(this)

    if (this.options.editable) {
      this.editing?.enable()
    }
  }
})
