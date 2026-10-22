import type * as LTypes from 'leaflet'
import { L } from '../../shared/index.js'

L.Edit = L.Edit || {}

/**
 * Marker editing handler (`L.Edit.Marker`).
 */
export const EditMarker = L.Handler.extend({
  initialize(marker: LTypes.Marker, options?: Record<string, unknown>) {
    this._marker = marker
    L.setOptions(this, options)
  },

  addHooks() {
    const marker = this._marker

    marker.dragging.enable()
    marker.on('dragend', this._onDragEnd, marker)
    this._toggleMarkerHighlight()
  },

  removeHooks() {
    const marker = this._marker

    marker.dragging.disable()
    marker.off('dragend', this._onDragEnd, marker)
    this._toggleMarkerHighlight()
  },

  _onDragEnd(e: LTypes.LeafletEvent) {
    const layer = e.target
    layer.edited = true
    this._map.fire(L.Draw.Event.EDITMOVE, { layer })
  },

  _toggleMarkerHighlight() {
    const icon = this._marker._icon

    if (!icon) {
      return
    }

    icon.style.display = 'none'

    if (L.DomUtil.hasClass(icon, 'leaflet-edit-marker-selected')) {
      L.DomUtil.removeClass(icon, 'leaflet-edit-marker-selected')
      this._offsetMarker(icon, -4)
    } else {
      L.DomUtil.addClass(icon, 'leaflet-edit-marker-selected')
      this._offsetMarker(icon, 4)
    }

    icon.style.display = ''
  },

  _offsetMarker(icon: HTMLElement, offset: number) {
    const iconMarginTop = parseInt(icon.style.marginTop, 10) - offset
    const iconMarginLeft = parseInt(icon.style.marginLeft, 10) - offset

    icon.style.marginTop = iconMarginTop + 'px'
    icon.style.marginLeft = iconMarginLeft + 'px'
  },
})

L.Edit.Marker = EditMarker

L.Marker.addInitHook(function (this: LTypes.Marker) {
  if (L.Edit.Marker) {
    this.editing = new L.Edit.Marker(this)

    if (this.options.editable) {
      this.editing?.enable()
    }
  }
})
