import type * as LTypes from 'leaflet'
import { L } from '../shared/index.js'
import type { TooltipLabelText } from '../types/index.js'

L.Draw = L.Draw || {}

/**
 * The tooltip class used to display cursor instructions and measurements while drawing (`L.Draw.Tooltip`).
 */
export const DrawTooltip = L.Class.extend({
  initialize(map: LTypes.Map) {
    this._map = map
    this._popupPane = (map as unknown as { _panes: { popupPane: HTMLElement } })._panes.popupPane
    this._visible = false

    this._container = map.options.drawControlTooltips
      ? L.DomUtil.create('div', 'leaflet-draw-tooltip', this._popupPane)
      : null
    this._singleLineLabel = false

    this._map.on('mouseout', this._onMouseOut, this)
  },

  dispose() {
    this._map.off('mouseout', this._onMouseOut, this)

    if (this._container) {
      this._popupPane.removeChild(this._container)
      this._container = null
    }
  },

  updateContent(labelText: TooltipLabelText) {
    if (!this._container) {
      return this
    }
    const subtext = labelText.subtext || ''

    if (subtext.length === 0 && !this._singleLineLabel) {
      L.DomUtil.addClass(this._container, 'leaflet-draw-tooltip-single')
      this._singleLineLabel = true
    } else if (subtext.length > 0 && this._singleLineLabel) {
      L.DomUtil.removeClass(this._container, 'leaflet-draw-tooltip-single')
      this._singleLineLabel = false
    }

    this._container.innerHTML =
      (subtext.length > 0
        ? '<span class="leaflet-draw-tooltip-subtext">' + subtext + '</span><br />'
        : '') +
      '<span>' +
      labelText.text +
      '</span>'

    if (!labelText.text && !subtext) {
      this._visible = false
      this._container.style.visibility = 'hidden'
    } else {
      this._visible = true
      this._container.style.visibility = 'inherit'
    }

    return this
  },

  updatePosition(latlng: LTypes.LatLng) {
    const pos = this._map.latLngToLayerPoint(latlng)
    const tooltipContainer = this._container

    if (this._container) {
      if (this._visible) {
        tooltipContainer.style.visibility = 'inherit'
      }
      L.DomUtil.setPosition(tooltipContainer, pos)
    }

    return this
  },

  showAsError() {
    if (this._container) {
      L.DomUtil.addClass(this._container, 'leaflet-error-draw-tooltip')
    }
    return this
  },

  removeError() {
    if (this._container) {
      L.DomUtil.removeClass(this._container, 'leaflet-error-draw-tooltip')
    }
    return this
  },

  _onMouseOut() {
    if (this._container) {
      this._container.style.visibility = 'hidden'
    }
  },
})

L.Draw.Tooltip = DrawTooltip

