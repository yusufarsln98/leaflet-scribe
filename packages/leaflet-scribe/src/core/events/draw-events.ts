import { L } from '../shared/index.js'
import type { DrawEventsMap } from '../types/index.js'

/**
 * Event name constants triggered on the Leaflet map by Leaflet Scribe (`L.Draw.Event`).
 */
export const DrawEvent: DrawEventsMap = {
  CREATED: 'draw:created',
  EDITED: 'draw:edited',
  DELETED: 'draw:deleted',
  DRAWSTART: 'draw:drawstart',
  DRAWSTOP: 'draw:drawstop',
  DRAWVERTEX: 'draw:drawvertex',
  EDITSTART: 'draw:editstart',
  EDITMOVE: 'draw:editmove',
  EDITRESIZE: 'draw:editresize',
  EDITVERTEX: 'draw:editvertex',
  EDITSTOP: 'draw:editstop',
  DELETESTART: 'draw:deletestart',
  DELETESTOP: 'draw:deletestop',
  TOOLBAROPENED: 'draw:toolbaropened',
  TOOLBARCLOSED: 'draw:toolbarclosed',
  MARKERCONTEXT: 'draw:markercontext',
}

L.Draw = L.Draw || {}
L.Draw.Event = DrawEvent

