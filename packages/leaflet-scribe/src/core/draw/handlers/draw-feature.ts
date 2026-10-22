import type * as LTypes from 'leaflet'
import { L } from '../../shared/index.js'

L.Draw = L.Draw || {}

/**
 * Base handler for all vector and marker drawing tools (`L.Draw.Feature`).
 */
export const DrawFeature = L.Handler.extend({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialize(map: LTypes.Map, options?: Record<string, any>) {
    this._map = map
    this._container = (map as unknown as { _container: HTMLElement })._container
    const panes = (map as unknown as { _panes: { overlayPane: HTMLElement; popupPane: HTMLElement } })
      ._panes
    this._overlayPane = panes.overlayPane
    this._popupPane = panes.popupPane

    if (options && options.shapeOptions) {
      options.shapeOptions = L.Util.extend({}, this.options.shapeOptions, options.shapeOptions)
    }
    L.setOptions(this, options)

    const version = L.version.split('.')
    if (parseInt(version[0], 10) === 1 && parseInt(version[1], 10) >= 2) {
      L.Draw.Feature.include(L.Evented.prototype)
    } else {
      L.Draw.Feature.include(L.Mixin.Events)
    }
  },

  enable() {
    if (this._enabled) {
      return
    }

    L.Handler.prototype.enable.call(this)

    this.fire('enabled', { handler: this.type })

    this._map.fire(L.Draw.Event.DRAWSTART, { layerType: this.type })
  },

  disable() {
    if (!this._enabled) {
      return
    }

    L.Handler.prototype.disable.call(this)

    this._map.fire(L.Draw.Event.DRAWSTOP, { layerType: this.type })

    this.fire('disabled', { handler: this.type })
  },

  addHooks() {
    const map = this._map

    if (map) {
      L.DomUtil.disableTextSelection()

      map.getContainer().focus()

      this._tooltip = new L.Draw.Tooltip(this._map)

      L.DomEvent.on(this._container, 'keyup', this._cancelDrawing, this)
    }
  },

  removeHooks() {
    if (this._map) {
      L.DomUtil.enableTextSelection()

      this._tooltip.dispose()
      this._tooltip = null

      L.DomEvent.off(this._container, 'keyup', this._cancelDrawing, this)
    }
  },

  setOptions(options?: Record<string, unknown>) {
    L.setOptions(this, options)
  },

  _fireCreatedEvent(layer: LTypes.Layer) {
    this._map.fire(L.Draw.Event.CREATED, { layer, layerType: this.type })
  },

  _cancelDrawing(e: KeyboardEvent) {
    if (e.keyCode === 27) {
      this._map.fire('draw:canceled', { layerType: this.type })
      this.disable()
    }
  },
})

L.Draw.Feature = DrawFeature

