import type * as LTypes from 'leaflet'
import { L } from '../shared/index.js'

function detectIE(): number | false {
  if (typeof window === 'undefined' || !window.navigator) {
    return false
  }
  const ua = window.navigator.userAgent

  const msie = ua.indexOf('MSIE ')
  if (msie > 0) {
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10)
  }

  const trident = ua.indexOf('Trident/')
  if (trident > 0) {
    const rv = ua.indexOf('rv:')
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10)
  }

  const edge = ua.indexOf('Edge/')
  if (edge > 0) {
    return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10)
  }

  return false
}

L.Map.mergeOptions({
  touchExtend: true,
})

/**
 * Touch event extension handler for `L.Map` (`L.Map.TouchExtend`).
 */
export const MapTouchExtend = L.Handler.extend({
  initialize(map: LTypes.Map) {
    this._map = map
    this._container = (map as unknown as { _container: HTMLElement })._container
    this._pane = (map as unknown as { _panes: { overlayPane: HTMLElement } })._panes.overlayPane
  },

  addHooks() {
    L.DomEvent.on(this._container, 'touchstart', this._onTouchStart, this)
    L.DomEvent.on(this._container, 'touchend', this._onTouchEnd, this)
    L.DomEvent.on(this._container, 'touchmove', this._onTouchMove, this)
    if (this._detectIE()) {
      L.DomEvent.on(this._container, 'MSPointerDown', this._onTouchStart, this)
      L.DomEvent.on(this._container, 'MSPointerUp', this._onTouchEnd, this)
      L.DomEvent.on(this._container, 'MSPointerMove', this._onTouchMove, this)
      L.DomEvent.on(this._container, 'MSPointerCancel', this._onTouchCancel, this)
    } else {
      L.DomEvent.on(this._container, 'touchcancel', this._onTouchCancel, this)
      L.DomEvent.on(this._container, 'touchleave', this._onTouchLeave, this)
    }
  },

  removeHooks() {
    L.DomEvent.off(this._container, 'touchstart', this._onTouchStart, this)
    L.DomEvent.off(this._container, 'touchend', this._onTouchEnd, this)
    L.DomEvent.off(this._container, 'touchmove', this._onTouchMove, this)
    if (this._detectIE()) {
      L.DomEvent.off(this._container, 'MSPointerDown', this._onTouchStart, this)
      L.DomEvent.off(this._container, 'MSPointerUp', this._onTouchEnd, this)
      L.DomEvent.off(this._container, 'MSPointerMove', this._onTouchMove, this)
      L.DomEvent.off(this._container, 'MSPointerCancel', this._onTouchCancel, this)
    } else {
      L.DomEvent.off(this._container, 'touchcancel', this._onTouchCancel, this)
      L.DomEvent.off(this._container, 'touchleave', this._onTouchLeave, this)
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _touchEvent(e: any, type: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let touchEvent: any = {}
    if (typeof e.touches !== 'undefined') {
      if (!e.touches.length) {
        return
      }
      touchEvent = e.touches[0]
    } else if (e.pointerType === 'touch') {
      touchEvent = e
      if (!this._filterClick(e)) {
        return
      }
    } else {
      return
    }

    const containerPoint = this._map.mouseEventToContainerPoint(touchEvent)
    const layerPoint = this._map.mouseEventToLayerPoint(touchEvent)
    const latlng = this._map.layerPointToLatLng(layerPoint)

    this._map.fire(type, {
      latlng,
      layerPoint,
      containerPoint,
      pageX: touchEvent.pageX,
      pageY: touchEvent.pageY,
      originalEvent: e,
    })
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _filterClick(e: any): boolean {
    const timeStamp = e.timeStamp || e.originalEvent?.timeStamp
    const elapsed = L.DomEvent._lastClick && timeStamp - L.DomEvent._lastClick

    if (
      (elapsed && elapsed > 100 && elapsed < 500) ||
      (e.target?._simulatedClick && !e._simulated)
    ) {
      L.DomEvent.stop(e)
      return false
    }
    L.DomEvent._lastClick = timeStamp
    return true
  },

  _onTouchStart(e: Event) {
    if (!this._map._loaded) {
      return
    }
    this._touchEvent(e, 'touchstart')
  },

  _onTouchEnd(e: Event) {
    if (!this._map._loaded) {
      return
    }
    this._touchEvent(e, 'touchend')
  },

  _onTouchCancel(e: Event) {
    if (!this._map._loaded) {
      return
    }
    let type = 'touchcancel'
    if (this._detectIE()) {
      type = 'pointercancel'
    }
    this._touchEvent(e, type)
  },

  _onTouchLeave(e: Event) {
    if (!this._map._loaded) {
      return
    }
    this._touchEvent(e, 'touchleave')
  },

  _onTouchMove(e: Event) {
    if (!this._map._loaded) {
      return
    }
    this._touchEvent(e, 'touchmove')
  },

  _detectIE: detectIE,
})

L.Map.TouchExtend = MapTouchExtend
L.Map.addInitHook('addHandler', 'touchExtend', L.Map.TouchExtend)

/**
 * Touch-enabled Marker subclass (`L.Marker.Touch`).
 */
export const MarkerTouch = L.Marker.extend({
  _initInteraction() {
    if (!this.addInteractiveTarget) {
      return this._initInteractionLegacy()
    }
    return L.Marker.prototype._initInteraction.apply(this)
  },

  _initInteractionLegacy() {
    if (!this.options.clickable) {
      return
    }

    const icon = this._icon
    let events = [
      'dblclick',
      'mousedown',
      'mouseover',
      'mouseout',
      'contextmenu',
      'touchstart',
      'touchend',
      'touchmove',
    ]
    if (this._detectIE) {
      events = events.concat([
        'MSPointerDown',
        'MSPointerUp',
        'MSPointerMove',
        'MSPointerCancel',
      ])
    } else {
      events = events.concat(['touchcancel'])
    }

    L.DomUtil.addClass(icon, 'leaflet-clickable')
    L.DomEvent.on(icon, 'click', this._onMouseClick, this)
    L.DomEvent.on(icon, 'keypress', this._onKeyPress, this)

    for (let i = 0; i < events.length; i++) {
      L.DomEvent.on(icon, events[i], this._fireMouseEvent, this)
    }

    if (L.Handler.MarkerDrag) {
      this.dragging = new L.Handler.MarkerDrag(this)

      if (this.options.draggable) {
        this.dragging.enable()
      }
    }
  },

  _detectIE: detectIE,
})

L.Marker.Touch = MarkerTouch

