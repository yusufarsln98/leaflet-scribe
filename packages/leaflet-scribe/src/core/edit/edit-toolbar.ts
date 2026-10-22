import type * as LTypes from 'leaflet'
import { L } from '../shared/index.js'
import { Toolbar } from '../ui/toolbar.js'
import { EditToolbarDelete, EditToolbarEdit } from './handlers/index.js'

/**
 * Toolbar for editing and deleting layers in a FeatureGroup (`L.EditToolbar`).
 */
export const EditToolbar = Toolbar.extend({
  statics: {
    TYPE: 'edit',
  },

  options: {
    edit: {
      selectedPathOptions: {
        dashArray: '10, 10',
        fill: true,
        fillColor: '#fe57a1',
        fillOpacity: 0.1,
        maintainColor: false,
      },
    },
    remove: {},
    poly: null,
    featureGroup: null,
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialize(options: Record<string, any>) {
    const mergedOptions = options || {}
    if (mergedOptions.edit) {
      if (typeof mergedOptions.edit.selectedPathOptions === 'undefined') {
        mergedOptions.edit.selectedPathOptions = this.options.edit.selectedPathOptions
      }
      mergedOptions.edit.selectedPathOptions = L.extend(
        {},
        this.options.edit.selectedPathOptions,
        mergedOptions.edit.selectedPathOptions,
      )
    }

    if (mergedOptions.remove) {
      mergedOptions.remove = L.extend({}, this.options.remove, mergedOptions.remove)
    }

    if (mergedOptions.poly) {
      mergedOptions.poly = L.extend({}, this.options.poly, mergedOptions.poly)
    }

    this._toolbarClass = 'leaflet-draw-edit'
    Toolbar.prototype.initialize.call(this, mergedOptions)

    this._selectedFeatureCount = 0
  },

  getModeHandlers(map: LTypes.Map) {
    const featureGroup = this.options.featureGroup
    return [
      {
        enabled: this.options.edit,
        handler: new L.EditToolbar.Edit(map, {
          featureGroup,
          selectedPathOptions: this.options.edit.selectedPathOptions,
          poly: this.options.poly,
        }),
        title: L.drawLocal.edit.toolbar.buttons.edit,
      },
      {
        enabled: this.options.remove,
        handler: new L.EditToolbar.Delete(map, {
          featureGroup,
        }),
        title: L.drawLocal.edit.toolbar.buttons.remove,
      },
    ]
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getActions(handler: any) {
    const actions = [
      {
        title: L.drawLocal.edit.toolbar.actions.save.title,
        text: L.drawLocal.edit.toolbar.actions.save.text,
        callback: this._save,
        context: this,
      },
      {
        title: L.drawLocal.edit.toolbar.actions.cancel.title,
        text: L.drawLocal.edit.toolbar.actions.cancel.text,
        callback: this.disable,
        context: this,
      },
    ]

    if (handler.removeAllLayers) {
      actions.push({
        title: L.drawLocal.edit.toolbar.actions.clearAll.title,
        text: L.drawLocal.edit.toolbar.actions.clearAll.text,
        callback: this._clearAllLayers,
        context: this,
      })
    }

    return actions
  },

  addToolbar(map: LTypes.Map): HTMLElement | undefined {
    const container = Toolbar.prototype.addToolbar.call(this, map)

    this._checkDisabled()

    this.options.featureGroup.on('layeradd layerremove', this._checkDisabled, this)

    return container
  },

  removeToolbar() {
    this.options.featureGroup.off('layeradd layerremove', this._checkDisabled, this)

    Toolbar.prototype.removeToolbar.call(this)
  },

  disable() {
    if (!this.enabled()) {
      return
    }

    this._activeMode.handler.revertLayers()

    Toolbar.prototype.disable.call(this)
  },

  _save() {
    this._activeMode.handler.save()
    if (this._activeMode) {
      this._activeMode.handler.disable()
    }
  },

  _clearAllLayers() {
    this._activeMode.handler.removeAllLayers()
    if (this._activeMode) {
      this._activeMode.handler.disable()
    }
  },

  _checkDisabled() {
    const featureGroup = this.options.featureGroup
    const hasLayers = featureGroup.getLayers().length !== 0
    let button: HTMLElement

    if (this.options.edit) {
      button = this._modes[L.EditToolbar.Edit.TYPE].button

      if (hasLayers) {
        L.DomUtil.removeClass(button, 'leaflet-disabled')
      } else {
        L.DomUtil.addClass(button, 'leaflet-disabled')
      }

      button.setAttribute(
        'title',
        hasLayers
          ? L.drawLocal.edit.toolbar.buttons.edit
          : L.drawLocal.edit.toolbar.buttons.editDisabled,
      )
    }

    if (this.options.remove) {
      button = this._modes[L.EditToolbar.Delete.TYPE].button

      if (hasLayers) {
        L.DomUtil.removeClass(button, 'leaflet-disabled')
      } else {
        L.DomUtil.addClass(button, 'leaflet-disabled')
      }

      button.setAttribute(
        'title',
        hasLayers
          ? L.drawLocal.edit.toolbar.buttons.remove
          : L.drawLocal.edit.toolbar.buttons.removeDisabled,
      )
    }
  },
})

EditToolbar.Edit = EditToolbarEdit
EditToolbar.Delete = EditToolbarDelete

L.EditToolbar = EditToolbar

