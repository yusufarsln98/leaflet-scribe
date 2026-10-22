import type * as LTypes from 'leaflet'
import { L } from '../shared/index.js'
import { Toolbar } from '../ui/toolbar.js'
import './handlers/index.js'

/**
 * Toolbar for vector and marker drawing tools (`L.DrawToolbar`).
 */
export const DrawToolbar = Toolbar.extend({
  statics: {
    TYPE: 'draw',
  },

  options: {
    polyline: {},
    polygon: {},
    rectangle: {},
    circle: {},
    marker: {},
    circlemarker: {},
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialize(options?: Record<string, any>) {
    const mergedOptions = options || {}
    for (const type in this.options) {
      if (Object.prototype.hasOwnProperty.call(this.options, type)) {
        if (mergedOptions[type]) {
          mergedOptions[type] = L.extend({}, this.options[type], mergedOptions[type])
        }
      }
    }

    this._toolbarClass = 'leaflet-draw-draw'
    Toolbar.prototype.initialize.call(this, mergedOptions)
  },

  getModeHandlers(map: LTypes.Map) {
    return [
      {
        enabled: this.options.polyline,
        handler: new L.Draw.Polyline(map, this.options.polyline),
        title: L.drawLocal.draw.toolbar.buttons.polyline,
      },
      {
        enabled: this.options.polygon,
        handler: new L.Draw.Polygon(map, this.options.polygon),
        title: L.drawLocal.draw.toolbar.buttons.polygon,
      },
      {
        enabled: this.options.rectangle,
        handler: new L.Draw.Rectangle(map, this.options.rectangle),
        title: L.drawLocal.draw.toolbar.buttons.rectangle,
      },
      {
        enabled: this.options.circle,
        handler: new L.Draw.Circle(map, this.options.circle),
        title: L.drawLocal.draw.toolbar.buttons.circle,
      },
      {
        enabled: this.options.marker,
        handler: new L.Draw.Marker(map, this.options.marker),
        title: L.drawLocal.draw.toolbar.buttons.marker,
      },
      {
        enabled: this.options.circlemarker,
        handler: new L.Draw.CircleMarker(map, this.options.circlemarker),
        title: L.drawLocal.draw.toolbar.buttons.circlemarker,
      },
    ]
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getActions(handler: any) {
    return [
      {
        enabled: handler.completeShape,
        title: L.drawLocal.draw.toolbar.finish.title,
        text: L.drawLocal.draw.toolbar.finish.text,
        callback: handler.completeShape,
        context: handler,
      },
      {
        enabled: handler.deleteLastVertex,
        title: L.drawLocal.draw.toolbar.undo.title,
        text: L.drawLocal.draw.toolbar.undo.text,
        callback: handler.deleteLastVertex,
        context: handler,
      },
      {
        title: L.drawLocal.draw.toolbar.actions.title,
        text: L.drawLocal.draw.toolbar.actions.text,
        callback: this.disable,
        context: this,
      },
    ]
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setOptions(options: Record<string, any>) {
    L.setOptions(this, options)

    for (const type in this._modes) {
      if (
        Object.prototype.hasOwnProperty.call(this._modes, type) &&
        Object.prototype.hasOwnProperty.call(options, type)
      ) {
        this._modes[type].handler.setOptions(options[type])
      }
    }
  },
})

L.DrawToolbar = DrawToolbar

