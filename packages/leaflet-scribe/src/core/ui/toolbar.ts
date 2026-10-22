import type * as LTypes from 'leaflet'
import { L } from '../shared/index.js'

/**
 * Base toolbar class used by `L.DrawToolbar` and `L.EditToolbar` (`L.Toolbar`).
 */
export const Toolbar = L.Class.extend({
  initialize(options?: Record<string, unknown>) {
    L.setOptions(this, options)

    this._modes = {}
    this._actionButtons = []
    this._activeMode = null

    const version = L.version.split('.')
    if (parseInt(version[0], 10) === 1 && parseInt(version[1], 10) >= 2) {
      L.Toolbar.include(L.Evented.prototype)
    } else {
      L.Toolbar.include(L.Mixin.Events)
    }
  },

  enabled(): boolean {
    return this._activeMode !== null
  },

  disable() {
    if (!this.enabled()) {
      return
    }

    this._activeMode.handler.disable()
  },

  addToolbar(map: LTypes.Map): HTMLElement | undefined {
    const container = L.DomUtil.create('div', 'leaflet-draw-section')
    let buttonIndex = 0
    const buttonClassPrefix = this._toolbarClass || ''
    const modeHandlers = this.getModeHandlers(map)

    this._toolbarContainer = L.DomUtil.create('div', 'leaflet-draw-toolbar leaflet-bar')
    this._map = map

    for (let i = 0; i < modeHandlers.length; i++) {
      if (modeHandlers[i].enabled) {
        this._initModeHandler(
          modeHandlers[i].handler,
          this._toolbarContainer,
          buttonIndex++,
          buttonClassPrefix,
          modeHandlers[i].title,
        )
      }
    }

    if (!buttonIndex) {
      return
    }

    this._lastButtonIndex = --buttonIndex

    this._actionsContainer = L.DomUtil.create('ul', 'leaflet-draw-actions')

    container.appendChild(this._toolbarContainer)
    container.appendChild(this._actionsContainer)

    return container
  },

  removeToolbar() {
    for (const handlerId in this._modes) {
      if (Object.prototype.hasOwnProperty.call(this._modes, handlerId)) {
        this._disposeButton(
          this._modes[handlerId].button,
          this._modes[handlerId].handler.enable,
          this._modes[handlerId].handler,
        )

        this._modes[handlerId].handler.disable()

        this._modes[handlerId].handler
          .off('enabled', this._handlerActivated, this)
          .off('disabled', this._handlerDeactivated, this)
      }
    }
    this._modes = {}

    for (let i = 0, l = this._actionButtons.length; i < l; i++) {
      this._disposeButton(
        this._actionButtons[i].button,
        this._actionButtons[i].callback,
        this,
      )
    }
    this._actionButtons = []
    this._actionsContainer = null
  },

  _initModeHandler(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: any,
    container: HTMLElement,
    buttonIndex: number,
    classNamePrefix: string,
    buttonTitle: string,
  ) {
    const type = handler.type

    this._modes[type] = {}
    this._modes[type].handler = handler

    this._modes[type].button = this._createButton({
      type,
      title: buttonTitle,
      className: classNamePrefix + '-' + type,
      container,
      callback: this._modes[type].handler.enable,
      context: this._modes[type].handler,
    })

    this._modes[type].buttonIndex = buttonIndex

    this._modes[type].handler
      .on('enabled', this._handlerActivated, this)
      .on('disabled', this._handlerDeactivated, this)
  },

  _detectIOS(): boolean {
    if (typeof navigator === 'undefined' || typeof window === 'undefined') {
      return false
    }
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream
    )
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _createButton(options: any): HTMLAnchorElement {
    const link = L.DomUtil.create(
      'a',
      options.className || '',
      options.container,
    ) as HTMLAnchorElement
    const sr = L.DomUtil.create('span', 'sr-only', options.container)

    link.href = '#'
    link.appendChild(sr)

    if (options.title) {
      link.title = options.title
      sr.innerHTML = options.title
    }

    if (options.text) {
      link.innerHTML = options.text
      sr.innerHTML = options.text
    }

    const buttonEvent = this._detectIOS() ? 'touchstart' : 'click'

    L.DomEvent.on(link, 'click', L.DomEvent.stopPropagation)
      .on(link, 'mousedown', L.DomEvent.stopPropagation)
      .on(link, 'dblclick', L.DomEvent.stopPropagation)
      .on(link, 'touchstart', L.DomEvent.stopPropagation)
      .on(link, 'click', L.DomEvent.preventDefault)
      .on(link, buttonEvent, options.callback, options.context)

    return link
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _disposeButton(button: HTMLElement, callback: any) {
    const buttonEvent = this._detectIOS() ? 'touchstart' : 'click'

    L.DomEvent.off(button, 'click', L.DomEvent.stopPropagation)
      .off(button, 'mousedown', L.DomEvent.stopPropagation)
      .off(button, 'dblclick', L.DomEvent.stopPropagation)
      .off(button, 'touchstart', L.DomEvent.stopPropagation)
      .off(button, 'click', L.DomEvent.preventDefault)
      .off(button, buttonEvent, callback)
  },

  _handlerActivated(e: { handler: string }) {
    this.disable()

    this._activeMode = this._modes[e.handler]

    L.DomUtil.addClass(this._activeMode.button, 'leaflet-draw-toolbar-button-enabled')

    this._showActionsToolbar()

    this.fire('enable')
  },

  _handlerDeactivated() {
    this._hideActionsToolbar()

    L.DomUtil.removeClass(this._activeMode.button, 'leaflet-draw-toolbar-button-enabled')

    this._activeMode = null

    this.fire('disable')
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _createActions(handler: any) {
    const container = this._actionsContainer
    const buttons = this.getActions(handler)
    const l = buttons.length

    for (let di = 0, dl = this._actionButtons.length; di < dl; di++) {
      this._disposeButton(this._actionButtons[di].button, this._actionButtons[di].callback)
    }
    this._actionButtons = []

    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }

    for (let i = 0; i < l; i++) {
      if ('enabled' in buttons[i] && !buttons[i].enabled) {
        continue
      }

      const li = L.DomUtil.create('li', '', container)

      const button = this._createButton({
        title: buttons[i].title,
        text: buttons[i].text,
        container: li,
        callback: buttons[i].callback,
        context: buttons[i].context,
      })

      this._actionButtons.push({
        button,
        callback: buttons[i].callback,
      })
    }
  },

  _showActionsToolbar() {
    const buttonIndex = this._activeMode.buttonIndex
    const lastButtonIndex = this._lastButtonIndex
    const toolbarPosition = this._activeMode.button.offsetTop - 1

    this._createActions(this._activeMode.handler)

    this._actionsContainer.style.top = toolbarPosition + 'px'

    if (buttonIndex === 0) {
      L.DomUtil.addClass(this._toolbarContainer, 'leaflet-draw-toolbar-notop')
      L.DomUtil.addClass(this._actionsContainer, 'leaflet-draw-actions-top')
    }

    if (buttonIndex === lastButtonIndex) {
      L.DomUtil.addClass(this._toolbarContainer, 'leaflet-draw-toolbar-nobottom')
      L.DomUtil.addClass(this._actionsContainer, 'leaflet-draw-actions-bottom')
    }

    this._actionsContainer.style.display = 'block'
    this._map.fire(L.Draw.Event.TOOLBAROPENED)
  },

  _hideActionsToolbar() {
    this._actionsContainer.style.display = 'none'

    L.DomUtil.removeClass(this._toolbarContainer, 'leaflet-draw-toolbar-notop')
    L.DomUtil.removeClass(this._toolbarContainer, 'leaflet-draw-toolbar-nobottom')
    L.DomUtil.removeClass(this._actionsContainer, 'leaflet-draw-actions-top')
    L.DomUtil.removeClass(this._actionsContainer, 'leaflet-draw-actions-bottom')
    this._map.fire(L.Draw.Event.TOOLBARCLOSED)
  },
})

L.Toolbar = Toolbar

