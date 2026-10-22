import type * as L from 'leaflet'
import type {
  ControlDrawToolbarOptions,
  ControlEditToolbarOptions,
  DeleteStartEvent,
  DeleteStopEvent,
  DrawCreatedEvent,
  DrawDeletedEvent,
  DrawEditedEvent,
  DrawStartEvent,
  DrawStopEvent,
  DrawVertexEvent,
  EditMoveEvent,
  EditResizeEvent,
  EditStartEvent,
  EditStopEvent,
  EditVertexEvent,
  MarkerContextEvent,
  ToolbarClosedEvent,
  ToolbarOpenedEvent,
} from '../../core/index.js'

/**
 * Mapping of `<EditControl>` event callback props to Leaflet Draw event names.
 */
export const EDIT_CONTROL_EVENTS = {
  onEdited: 'draw:edited',
  onDrawStart: 'draw:drawstart',
  onDrawStop: 'draw:drawstop',
  onDrawVertex: 'draw:drawvertex',
  onEditStart: 'draw:editstart',
  onEditMove: 'draw:editmove',
  onEditResize: 'draw:editresize',
  onEditVertex: 'draw:editvertex',
  onEditStop: 'draw:editstop',
  onDeleted: 'draw:deleted',
  onDeleteStart: 'draw:deletestart',
  onDeleteStop: 'draw:deletestop',
  onToolbarOpened: 'draw:toolbaropened',
  onToolbarClosed: 'draw:toolbarclosed',
  onMarkerContext: 'draw:markercontext',
} as const

export type EditControlEventProp = keyof typeof EDIT_CONTROL_EVENTS

export interface EditControlLeafletContextOverride {
  map?: L.Map | undefined
  layerContainer?: L.FeatureGroup | L.LayerGroup | undefined
}

export interface EditControlProps {
  /**
   * Control position on the Leaflet map.
   * @default 'topleft'
   */
  position?: L.ControlPosition | undefined

  /**
   * Drawing toolbar configuration options.
   */
  draw?: ControlDrawToolbarOptions | false | undefined

  /**
   * Editing toolbar configuration options (`featureGroup` is automatically wired from the parent `<FeatureGroup>` unless overridden).
   */
  edit?:
    | (Omit<ControlEditToolbarOptions, 'featureGroup'> & {
        featureGroup?: L.FeatureGroup | undefined
      })
    | false
    | undefined

  /**
   * Fired when a new vector or marker layer is created (`draw:created`).
   */
  onCreated?: ((e: DrawCreatedEvent) => void) | undefined

  /**
   * Fired when layers in the FeatureGroup have been edited and saved (`draw:edited`).
   */
  onEdited?: ((e: DrawEditedEvent) => void) | undefined

  /**
   * Fired when layers have been removed and saved (`draw:deleted`).
   */
  onDeleted?: ((e: DrawDeletedEvent) => void) | undefined

  /**
   * Fired when the `L.Control.Draw` instance is mounted onto the map.
   */
  onMounted?: ((control: L.Control.Draw) => void) | undefined

  /**
   * Fired when the user starts drawing a shape (`draw:drawstart`).
   */
  onDrawStart?: ((e: DrawStartEvent) => void) | undefined

  /**
   * Fired when the user finishes or cancels drawing (`draw:drawstop`).
   */
  onDrawStop?: ((e: DrawStopEvent) => void) | undefined

  /**
   * Fired when a vertex is created on a polyline or polygon (`draw:drawvertex`).
   */
  onDrawVertex?: ((e: DrawVertexEvent) => void) | undefined

  /**
   * Fired when the user enters edit mode (`draw:editstart`).
   */
  onEditStart?: ((e: EditStartEvent) => void) | undefined

  /**
   * Fired when a shape or marker is moved (`draw:editmove`).
   */
  onEditMove?: ((e: EditMoveEvent) => void) | undefined

  /**
   * Fired when a shape is resized (`draw:editresize`).
   */
  onEditResize?: ((e: EditResizeEvent) => void) | undefined

  /**
   * Fired when a polyline/polygon vertex is edited (`draw:editvertex`).
   */
  onEditVertex?: ((e: EditVertexEvent) => void) | undefined

  /**
   * Fired when the user exits edit mode (`draw:editstop`).
   */
  onEditStop?: ((e: EditStopEvent) => void) | undefined

  /**
   * Fired when the user enters delete mode (`draw:deletestart`).
   */
  onDeleteStart?: ((e: DeleteStartEvent) => void) | undefined

  /**
   * Fired when the user exits delete mode (`draw:deletestop`).
   */
  onDeleteStop?: ((e: DeleteStopEvent) => void) | undefined

  /**
   * Fired when a draw/edit actions toolbar is opened (`draw:toolbaropened`).
   */
  onToolbarOpened?: ((e: ToolbarOpenedEvent) => void) | undefined

  /**
   * Fired when a draw/edit actions toolbar is closed (`draw:toolbarclosed`).
   */
  onToolbarClosed?: ((e: ToolbarClosedEvent) => void) | undefined

  /**
   * Fired when a vertex marker is right-clicked (`draw:markercontext`).
   */
  onMarkerContext?: ((e: MarkerContextEvent) => void) | undefined

  /**
   * Optional explicit Leaflet context override (defaults to `useLeafletContext()` from `@react-leaflet/core`).
   */
  leaflet?: EditControlLeafletContextOverride | undefined
}
