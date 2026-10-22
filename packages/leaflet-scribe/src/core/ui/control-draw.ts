import type * as LTypes from 'leaflet'
import { L } from '../shared/index.js'
import type { ControlDrawToolbarOptions, DrawConstructorOptions } from '../types/index.js'

/**
 * Main Leaflet Draw control (`L.Control.Draw`) that manages `L.DrawToolbar` and `L.EditToolbar`.
 */
export const ControlDraw = L.Control.extend({
  options: {
    position: 'topleft',
    draw: {},
    edit: false,
  },

  initialize(options?: DrawConstructorOptions) {
    if (L.version < '0.7') {
      throw new Error(
        'Leaflet.draw 0.2.3+ requires Leaflet 0.7.0+. Download latest from https://github.com/Leaflet/Leaflet/',
      )
    }

    L.Control.prototype.initialize.call(this, options)

    let toolbar: LTypes.Toolbar

    this._toolbars = {}

    if (L.DrawToolbar && this.options.draw) {
      toolbar = new L.DrawToolbar(this.options.draw)

      this._toolbars[L.DrawToolbar.TYPE] = toolbar

      this._toolbars[L.DrawToolbar.TYPE].on('enable', this._toolbarEnabled, this)
    }

    if (L.EditToolbar && this.options.edit) {
      toolbar = new L.EditToolbar(this.options.edit)

      this._toolbars[L.EditToolbar.TYPE] = toolbar

      this._toolbars[L.EditToolbar.TYPE].on('enable', this._toolbarEnabled, this)
    }

    L.toolbar = this
  },

  onAdd(map: LTypes.Map): HTMLElement {
    const container = L.DomUtil.create('div', 'leaflet-draw')
    let addedTopClass = false
    const topClassName = 'leaflet-draw-toolbar-top'

    for (const toolbarId in this._toolbars) {
      if (Object.prototype.hasOwnProperty.call(this._toolbars, toolbarId)) {
        const toolbarContainer = this._toolbars[toolbarId].addToolbar(map)

        if (toolbarContainer) {
          if (!addedTopClass) {
            if (!L.DomUtil.hasClass(toolbarContainer, topClassName)) {
              L.DomUtil.addClass(toolbarContainer.childNodes[0] as HTMLElement, topClassName)
            }
            addedTopClass = true
          }

          container.appendChild(toolbarContainer)
        }
      }
    }

    return container
  },

  onRemove() {
    for (const toolbarId in this._toolbars) {
      if (Object.prototype.hasOwnProperty.call(this._toolbars, toolbarId)) {
        this._toolbars[toolbarId].removeToolbar()
      }
    }
  },

  setDrawingOptions(options: ControlDrawToolbarOptions) {
    for (const toolbarId in this._toolbars) {
      if (this._toolbars[toolbarId] instanceof L.DrawToolbar) {
        this._toolbars[toolbarId].setOptions(options)
      }
    }
  },

  _toolbarEnabled(e: LTypes.LeafletEvent) {
    const enabledToolbar = e.target

    for (const toolbarId in this._toolbars) {
      if (this._toolbars[toolbarId] !== enabledToolbar) {
        this._toolbars[toolbarId].disable()
      }
    }
  },
})

L.Control.Draw = ControlDraw

L.Map.mergeOptions({
  drawControlTooltips: true,
  drawControl: false,
})

L.Map.addInitHook(function (this: LTypes.DrawMap) {
  if (this.options.drawControl) {
    const drawControl = new L.Control.Draw()
    this.drawControl = drawControl
    this.addControl(drawControl)
  }
})
