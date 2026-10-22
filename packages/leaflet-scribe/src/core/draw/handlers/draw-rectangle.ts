import type * as LTypes from 'leaflet'
import { L } from '../../shared/index.js'
import { DrawSimpleShape } from './draw-simple-shape.js'

function hasAncestor(el: HTMLElement | null, cls: string): HTMLElement | null {
  let current = el
  while ((current = current?.parentElement ?? null) && !current.classList.contains(cls)) {
    // walk up DOM tree
  }
  return current
}

/**
 * Rectangle drawing handler (`L.Draw.Rectangle`).
 */
export const DrawRectangle = DrawSimpleShape.extend({
  statics: {
    TYPE: 'rectangle',
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
    showArea: true,
    metric: true,
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialize(map: LTypes.Map, options?: Record<string, any>) {
    this.type = DrawRectangle.TYPE

    this._initialLabelText = L.drawLocal.draw.handlers.rectangle.tooltip.start

    DrawSimpleShape.prototype.initialize.call(this, map, options)
  },

  disable() {
    if (!this._enabled) {
      return
    }

    this._isCurrentlyTwoClickDrawing = false
    DrawSimpleShape.prototype.disable.call(this)
  },

  _onMouseUp(e: Event) {
    if (!this._shape && !this._isCurrentlyTwoClickDrawing) {
      this._isCurrentlyTwoClickDrawing = true
      return
    }

    if (
      this._isCurrentlyTwoClickDrawing &&
      !hasAncestor((e?.target as HTMLElement) ?? null, 'leaflet-pane')
    ) {
      return
    }

    DrawSimpleShape.prototype._onMouseUp.call(this)
  },

  _drawShape(latlng: LTypes.LatLng) {
    if (!this._shape) {
      this._shape = new L.Rectangle(
        new L.LatLngBounds(this._startLatLng, latlng),
        this.options.shapeOptions,
      )
      this._map.addLayer(this._shape)
    } else {
      this._shape.setBounds(new L.LatLngBounds(this._startLatLng, latlng))
    }
  },

  _fireCreatedEvent() {
    const rectangle = new L.Rectangle(this._shape.getBounds(), this.options.shapeOptions)
    DrawSimpleShape.prototype._fireCreatedEvent.call(this, rectangle)
  },

  _getTooltipText() {
    const tooltipText = DrawSimpleShape.prototype._getTooltipText.call(this)
    const shape = this._shape
    const showArea = this.options.showArea
    let subtext: string | undefined

    if (shape) {
      const latLngs = L.GeometryUtil.getDefaultShape(this._shape)
      const area = L.GeometryUtil.geodesicArea(latLngs)
      subtext = showArea ? L.GeometryUtil.readableArea(area, this.options.metric) : ''
    }

    return {
      text: tooltipText.text,
      subtext,
    }
  },
})

L.Draw.Rectangle = DrawRectangle

