import type * as LTypes from 'leaflet'
import { L } from '../../shared/index.js'

L.Edit = L.Edit || {}

/**
 * Polyline and Polygon editing handler (`L.Edit.Poly`).
 */
export const EditPoly = L.Handler.extend({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialize(poly: any) {
    this.latlngs = [poly._latlngs]
    if (poly._holes) {
      this.latlngs = this.latlngs.concat(poly._holes)
    }

    this._poly = poly

    this._poly.on('revert-edited', this._updateLatLngs, this)
  },

  _defaultShape() {
    if (!L.LineUtil.isFlat) {
      return this._poly._latlngs
    }
    return L.LineUtil.isFlat(this._poly._latlngs)
      ? this._poly._latlngs
      : this._poly._latlngs[0]
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _eachVertexHandler(callback: (handler: any) => void) {
    for (let i = 0; i < this._verticesHandlers.length; i++) {
      callback(this._verticesHandlers[i])
    }
  },

  addHooks() {
    this._initHandlers()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this._eachVertexHandler((handler: any) => {
      handler.addHooks()
    })
  },

  removeHooks() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this._eachVertexHandler((handler: any) => {
      handler.removeHooks()
    })
  },

  updateMarkers() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this._eachVertexHandler((handler: any) => {
      handler.updateMarkers()
    })
  },

  _initHandlers() {
    this._verticesHandlers = []
    for (let i = 0; i < this.latlngs.length; i++) {
      this._verticesHandlers.push(
        new L.Edit.PolyVerticesEdit(
          this._poly,
          this.latlngs[i],
          this._poly.options.poly,
        ),
      )
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _updateLatLngs(e: any) {
    this.latlngs = [e.layer._latlngs]
    if (e.layer._holes) {
      this.latlngs = this.latlngs.concat(e.layer._holes)
    }
  },
})

L.Edit.Poly = EditPoly

/**
 * Vertex editing handler for Polyline/Polygon rings (`L.Edit.PolyVerticesEdit`).
 */
export const EditPolyVerticesEdit = L.Handler.extend({
  options: {
    icon: new L.DivIcon({
      iconSize: new L.Point(8, 8),
      className: 'leaflet-div-icon leaflet-editing-icon',
    }),
    touchIcon: new L.DivIcon({
      iconSize: new L.Point(20, 20),
      className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon',
    }),
    drawError: {
      color: '#b00b00',
      timeout: 1000,
    },
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialize(poly: any, latlngs: any, options?: Record<string, any>) {
    if (L.Browser.touch) {
      this.options.icon = this.options.touchIcon
    }
    this._poly = poly

    if (options && options.drawError) {
      options.drawError = L.Util.extend({}, this.options.drawError, options.drawError)
    }

    this._latlngs = latlngs

    L.setOptions(this, options)
  },

  _defaultShape() {
    if (!L.LineUtil.isFlat) {
      return this._latlngs
    }
    return L.LineUtil.isFlat(this._latlngs) ? this._latlngs : this._latlngs[0]
  },

  addHooks() {
    const poly = this._poly
    const path = poly._path

    if (!(poly instanceof L.Polygon)) {
      poly.options.fill = false
      if (poly.options.editing) {
        poly.options.editing.fill = false
      }
    }

    if (path) {
      if (poly.options.editing && poly.options.editing.className) {
        if (poly.options.original.className) {
          poly.options.original.className.split(' ').forEach((className: string) => {
            L.DomUtil.removeClass(path, className)
          })
        }
        poly.options.editing.className.split(' ').forEach((className: string) => {
          L.DomUtil.addClass(path, className)
        })
      }
    }

    poly.setStyle(poly.options.editing)

    if (this._poly._map) {
      this._map = this._poly._map

      if (!this._markerGroup) {
        this._initMarkers()
      }
      this._poly._map.addLayer(this._markerGroup)
    }
  },

  removeHooks() {
    const poly = this._poly
    const path = poly._path

    if (path) {
      if (poly.options.editing && poly.options.editing.className) {
        poly.options.editing.className.split(' ').forEach((className: string) => {
          L.DomUtil.removeClass(path, className)
        })
        if (poly.options.original.className) {
          poly.options.original.className.split(' ').forEach((className: string) => {
            L.DomUtil.addClass(path, className)
          })
        }
      }
    }

    poly.setStyle(poly.options.original)

    if (poly._map) {
      poly._map.removeLayer(this._markerGroup)
      delete this._markerGroup
      delete this._markers
    }
  },

  updateMarkers() {
    this._markerGroup.clearLayers()
    this._initMarkers()
  },

  _initMarkers() {
    if (!this._markerGroup) {
      this._markerGroup = new L.LayerGroup()
    }
    this._markers = []

    const latlngs = this._defaultShape()
    const len = latlngs.length

    for (let i = 0; i < len; i++) {
      const marker = this._createMarker(latlngs[i], i)
      marker.on('click', this._onMarkerClick, this)
      marker.on('contextmenu', this._onContextMenu, this)
      this._markers.push(marker)
    }

    for (let i = 0, j = len - 1; i < len; j = i++) {
      if (i === 0 && !(L.Polygon && this._poly instanceof L.Polygon)) {
        continue
      }

      const markerLeft = this._markers[j]
      const markerRight = this._markers[i]

      this._createMiddleMarker(markerLeft, markerRight)
      this._updatePrevNext(markerLeft, markerRight)
    }
  },

  _createMarker(latlng: LTypes.LatLng, index?: number) {
    const marker = new L.Marker.Touch(latlng, {
      draggable: true,
      icon: this.options.icon,
    })

    marker._origLatLng = latlng
    marker._index = index

    marker
      .on('dragstart', this._onMarkerDragStart, this)
      .on('drag', this._onMarkerDrag, this)
      .on('dragend', this._fireEdit, this)
      .on('touchmove', this._onTouchMove, this)
      .on('touchend', this._fireEdit, this)
      .on('MSPointerMove', this._onTouchMove, this)
      .on('MSPointerUp', this._fireEdit, this)

    this._markerGroup.addLayer(marker)

    return marker
  },

  _onMarkerDragStart() {
    this._poly.fire('editstart')
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _spliceLatLngs(...args: any[]) {
    const latlngs = this._defaultShape()
    const removed = [].splice.apply(latlngs, args as unknown as [number, number, ...never[]])
    this._poly._convertLatLngs(latlngs, true)
    this._poly.redraw()
    return removed
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _removeMarker(marker: any) {
    const i = marker._index

    this._markerGroup.removeLayer(marker)
    this._markers.splice(i, 1)
    this._spliceLatLngs(i, 1)
    this._updateIndexes(i, -1)

    marker
      .off('dragstart', this._onMarkerDragStart, this)
      .off('drag', this._onMarkerDrag, this)
      .off('dragend', this._fireEdit, this)
      .off('touchmove', this._onMarkerDrag, this)
      .off('touchend', this._fireEdit, this)
      .off('click', this._onMarkerClick, this)
      .off('MSPointerMove', this._onTouchMove, this)
      .off('MSPointerUp', this._fireEdit, this)
  },

  _fireEdit() {
    this._poly.edited = true
    this._poly.fire('edit')
    this._poly._map.fire(L.Draw.Event.EDITVERTEX, {
      layers: this._markerGroup,
      poly: this._poly,
    })
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _onMarkerDrag(e: any) {
    const marker = e.target
    const poly = this._poly

    const oldOrigLatLng = L.LatLngUtil.cloneLatLng(marker._origLatLng)
    L.extend(marker._origLatLng, marker._latlng)
    if (poly.options.poly) {
      const tooltip = poly._map._editTooltip

      if (!poly.options.poly.allowIntersection && poly.intersects()) {
        L.extend(marker._origLatLng, oldOrigLatLng)
        marker.setLatLng(oldOrigLatLng)
        const originalColor = poly.options.color
        poly.setStyle({ color: this.options.drawError.color })
        if (tooltip) {
          tooltip.updateContent({
            text: L.drawLocal.draw.handlers.polyline.error,
          })
        }

        setTimeout(() => {
          poly.setStyle({ color: originalColor })
          if (tooltip) {
            tooltip.updateContent({
              text: L.drawLocal.edit.handlers.edit.tooltip.text,
              subtext: L.drawLocal.edit.handlers.edit.tooltip.subtext,
            })
          }
        }, 1000)
      }
    }

    if (marker._middleLeft) {
      marker._middleLeft.setLatLng(this._getMiddleLatLng(marker._prev, marker))
    }
    if (marker._middleRight) {
      marker._middleRight.setLatLng(this._getMiddleLatLng(marker, marker._next))
    }

    this._poly._bounds._southWest = L.latLng(Infinity, Infinity)
    this._poly._bounds._northEast = L.latLng(-Infinity, -Infinity)
    const latlngs = this._poly.getLatLngs()
    this._poly._convertLatLngs(latlngs, true)
    this._poly.redraw()
    this._poly.fire('editdrag')
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _onMarkerClick(e: any) {
    const minPoints = L.Polygon && this._poly instanceof L.Polygon ? 4 : 3
    const marker = e.target

    if (this._defaultShape().length < minPoints) {
      return
    }

    this._removeMarker(marker)

    this._updatePrevNext(marker._prev, marker._next)

    if (marker._middleLeft) {
      this._markerGroup.removeLayer(marker._middleLeft)
    }
    if (marker._middleRight) {
      this._markerGroup.removeLayer(marker._middleRight)
    }

    if (marker._prev && marker._next) {
      this._createMiddleMarker(marker._prev, marker._next)
    } else if (!marker._prev) {
      marker._next._middleLeft = null
    } else if (!marker._next) {
      marker._prev._middleRight = null
    }

    this._fireEdit()
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _onContextMenu(e: any) {
    const marker = e.target
    this._poly._map.fire(L.Draw.Event.MARKERCONTEXT, {
      marker,
      layers: this._markerGroup,
      poly: this._poly,
    })
    L.DomEvent.stopPropagation(e)
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _onTouchMove(e: any) {
    const layerPoint = this._map.mouseEventToLayerPoint(e.originalEvent.touches[0])
    const latlng = this._map.layerPointToLatLng(layerPoint)
    const marker = e.target

    L.extend(marker._origLatLng, latlng)

    if (marker._middleLeft) {
      marker._middleLeft.setLatLng(this._getMiddleLatLng(marker._prev, marker))
    }
    if (marker._middleRight) {
      marker._middleRight.setLatLng(this._getMiddleLatLng(marker, marker._next))
    }

    this._poly.redraw()
    this.updateMarkers()
  },

  _updateIndexes(index: number, delta: number) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this._markerGroup.eachLayer((marker: any) => {
      if (marker._index > index) {
        marker._index += delta
      }
    })
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _createMiddleMarker(marker1: any, marker2: any) {
    const latlng = this._getMiddleLatLng(marker1, marker2)
    const marker = this._createMarker(latlng)

    marker.setOpacity(0.6)

    marker1._middleRight = marker2._middleLeft = marker

    const onDragStart = () => {
      marker.off('touchmove', onDragStart, this)
      const i = marker2._index

      marker._index = i

      marker.off('click', onClick, this).on('click', this._onMarkerClick, this)

      latlng.lat = marker.getLatLng().lat
      latlng.lng = marker.getLatLng().lng
      this._spliceLatLngs(i, 0, latlng)
      this._markers.splice(i, 0, marker)

      marker.setOpacity(1)

      this._updateIndexes(i, 1)
      marker2._index++
      this._updatePrevNext(marker1, marker)
      this._updatePrevNext(marker, marker2)

      this._poly.fire('editstart')
    }

    const onDragEnd = () => {
      marker.off('dragstart', onDragStart, this)
      marker.off('dragend', onDragEnd, this)
      marker.off('touchmove', onDragStart, this)

      this._createMiddleMarker(marker1, marker)
      this._createMiddleMarker(marker, marker2)
    }

    const onClick = () => {
      onDragStart.call(this)
      onDragEnd.call(this)
      this._fireEdit()
    }

    marker
      .on('click', onClick, this)
      .on('dragstart', onDragStart, this)
      .on('dragend', onDragEnd, this)
      .on('touchmove', onDragStart, this)

    this._markerGroup.addLayer(marker)
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _updatePrevNext(marker1: any, marker2: any) {
    if (marker1) {
      marker1._next = marker2
    }
    if (marker2) {
      marker2._prev = marker1
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _getMiddleLatLng(marker1: any, marker2: any): LTypes.LatLng {
    const map = this._poly._map
    const p1 = map.project(marker1.getLatLng())
    const p2 = map.project(marker2.getLatLng())

    return map.unproject(p1._add(p2)._divideBy(2))
  },
})

L.Edit.PolyVerticesEdit = EditPolyVerticesEdit

L.Polyline.addInitHook(function (this: LTypes.Polyline) {
  if (this.editing) {
    return
  }

  if (L.Edit.Poly) {
    this.editing = new L.Edit.Poly(this)

    if (this.options.editable) {
      this.editing?.enable()
    }
  }

  this.on('add', function (this: LTypes.Polyline) {
    if (this.editing && this.editing.enabled()) {
      this.editing.addHooks?.()
    }
  })

  this.on('remove', function (this: LTypes.Polyline) {
    if (this.editing && this.editing.enabled()) {
      this.editing.removeHooks?.()
    }
  })
})
