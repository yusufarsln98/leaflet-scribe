import type * as LTypes from 'leaflet'
import { L } from '../../shared/index.js'

/**
 * Toolbar mode handler for deleting layers from a FeatureGroup (`L.EditToolbar.Delete`).
 */
export const EditToolbarDelete = L.Handler.extend({
  statics: {
    TYPE: 'remove',
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialize(map: LTypes.Map, options: Record<string, any>) {
    L.Handler.prototype.initialize.call(this, map)

    L.Util.setOptions(this, options)

    this._deletableLayers = this.options.featureGroup

    if (!(this._deletableLayers instanceof L.FeatureGroup)) {
      throw new Error('options.featureGroup must be a L.FeatureGroup')
    }

    this.type = EditToolbarDelete.TYPE

    const version = L.version.split('.')
    if (parseInt(version[0], 10) === 1 && parseInt(version[1], 10) >= 2) {
      EditToolbarDelete.include(L.Evented.prototype)
    } else {
      EditToolbarDelete.include(L.Mixin.Events)
    }
  },

  enable() {
    if (this._enabled || !this._hasAvailableLayers()) {
      return
    }
    this.fire('enabled', { handler: this.type })

    this._map.fire(L.Draw.Event.DELETESTART, { handler: this.type })

    L.Handler.prototype.enable.call(this)

    this._deletableLayers
      .on('layeradd', this._enableLayerDelete, this)
      .on('layerremove', this._disableLayerDelete, this)
  },

  disable() {
    if (!this._enabled) {
      return
    }

    this._deletableLayers
      .off('layeradd', this._enableLayerDelete, this)
      .off('layerremove', this._disableLayerDelete, this)

    L.Handler.prototype.disable.call(this)

    this._map.fire(L.Draw.Event.DELETESTOP, { handler: this.type })

    this.fire('disabled', { handler: this.type })
  },

  addHooks() {
    const map = this._map

    if (map) {
      map.getContainer().focus()

      this._deletableLayers.eachLayer(this._enableLayerDelete, this)
      this._deletedLayers = new L.LayerGroup()

      this._tooltip = new L.Draw.Tooltip(this._map)
      this._tooltip.updateContent({ text: L.drawLocal.edit.handlers.remove.tooltip.text })

      this._map.on('mousemove', this._onMouseMove, this)
    }
  },

  removeHooks() {
    if (this._map) {
      this._deletableLayers.eachLayer(this._disableLayerDelete, this)
      this._deletedLayers = null

      this._tooltip.dispose()
      this._tooltip = null

      this._map.off('mousemove', this._onMouseMove, this)
    }
  },

  revertLayers() {
    this._deletedLayers.eachLayer((layer: LTypes.Layer) => {
      this._deletableLayers.addLayer(layer)
      layer.fire('revert-deleted', { layer })
    }, this)
  },

  save() {
    this._map.fire(L.Draw.Event.DELETED, { layers: this._deletedLayers })
  },

  removeAllLayers() {
    this._deletableLayers.eachLayer((layer: LTypes.Layer) => {
      this._removeLayer({ layer })
    }, this)
    this.save()
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _enableLayerDelete(e: any) {
    const layer = e.layer || e.target || e

    layer.on('click', this._removeLayer, this)
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _disableLayerDelete(e: any) {
    const layer = e.layer || e.target || e

    layer.off('click', this._removeLayer, this)

    this._deletedLayers.removeLayer(layer)
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _removeLayer(e: any) {
    const layer = e.layer || e.target || e

    this._deletableLayers.removeLayer(layer)

    this._deletedLayers.addLayer(layer)

    layer.fire('deleted')
  },

  _onMouseMove(e: LTypes.LeafletMouseEvent) {
    this._tooltip.updatePosition(e.latlng)
  },

  _hasAvailableLayers(): boolean {
    return this._deletableLayers.getLayers().length !== 0
  },
})

