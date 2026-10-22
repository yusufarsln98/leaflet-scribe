import type * as LTypes from 'leaflet'
import { L } from '../../shared/index.js'

/**
 * Toolbar mode handler for editing existing layers in a FeatureGroup (`L.EditToolbar.Edit`).
 */
export const EditToolbarEdit = L.Handler.extend({
  statics: {
    TYPE: 'edit',
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialize(map: LTypes.Map, options: Record<string, any>) {
    L.Handler.prototype.initialize.call(this, map)

    L.setOptions(this, options)

    this._featureGroup = options.featureGroup

    if (!(this._featureGroup instanceof L.FeatureGroup)) {
      throw new Error('options.featureGroup must be a L.FeatureGroup')
    }

    this._uneditedLayerProps = {}

    this.type = EditToolbarEdit.TYPE

    const version = L.version.split('.')
    if (parseInt(version[0], 10) === 1 && parseInt(version[1], 10) >= 2) {
      EditToolbarEdit.include(L.Evented.prototype)
    } else {
      EditToolbarEdit.include(L.Mixin.Events)
    }
  },

  enable() {
    if (this._enabled || !this._hasAvailableLayers()) {
      return
    }
    this.fire('enabled', { handler: this.type })

    this._map.fire(L.Draw.Event.EDITSTART, { handler: this.type })

    L.Handler.prototype.enable.call(this)
    this._featureGroup
      .on('layeradd', this._enableLayerEdit, this)
      .on('layerremove', this._disableLayerEdit, this)
  },

  disable() {
    if (!this._enabled) {
      return
    }
    this._featureGroup
      .off('layeradd', this._enableLayerEdit, this)
      .off('layerremove', this._disableLayerEdit, this)
    L.Handler.prototype.disable.call(this)
    this._map.fire(L.Draw.Event.EDITSTOP, { handler: this.type })
    this.fire('disabled', { handler: this.type })
  },

  addHooks() {
    const map = this._map

    if (map) {
      map.getContainer().focus()

      this._featureGroup.eachLayer(this._enableLayerEdit, this)

      this._tooltip = new L.Draw.Tooltip(this._map)
      this._tooltip.updateContent({
        text: L.drawLocal.edit.handlers.edit.tooltip.text,
        subtext: L.drawLocal.edit.handlers.edit.tooltip.subtext,
      })

      map._editTooltip = this._tooltip

      this._updateTooltip()

      this._map
        .on('mousemove', this._onMouseMove, this)
        .on('touchmove', this._onMouseMove, this)
        .on('MSPointerMove', this._onMouseMove, this)
        .on(L.Draw.Event.EDITVERTEX, this._updateTooltip, this)
    }
  },

  removeHooks() {
    if (this._map) {
      this._featureGroup.eachLayer(this._disableLayerEdit, this)

      this._uneditedLayerProps = {}

      this._tooltip.dispose()
      this._tooltip = null

      this._map
        .off('mousemove', this._onMouseMove, this)
        .off('touchmove', this._onMouseMove, this)
        .off('MSPointerMove', this._onMouseMove, this)
        .off(L.Draw.Event.EDITVERTEX, this._updateTooltip, this)
    }
  },

  revertLayers() {
    this._featureGroup.eachLayer((layer: LTypes.Layer) => {
      this._revertLayer(layer)
    }, this)
  },

  save() {
    const editedLayers = new L.LayerGroup()
    this._featureGroup.eachLayer((layer: LTypes.Layer) => {
      if (layer.edited) {
        editedLayers.addLayer(layer)
        layer.edited = false
      }
    })
    this._map.fire(L.Draw.Event.EDITED, { layers: editedLayers })
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _backupLayer(layer: any) {
    const id = L.Util.stamp(layer)

    if (!this._uneditedLayerProps[id]) {
      if (
        layer instanceof L.Polyline ||
        layer instanceof L.Polygon ||
        layer instanceof L.Rectangle
      ) {
        this._uneditedLayerProps[id] = {
          latlngs: L.LatLngUtil.cloneLatLngs(layer.getLatLngs()),
        }
      } else if (layer instanceof L.Circle) {
        this._uneditedLayerProps[id] = {
          latlng: L.LatLngUtil.cloneLatLng(layer.getLatLng()),
          radius: layer.getRadius(),
        }
      } else if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        this._uneditedLayerProps[id] = {
          latlng: L.LatLngUtil.cloneLatLng(layer.getLatLng()),
        }
      }
    }
  },

  _getTooltipText() {
    return {
      text: L.drawLocal.edit.handlers.edit.tooltip.text,
      subtext: L.drawLocal.edit.handlers.edit.tooltip.subtext,
    }
  },

  _updateTooltip() {
    this._tooltip.updateContent(this._getTooltipText())
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _revertLayer(layer: any) {
    const id = L.Util.stamp(layer)
    layer.edited = false
    if (Object.prototype.hasOwnProperty.call(this._uneditedLayerProps, id)) {
      if (
        layer instanceof L.Polyline ||
        layer instanceof L.Polygon ||
        layer instanceof L.Rectangle
      ) {
        layer.setLatLngs(this._uneditedLayerProps[id].latlngs)
      } else if (layer instanceof L.Circle) {
        layer.setLatLng(this._uneditedLayerProps[id].latlng)
        layer.setRadius(this._uneditedLayerProps[id].radius)
      } else if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        layer.setLatLng(this._uneditedLayerProps[id].latlng)
      }

      layer.fire('revert-edited', { layer })
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _enableLayerEdit(e: any) {
    const layer = e.layer || e.target || e

    this._backupLayer(layer)

    if (this.options.poly) {
      const poly = L.Util.extend({}, this.options.poly)
      layer.options.poly = poly
    }

    if (this.options.selectedPathOptions) {
      const pathOptions = L.Util.extend({}, this.options.selectedPathOptions)

      if (pathOptions.maintainColor) {
        pathOptions.color = layer.options.color
        pathOptions.fillColor = layer.options.fillColor
      }

      layer.options.original = L.extend({}, layer.options)
      layer.options.editing = pathOptions
    }

    if (layer instanceof L.Marker) {
      if (layer.editing) {
        layer.editing.enable()
      }
      layer.dragging?.enable()
      layer
        .on('dragend', this._onMarkerDragEnd)
        .on('touchmove', this._onTouchMove, this)
        .on('MSPointerMove', this._onTouchMove, this)
        .on('touchend', this._onMarkerDragEnd, this)
        .on('MSPointerUp', this._onMarkerDragEnd, this)
    } else {
      layer.editing.enable()
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _disableLayerEdit(e: any) {
    const layer = e.layer || e.target || e

    layer.edited = false
    if (layer.editing) {
      layer.editing.disable()
    }

    delete layer.options.editing
    delete layer.options.original

    if (this._selectedPathOptions) {
      if (layer instanceof L.Marker) {
        this._toggleMarkerHighlight(layer)
      } else {
        layer.setStyle(layer.options.previousOptions)
        delete layer.options.previousOptions
      }
    }

    if (layer instanceof L.Marker) {
      layer.dragging?.disable()
      layer
        .off('dragend', this._onMarkerDragEnd, this)
        .off('touchmove', this._onTouchMove, this)
        .off('MSPointerMove', this._onTouchMove, this)
        .off('touchend', this._onMarkerDragEnd, this)
        .off('MSPointerUp', this._onMarkerDragEnd, this)
    } else {
      layer.editing.disable()
    }
  },

  _onMouseMove(e: LTypes.LeafletMouseEvent) {
    this._tooltip.updatePosition(e.latlng)
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _onMarkerDragEnd(e: any) {
    const layer = e.target
    layer.edited = true
    this._map.fire(L.Draw.Event.EDITMOVE, { layer })
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _onTouchMove(e: any) {
    const touchEvent = e.originalEvent.changedTouches[0]
    const layerPoint = this._map.mouseEventToLayerPoint(touchEvent)
    const latlng = this._map.layerPointToLatLng(layerPoint)
    e.target.setLatLng(latlng)
  },

  _hasAvailableLayers(): boolean {
    return this._featureGroup.getLayers().length !== 0
  },
})
