import type * as L from 'leaflet'

export interface DrawEventsMap {
  readonly CREATED: 'draw:created'
  readonly EDITED: 'draw:edited'
  readonly DELETED: 'draw:deleted'
  readonly DRAWSTART: 'draw:drawstart'
  readonly DRAWSTOP: 'draw:drawstop'
  readonly DRAWVERTEX: 'draw:drawvertex'
  readonly EDITSTART: 'draw:editstart'
  readonly EDITMOVE: 'draw:editmove'
  readonly EDITRESIZE: 'draw:editresize'
  readonly EDITVERTEX: 'draw:editvertex'
  readonly EDITSTOP: 'draw:editstop'
  readonly DELETESTART: 'draw:deletestart'
  readonly DELETESTOP: 'draw:deletestop'
  readonly TOOLBAROPENED: 'draw:toolbaropened'
  readonly TOOLBARCLOSED: 'draw:toolbarclosed'
  readonly MARKERCONTEXT: 'draw:markercontext'
}

export type DrawEventName = DrawEventsMap[keyof DrawEventsMap]

export interface DrawCreatedEvent extends L.LeafletEvent {
  /**
   * Layer that was just created.
   */
  layer: L.Circle | L.CircleMarker | L.Marker | L.Polygon | L.Polyline | L.Rectangle
  /**
   * The type of layer this is. One of: polyline, polygon, rectangle, circle, marker, circlemarker.
   */
  layerType: string
}

export interface DrawEditedEvent extends L.LeafletEvent {
  /**
   * List of all layers just edited on the map.
   */
  layers: L.LayerGroup
}

export interface DrawDeletedEvent extends L.LeafletEvent {
  /**
   * List of all layers just removed from the map.
   */
  layers: L.LayerGroup
}

export interface DrawStartEvent extends L.LeafletEvent {
  /**
   * The type of layer this is. One of: polyline, polygon, rectangle, circle, marker, circlemarker.
   */
  layerType: string
}

export interface DrawStopEvent extends L.LeafletEvent {
  /**
   * The type of layer this is. One of: polyline, polygon, rectangle, circle, marker, circlemarker.
   */
  layerType: string
}

export interface DrawVertexEvent extends L.LeafletEvent {
  /**
   * List of all layers just being added from the map.
   */
  layers: L.LayerGroup
}

export interface EditStartEvent extends L.LeafletEvent {
  /**
   * The type of edit this is. One of: edit
   */
  handler: string
}

export interface EditMoveEvent extends L.LeafletEvent {
  /**
   * Layer that was just moved.
   */
  layer: L.Layer
}

export interface EditResizeEvent extends L.LeafletEvent {
  /**
   * Layer that was just resized.
   */
  layer: L.Layer
}

export interface EditVertexEvent extends L.LeafletEvent {
  /**
   * List of all layers just being edited from the map.
   */
  layers: L.LayerGroup
  poly: L.Polyline | L.Polygon
}

export interface EditStopEvent extends L.LeafletEvent {
  /**
   * The type of edit this is. One of: edit
   */
  handler: string
}

export interface DeleteStartEvent extends L.LeafletEvent {
  /**
   * The type of edit this is. One of: remove
   */
  handler: string
}

export interface DeleteStopEvent extends L.LeafletEvent {
  /**
   * The type of edit this is. One of: remove
   */
  handler: string
}

export type ToolbarOpenedEvent = L.LeafletEvent
export type ToolbarClosedEvent = L.LeafletEvent

export interface MarkerContextEvent extends L.LeafletEvent {
  marker?: L.Marker
  layers?: L.LayerGroup
  poly?: L.Polyline | L.Polygon
}

