import type * as LTypes from 'leaflet'
import { L } from '../../shared/index.js'
import { DrawFeature } from './draw-feature.js'

L.SimpleShape = L.SimpleShape || {}

/**
 * Base handler for two-point simple shapes such as Rectangle and Circle (`L.Draw.SimpleShape`).
 */
export const DrawSimpleShape = DrawFeature.extend({
  options: {
    repeatMode: false,
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialize(map: LTypes.Map, options?: Record<string, any>) {
    this._endLabelText = L.drawLocal.draw.handlers.simpleshape.tooltip.end

    DrawFeature.prototype.initialize.call(this, map, options)
  },

  addHooks() {
    DrawFeature.prototype.addHooks.call(this)
    if (this._map) {
      this._mapDraggable = this._map.dragging.enabled()

      if (this._mapDraggable) {
        this._map.dragging.disable()
      }

      this._container.style.cursor = 'crosshair'

      this._tooltip.updateContent({ text: this._initialLabelText })

      this._map
        .on('mousedown', this._onMouseDown, this)
        .on('mousemove', this._onMouseMove, this)
        .on('touchstart', this._onMouseDown, this)
        .on('touchmove', this._onMouseMove, this)

      if (typeof document !== 'undefined') {
        document.addEventListener('touchstart', L.DomEvent.preventDefault, {
          passive: false,
        })
      }
    }
  },

  removeHooks() {
    DrawFeature.prototype.removeHooks.call(this)
    if (this._map) {
      if (this._mapDraggable) {
        this._map.dragging.enable()
      }

      this._container.style.cursor = ''

      this._map
        .off('mousedown', this._onMouseDown, this)
        .off('mousemove', this._onMouseMove, this)
        .off('touchstart', this._onMouseDown, this)
        .off('touchmove', this._onMouseMove, this)

      if (typeof document !== 'undefined') {
        L.DomEvent.off(document as unknown as HTMLElement, 'mouseup', this._onMouseUp, this)
        L.DomEvent.off(document as unknown as HTMLElement, 'touchend', this._onMouseUp, this)
        document.removeEventListener('touchstart', L.DomEvent.preventDefault)
      }

      if (this._shape) {
        this._map.removeLayer(this._shape)
        delete this._shape
      }
    }
    this._isDrawing = false
  },

  _getTooltipText() {
    return {
      text: this._endLabelText,
    }
  },

  _onMouseDown(e: LTypes.LeafletMouseEvent) {
    this._isDrawing = true
    this._startLatLng = e.latlng

    if (typeof document !== 'undefined') {
      L.DomEvent.on(document as unknown as HTMLElement, 'mouseup', this._onMouseUp, this)
        .on(document as unknown as HTMLElement, 'touchend', this._onMouseUp, this)
        .preventDefault(e.originalEvent)
    }
  },

  _onMouseMove(e: LTypes.LeafletMouseEvent) {
    const latlng = e.latlng

    this._tooltip.updatePosition(latlng)
    if (this._isDrawing) {
      this._tooltip.updateContent(this._getTooltipText())
      this._drawShape(latlng)
    }
  },

  _onMouseUp() {
    if (this._shape) {
      this._fireCreatedEvent()
    }

    this.disable()
    if (this.options.repeatMode) {
      this.enable()
    }
  },
})

L.Draw.SimpleShape = DrawSimpleShape

