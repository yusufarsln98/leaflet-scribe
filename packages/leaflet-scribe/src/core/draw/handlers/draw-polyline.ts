import type * as LTypes from 'leaflet'
import { L } from '../../shared/index.js'
import { DrawFeature } from './draw-feature.js'

/**
 * Polyline drawing handler (`L.Draw.Polyline`).
 */
export const DrawPolyline = DrawFeature.extend({
  statics: {
    TYPE: 'polyline',
  },

  Poly: L.Polyline,

  options: {
    allowIntersection: true,
    repeatMode: false,
    drawError: {
      color: '#b00b00',
      timeout: 2500,
    },
    icon: new L.DivIcon({
      iconSize: new L.Point(8, 8),
      className: 'leaflet-div-icon leaflet-editing-icon',
    }),
    touchIcon: new L.DivIcon({
      iconSize: new L.Point(20, 20),
      className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon',
    }),
    guidelineDistance: 20,
    maxGuideLineLength: 4000,
    shapeOptions: {
      stroke: true,
      color: '#3388ff',
      weight: 4,
      opacity: 0.5,
      fill: false,
      clickable: true,
    },
    metric: true,
    feet: true,
    nautic: false,
    showLength: true,
    zIndexOffset: 2000,
    factor: 1,
    maxPoints: 0,
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialize(map: LTypes.Map, options?: Record<string, any>) {
    if (L.Browser.touch) {
      this.options.icon = this.options.touchIcon
    }

    this.options.drawError.message = L.drawLocal.draw.handlers.polyline.error

    if (options && options.drawError) {
      options.drawError = L.Util.extend({}, this.options.drawError, options.drawError)
    }

    this.type = DrawPolyline.TYPE

    DrawFeature.prototype.initialize.call(this, map, options)
  },

  addHooks() {
    DrawFeature.prototype.addHooks.call(this)
    if (this._map) {
      this._markers = []

      this._markerGroup = new L.LayerGroup()
      this._map.addLayer(this._markerGroup)

      this._poly = new L.Polyline([], this.options.shapeOptions)

      this._tooltip.updateContent(this._getTooltipText())

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

      this._mouseMarker
        .on('mouseout', this._onMouseOut, this)
        .on('mousemove', this._onMouseMove, this)
        .on('mousedown', this._onMouseDown, this)
        .on('mouseup', this._onMouseUp, this)
        .addTo(this._map)

      this._map
        .on('mouseup', this._onMouseUp, this)
        .on('mousemove', this._onMouseMove, this)
        .on('zoomlevelschange', this._onZoomEnd, this)
        .on('touchstart', this._onTouch, this)
        .on('zoomend', this._onZoomEnd, this)
    }
  },

  removeHooks() {
    DrawFeature.prototype.removeHooks.call(this)

    this._clearHideErrorTimeout()

    this._cleanUpShape()

    this._map.removeLayer(this._markerGroup)
    delete this._markerGroup
    delete this._markers

    this._map.removeLayer(this._poly)
    delete this._poly

    this._mouseMarker
      .off('mousedown', this._onMouseDown, this)
      .off('mouseout', this._onMouseOut, this)
      .off('mouseup', this._onMouseUp, this)
      .off('mousemove', this._onMouseMove, this)
    this._map.removeLayer(this._mouseMarker)
    delete this._mouseMarker

    this._clearGuides()

    this._map
      .off('mouseup', this._onMouseUp, this)
      .off('mousemove', this._onMouseMove, this)
      .off('zoomlevelschange', this._onZoomEnd, this)
      .off('zoomend', this._onZoomEnd, this)
      .off('touchstart', this._onTouch, this)
      .off('click', this._onTouch, this)
  },

  deleteLastVertex() {
    if (this._markers.length <= 1) {
      return
    }

    const lastMarker = this._markers.pop()
    const poly = this._poly
    const latlngs = poly.getLatLngs()
    const latlng = latlngs.splice(-1, 1)[0]
    this._poly.setLatLngs(latlngs)

    this._markerGroup.removeLayer(lastMarker)

    if (poly.getLatLngs().length < 2) {
      this._map.removeLayer(poly)
    }

    this._vertexChanged(latlng, false)
  },

  addVertex(latlng: LTypes.LatLng) {
    const markersLength = this._markers.length

    if (
      markersLength >= 2 &&
      !this.options.allowIntersection &&
      this._poly.newLatLngIntersects(latlng)
    ) {
      this._showErrorTooltip()
      return
    } else if (this._errorShown) {
      this._hideErrorTooltip()
    }

    this._markers.push(this._createMarker(latlng))

    this._poly.addLatLng(latlng)

    if (this._poly.getLatLngs().length === 2) {
      this._map.addLayer(this._poly)
    }

    this._vertexChanged(latlng, true)
  },

  completeShape() {
    if (this._markers.length <= 1 || !this._shapeIsValid()) {
      return
    }

    this._fireCreatedEvent()
    this.disable()

    if (this.options.repeatMode) {
      this.enable()
    }
  },

  _finishShape() {
    const latlngs = L.GeometryUtil.getDefaultShape(this._poly)
    const intersects = this._poly.newLatLngIntersects(latlngs[latlngs.length - 1])

    if ((!this.options.allowIntersection && intersects) || !this._shapeIsValid()) {
      this._showErrorTooltip()
      return
    }

    this._fireCreatedEvent()
    this.disable()
    if (this.options.repeatMode) {
      this.enable()
    }
  },

  _shapeIsValid(): boolean {
    return true
  },

  _onZoomEnd() {
    if (this._markers !== null) {
      this._updateGuide()
    }
  },

  _onMouseMove(e: LTypes.LeafletMouseEvent) {
    const newPos = this._map.mouseEventToLayerPoint(e.originalEvent)
    const latlng = this._map.layerPointToLatLng(newPos)

    this._currentLatLng = latlng

    this._updateTooltip(latlng)

    this._updateGuide(newPos)

    this._mouseMarker.setLatLng(latlng)

    L.DomEvent.preventDefault(e.originalEvent)
  },

  _vertexChanged(latlng: LTypes.LatLng, added: boolean) {
    this._map.fire(L.Draw.Event.DRAWVERTEX, { layers: this._markerGroup })
    this._updateFinishHandler()

    this._updateRunningMeasure(latlng, added)

    this._clearGuides()

    this._updateTooltip()
  },

  _onMouseDown(e: LTypes.LeafletMouseEvent) {
    if (!this._clickHandled && !this._touchHandled && !this._disableMarkers) {
      this._onMouseMove(e)
      this._clickHandled = true
      this._disableNewMarkers()
      const originalEvent = e.originalEvent
      const clientX = originalEvent.clientX
      const clientY = originalEvent.clientY
      this._startPoint.call(this, clientX, clientY)
    }
  },

  _startPoint(clientX: number, clientY: number) {
    this._mouseDownOrigin = L.point(clientX, clientY)
  },

  _onMouseUp(e: LTypes.LeafletMouseEvent) {
    const originalEvent = e.originalEvent
    const clientX = originalEvent.clientX
    const clientY = originalEvent.clientY
    this._endPoint.call(this, clientX, clientY, e)
    this._clickHandled = null
  },

  _endPoint(clientX: number, clientY: number, e: LTypes.LeafletMouseEvent) {
    if (this._mouseDownOrigin) {
      const dragCheckDistance = L.point(clientX, clientY).distanceTo(this._mouseDownOrigin)
      const lastPtDistance = this._calculateFinishDistance(e.latlng)
      if (this.options.maxPoints > 1 && this.options.maxPoints === this._markers.length + 1) {
        this.addVertex(e.latlng)
        this._finishShape()
      } else if (lastPtDistance < 10 && L.Browser.touch) {
        this._finishShape()
      } else if (
        Math.abs(dragCheckDistance) <
        9 * ((typeof window !== 'undefined' && window.devicePixelRatio) || 1)
      ) {
        this.addVertex(e.latlng)
      }
      this._enableNewMarkers()
    }
    this._mouseDownOrigin = null
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _onTouch(e: any) {
    const originalEvent = e.originalEvent
    if (
      originalEvent.touches &&
      originalEvent.touches[0] &&
      !this._clickHandled &&
      !this._touchHandled &&
      !this._disableMarkers
    ) {
      const clientX = originalEvent.touches[0].clientX
      const clientY = originalEvent.touches[0].clientY
      this._disableNewMarkers()
      this._touchHandled = true
      this._startPoint.call(this, clientX, clientY)
      this._endPoint.call(this, clientX, clientY, e)
      this._touchHandled = null
    }
    this._clickHandled = null
  },

  _onMouseOut() {
    if (this._tooltip) {
      this._tooltip._onMouseOut.call(this._tooltip)
    }
  },

  _calculateFinishDistance(potentialLatLng: LTypes.LatLng): number {
    let lastPtDistance: number
    if (this._markers.length > 0) {
      let finishMarker: LTypes.Marker
      if (this.type === DrawPolyline.TYPE) {
        finishMarker = this._markers[this._markers.length - 1]
      } else if (this.type === L.Draw.Polygon.TYPE) {
        finishMarker = this._markers[0]
      } else {
        return Infinity
      }
      const lastMarkerPoint = this._map.latLngToContainerPoint(finishMarker.getLatLng())
      const potentialMarker = new L.Marker(potentialLatLng, {
        icon: this.options.icon,
        zIndexOffset: this.options.zIndexOffset * 2,
      })
      const potentialMarkerPoint = this._map.latLngToContainerPoint(
        potentialMarker.getLatLng(),
      )
      lastPtDistance = lastMarkerPoint.distanceTo(potentialMarkerPoint)
    } else {
      lastPtDistance = Infinity
    }
    return lastPtDistance
  },

  _updateFinishHandler() {
    const markerCount = this._markers.length
    if (markerCount > 1) {
      this._markers[markerCount - 1].on('click', this._finishShape, this)
    }

    if (markerCount > 2) {
      this._markers[markerCount - 2].off('click', this._finishShape, this)
    }
  },

  _createMarker(latlng: LTypes.LatLng): LTypes.Marker {
    const marker = new L.Marker(latlng, {
      icon: this.options.icon,
      zIndexOffset: this.options.zIndexOffset * 2,
    })

    this._markerGroup.addLayer(marker)

    return marker
  },

  _updateGuide(newPos?: LTypes.Point) {
    const markerCount = this._markers ? this._markers.length : 0

    if (markerCount > 0) {
      const targetPos = newPos || this._map.latLngToLayerPoint(this._currentLatLng)

      this._clearGuides()
      this._drawGuide(
        this._map.latLngToLayerPoint(this._markers[markerCount - 1].getLatLng()),
        targetPos,
      )
    }
  },

  _updateTooltip(latLng?: LTypes.LatLng) {
    const text = this._getTooltipText()

    if (latLng) {
      this._tooltip.updatePosition(latLng)
    }

    if (!this._errorShown) {
      this._tooltip.updateContent(text)
    }
  },

  _drawGuide(pointA: LTypes.Point, pointB: LTypes.Point) {
    const length = Math.floor(
      Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2)),
    )
    const guidelineDistance = this.options.guidelineDistance
    const maxGuideLineLength = this.options.maxGuideLineLength
    let i =
      length > maxGuideLineLength ? length - maxGuideLineLength : guidelineDistance

    if (!this._guidesContainer) {
      this._guidesContainer = L.DomUtil.create('div', 'leaflet-draw-guides', this._overlayPane)
    }

    for (; i < length; i += this.options.guidelineDistance) {
      const fraction = i / length

      const dashPoint = L.point(
        Math.floor(pointA.x * (1 - fraction) + fraction * pointB.x),
        Math.floor(pointA.y * (1 - fraction) + fraction * pointB.y),
      )

      const dash = L.DomUtil.create('div', 'leaflet-draw-guide-dash', this._guidesContainer)
      dash.style.backgroundColor = !this._errorShown
        ? this.options.shapeOptions.color
        : this.options.drawError.color

      L.DomUtil.setPosition(dash, dashPoint)
    }
  },

  _updateGuideColor(color: string) {
    if (this._guidesContainer) {
      for (let i = 0, l = this._guidesContainer.childNodes.length; i < l; i++) {
        ;(this._guidesContainer.childNodes[i] as HTMLElement).style.backgroundColor = color
      }
    }
  },

  _clearGuides() {
    if (this._guidesContainer) {
      while (this._guidesContainer.firstChild) {
        this._guidesContainer.removeChild(this._guidesContainer.firstChild)
      }
    }
  },

  _getTooltipText() {
    const showLength = this.options.showLength
    let labelText: { text: string; subtext?: string }
    if (this._markers.length === 0) {
      labelText = {
        text: L.drawLocal.draw.handlers.polyline.tooltip.start,
      }
    } else {
      const distanceStr = showLength ? this._getMeasurementString() : ''

      if (this._markers.length === 1) {
        labelText = {
          text: L.drawLocal.draw.handlers.polyline.tooltip.cont,
          subtext: distanceStr,
        }
      } else {
        labelText = {
          text: L.drawLocal.draw.handlers.polyline.tooltip.end,
          subtext: distanceStr,
        }
      }
    }
    return labelText
  },

  _updateRunningMeasure(latlng: LTypes.LatLng, added: boolean) {
    const markersLength = this._markers.length

    if (this._markers.length === 1) {
      this._measurementRunningTotal = 0
    } else {
      const previousMarkerIndex = markersLength - (added ? 2 : 1)
      let distance: number

      if (L.GeometryUtil.isVersion07x()) {
        distance =
          latlng.distanceTo(this._markers[previousMarkerIndex].getLatLng()) *
          (this.options.factor || 1)
      } else {
        distance =
          this._map.distance(latlng, this._markers[previousMarkerIndex].getLatLng()) *
          (this.options.factor || 1)
      }

      this._measurementRunningTotal += distance * (added ? 1 : -1)
    }
  },

  _getMeasurementString(): string {
    const currentLatLng = this._currentLatLng
    const previousLatLng = this._markers[this._markers.length - 1].getLatLng()
    let distance: number

    if (L.GeometryUtil.isVersion07x()) {
      distance =
        previousLatLng && currentLatLng && currentLatLng.distanceTo
          ? this._measurementRunningTotal +
            currentLatLng.distanceTo(previousLatLng) * (this.options.factor || 1)
          : this._measurementRunningTotal || 0
    } else {
      distance =
        previousLatLng && currentLatLng
          ? this._measurementRunningTotal +
            this._map.distance(currentLatLng, previousLatLng) * (this.options.factor || 1)
          : this._measurementRunningTotal || 0
    }

    return L.GeometryUtil.readableDistance(
      distance,
      this.options.metric,
      this.options.feet,
      this.options.nautic,
      this.options.precision,
    )
  },

  _showErrorTooltip() {
    this._errorShown = true

    this._tooltip.showAsError().updateContent({ text: this.options.drawError.message })

    this._updateGuideColor(this.options.drawError.color)
    this._poly.setStyle({ color: this.options.drawError.color })

    this._clearHideErrorTimeout()
    this._hideErrorTimeout = setTimeout(
      L.Util.bind(this._hideErrorTooltip, this),
      this.options.drawError.timeout,
    )
  },

  _hideErrorTooltip() {
    this._errorShown = false

    this._clearHideErrorTimeout()

    this._tooltip.removeError().updateContent(this._getTooltipText())

    this._updateGuideColor(this.options.shapeOptions.color)
    this._poly.setStyle({ color: this.options.shapeOptions.color })
  },

  _clearHideErrorTimeout() {
    if (this._hideErrorTimeout) {
      clearTimeout(this._hideErrorTimeout)
      this._hideErrorTimeout = null
    }
  },

  _disableNewMarkers() {
    this._disableMarkers = true
  },

  _enableNewMarkers() {
    setTimeout(() => {
      this._disableMarkers = false
    }, 50)
  },

  _cleanUpShape() {
    if (this._markers.length > 1) {
      this._markers[this._markers.length - 1].off('click', this._finishShape, this)
    }
  },

  _fireCreatedEvent() {
    const poly = new this.Poly(this._poly.getLatLngs(), this.options.shapeOptions)
    DrawFeature.prototype._fireCreatedEvent.call(this, poly)
  },
})

L.Draw.Polyline = DrawPolyline

