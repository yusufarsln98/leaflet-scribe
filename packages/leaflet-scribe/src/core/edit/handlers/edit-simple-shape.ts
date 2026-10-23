import type * as LTypes from 'leaflet'
import { L } from '../../shared/index.js'

L.Edit = L.Edit || {}

/**
 * Base editing handler for simple shapes (`L.Edit.SimpleShape`).
 */
export const EditSimpleShape = L.Handler.extend({
  options: {
    moveIcon: new L.DivIcon({
      iconSize: new L.Point(8, 8),
      className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-move',
    }),
    resizeIcon: new L.DivIcon({
      iconSize: new L.Point(8, 8),
      className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-resize',
    }),
    touchMoveIcon: new L.DivIcon({
      iconSize: new L.Point(20, 20),
      className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-move leaflet-touch-icon',
    }),
    touchResizeIcon: new L.DivIcon({
      iconSize: new L.Point(20, 20),
      className:
        'leaflet-div-icon leaflet-editing-icon leaflet-edit-resize leaflet-touch-icon',
    }),
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialize(shape: any, options?: Record<string, any>) {
    if (L.Browser.touch) {
      this.options.moveIcon = this.options.touchMoveIcon
      this.options.resizeIcon = this.options.touchResizeIcon
    }

    this._shape = shape
    L.Util.setOptions(this, options)
  },

  addHooks() {
    const shape = this._shape
    if (this._shape._map) {
      this._map = this._shape._map
      shape.setStyle(shape.options.editing)

      if (shape._map) {
        this._map = shape._map
        if (!this._markerGroup) {
          this._initMarkers()
        }
        this._map.addLayer(this._markerGroup)
      }
    }
  },

  removeHooks() {
    const shape = this._shape

    shape.setStyle(shape.options.original)

    const map = shape._map || this._map
    if (map) {
      if (this._moveMarker) {
        this._unbindMarker(this._moveMarker)
      }

      if (this._resizeMarkers) {
        for (let i = 0, l = this._resizeMarkers.length; i < l; i++) {
          this._unbindMarker(this._resizeMarkers[i])
        }
        this._resizeMarkers = null
      }

      if (this._markerGroup) {
        map.removeLayer(this._markerGroup)
        delete this._markerGroup
      }
    }

    this._map = null
  },

  updateMarkers() {
    this._markerGroup.clearLayers()
    this._initMarkers()
  },

  _initMarkers() {
    if (!this._markerGroup) {
      this._markerGroup = new L.LayerGroup()
    }

    this._createMoveMarker()
    this._createResizeMarker()
  },

  _createMoveMarker() {
    // Children override
  },

  _createResizeMarker() {
    // Children override
  },

  _createMarker(latlng: LTypes.LatLng, icon: LTypes.Icon | LTypes.DivIcon) {
    const marker = new L.Marker.Touch(latlng, {
      draggable: true,
      icon,
      zIndexOffset: 10,
    })

    this._bindMarker(marker)

    this._markerGroup.addLayer(marker)

    return marker
  },

  _bindMarker(marker: LTypes.Marker) {
    marker
      .on('dragstart', this._onMarkerDragStart, this)
      .on('drag', this._onMarkerDrag, this)
      .on('dragend', this._onMarkerDragEnd, this)
      .on('touchstart', this._onTouchStart, this)
      .on('touchmove', this._onTouchMove, this)
      .on('MSPointerMove', this._onTouchMove, this)
      .on('touchend', this._onTouchEnd, this)
      .on('MSPointerUp', this._onTouchEnd, this)
  },

  _unbindMarker(marker: LTypes.Marker) {
    marker
      .off('dragstart', this._onMarkerDragStart, this)
      .off('drag', this._onMarkerDrag, this)
      .off('dragend', this._onMarkerDragEnd, this)
      .off('touchstart', this._onTouchStart, this)
      .off('touchmove', this._onTouchMove, this)
      .off('MSPointerMove', this._onTouchMove, this)
      .off('touchend', this._onTouchEnd, this)
      .off('MSPointerUp', this._onTouchEnd, this)
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _onMarkerDragStart(e: any) {
    const marker = e.target
    marker.setOpacity(0)

    this._shape.fire('editstart')
  },

  _fireEdit() {
    this._shape.edited = true
    this._shape.fire('edit')
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _onMarkerDrag(e: any) {
    const marker = e.target
    const latlng = marker.getLatLng()

    if (marker === this._moveMarker) {
      this._move(latlng)
    } else {
      this._resize(latlng)
    }

    this._shape.redraw()
    this._shape.fire('editdrag')
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _onMarkerDragEnd(e: any) {
    const marker = e.target
    marker.setOpacity(1)

    this._fireEdit()
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _onTouchStart(e: any) {
    EditSimpleShape.prototype._onMarkerDragStart.call(this, e)

    if (typeof this._getCorners === 'function') {
      const corners = this._getCorners()
      const marker = e.target
      const currentCornerIndex = marker._cornerIndex

      marker.setOpacity(0)

      this._oppositeCorner = corners[(currentCornerIndex + 2) % 4]
      this._toggleCornerMarkers(0, currentCornerIndex)
    }

    this._shape.fire('editstart')
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _onTouchMove(e: any) {
    const layerPoint = this._map.mouseEventToLayerPoint(e.originalEvent.touches[0])
    const latlng = this._map.layerPointToLatLng(layerPoint)
    const marker = e.target

    if (marker === this._moveMarker) {
      this._move(latlng)
    } else {
      this._resize(latlng)
    }

    this._shape.redraw()

    return false
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _onTouchEnd(e: any) {
    const marker = e.target
    marker.setOpacity(1)
    this.updateMarkers()
    this._fireEdit()
  },

  _move(_latlng?: LTypes.LatLng) {
    // Children override
  },

  _resize(_latlng?: LTypes.LatLng) {
    // Children override
  },
})

L.Edit.SimpleShape = EditSimpleShape

