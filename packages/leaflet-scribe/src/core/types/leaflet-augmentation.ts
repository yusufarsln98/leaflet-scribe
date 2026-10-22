/* eslint-disable @typescript-eslint/no-namespace */
import type * as L from 'leaflet'
import type {
  DeleteStartEvent,
  DeleteStopEvent,
  DrawCreatedEvent,
  DrawDeletedEvent,
  DrawEditedEvent,
  DrawEventsMap,
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
} from './events.js'
import type { DrawLocal as DrawLocalType, PrecisionOptions } from './localization.js'
import type {
  CircleDrawOptions,
  CircleMarkerDrawOptions,
  ControlDrawToolbarOptions,
  ControlEditToolbarOptions,
  DeleteHandlerOptions as DeleteHandlerOptionsType,
  DrawConstructorOptions as DrawConstructorOptionsType,
  DrawErrorOptions as DrawErrorOptionsType,
  EditHandlerOptions as EditHandlerOptionsType,
  EditPolyOptions as EditPolyOptionsType,
  EditPolyVerticesEditOptions as EditPolyVerticesEditOptionsType,
  EditSimpleShapeOptions as EditSimpleShapeOptionsType,
  MarkerDrawOptions,
  PolygonDrawOptions,
  PolylineDrawOptions,
  RectangleDrawOptions,
  SimpleShapeOptions as SimpleShapeOptionsType,
  ToolbarAction,
  ToolbarModeHandler,
  TooltipLabelText,
} from './options.js'

declare module 'leaflet' {
  interface MapOptions {
    drawControl?: boolean | undefined
    drawControlTooltips?: boolean | undefined
    touchExtend?: boolean | undefined
  }

  interface PathOptions {
    clickable?: boolean | undefined
    original?: PathOptions | undefined
    editing?: PathOptions | undefined
    previousOptions?: PathOptions | undefined
    poly?: EditPolyOptionsType | undefined
    maintainColor?: boolean | undefined
  }

  interface InteractiveLayerOptions {
    editable?: boolean | undefined
    clickable?: boolean | undefined
  }

  interface Layer {
    edited?: boolean | undefined
    editing?: L.Handler | undefined
  }

  class DrawMap extends Map {
    mergeOptions(options?: MapOptions): void
    addInitHook(): void
    drawControl?: Control.Draw | undefined
    _editTooltip?: Draw.Tooltip | null | undefined
    editTooltip?: Draw.Tooltip | null | undefined
  }

  class Toolbar extends Evented {
    constructor(options?: ControlDrawToolbarOptions | ControlEditToolbarOptions)
    initialize(options?: ControlDrawToolbarOptions | ControlEditToolbarOptions): void
    enabled(): boolean
    disable(): void
    addToolbar(map: Map): HTMLElement | undefined
    removeToolbar(): void
    getModeHandlers(map: Map): ToolbarModeHandler[]
    getActions(handler: Handler): ToolbarAction[]
  }

  class DrawToolbar extends Toolbar {
    static readonly TYPE: string
    constructor(options?: ControlDrawToolbarOptions)
    getModeHandlers(map: Map): ToolbarModeHandler[]
    getActions(handler: Draw.Feature): ToolbarAction[]
    setOptions(options: ControlDrawToolbarOptions): void
  }

  class EditToolbar extends Toolbar {
    static readonly TYPE: string
    constructor(options?: ControlEditToolbarOptions)
    getModeHandlers(map: Map): ToolbarModeHandler[]
    getActions(handler: Handler): ToolbarAction[]
    setOptions(options: ControlEditToolbarOptions): void
  }

  namespace Control {
    type DrawConstructorOptions = DrawConstructorOptionsType
    type DrawOptions = ControlDrawToolbarOptions
    type EditOptions = ControlEditToolbarOptions

    class Draw extends Control {
      constructor(options?: DrawConstructorOptions)
      initialize(options?: DrawConstructorOptions): void
      setDrawingOptions(options?: ControlDrawToolbarOptions): void
      onAdd(map: Map): HTMLElement
      onRemove(): void
      _toolbars: Record<string, Toolbar>
    }
  }

  namespace DrawOptions {
    type SimpleShapeOptions = SimpleShapeOptionsType
    type PolylineOptions = PolylineDrawOptions
    type PolygonOptions = PolygonDrawOptions
    type RectangleOptions = RectangleDrawOptions
    type CircleOptions = CircleDrawOptions
    type CircleMarkerOptions = CircleMarkerDrawOptions
    type MarkerOptions = MarkerDrawOptions
    type DrawErrorOptions = DrawErrorOptionsType
  }

  export namespace Draw {
    let Event: DrawEventsMap

    interface EventHandlers {
      onCreated: typeof Event.CREATED
      onDeleted: typeof Event.DELETED
      onDeleteStart: typeof Event.DELETESTART
      onDeleteStop: typeof Event.DELETESTOP
      onDrawStart: typeof Event.DRAWSTART
      onDrawStop: typeof Event.DRAWSTOP
      onDrawVertex: typeof Event.DRAWVERTEX
      onEdited: typeof Event.EDITED
      onEditMove: typeof Event.EDITMOVE
      onEditResize: typeof Event.EDITRESIZE
      onEditStart: typeof Event.EDITSTART
      onEditStop: typeof Event.EDITSTOP
      onEditVertex: typeof Event.EDITVERTEX
      onMarkerContext: typeof Event.MARKERCONTEXT
      onToolbarClosed: typeof Event.TOOLBARCLOSED
      onToolbarOpened: typeof Event.TOOLBAROPENED
      [key: string]: string
    }

    class Feature extends Handler {
      type: string
      initialize(
        map: Map,
        options?:
          | PolylineDrawOptions
          | PolygonDrawOptions
          | RectangleDrawOptions
          | CircleDrawOptions
          | MarkerDrawOptions
          | CircleMarkerDrawOptions,
      ): void
      setOptions(
        options?:
          | PolylineDrawOptions
          | PolygonDrawOptions
          | RectangleDrawOptions
          | CircleDrawOptions
          | MarkerDrawOptions
          | CircleMarkerDrawOptions,
      ): void
    }

    class SimpleShape extends Feature {
      constructor(map: Map, options?: SimpleShapeOptionsType)
    }

    class Marker extends Feature {
      static readonly TYPE: string
      constructor(map: Map, options?: MarkerDrawOptions)
    }

    class CircleMarker extends Marker {
      static readonly TYPE: string
      constructor(map: Map, options?: CircleMarkerDrawOptions)
    }

    class Circle extends SimpleShape {
      static readonly TYPE: string
      constructor(map: Map, options?: CircleDrawOptions)
    }

    class Polyline extends Feature {
      static readonly TYPE: string
      constructor(map: Map, options?: PolylineDrawOptions)
      deleteLastVertex(): void
      addVertex(latlng: LatLng): void
      completeShape(): void
    }

    class Rectangle extends SimpleShape {
      static readonly TYPE: string
      constructor(map: Map, options?: RectangleDrawOptions)
    }

    class Polygon extends Polyline {
      static readonly TYPE: string
      constructor(map: Map, options?: PolygonDrawOptions)
    }

    class Tooltip extends Class {
      constructor(map: Map)
      dispose(): void
      updateContent(labelText?: TooltipLabelText): this
      updatePosition(latlng: LatLng): this
      showAsError(): this
      removeError(): this
    }
  }

  namespace DrawEvents {
    type Created = DrawCreatedEvent
    type Edited = DrawEditedEvent
    type Deleted = DrawDeletedEvent
    type DrawStart = DrawStartEvent
    type DrawStop = DrawStopEvent
    type DrawVertex = DrawVertexEvent
    type EditStart = EditStartEvent
    type EditMove = EditMoveEvent
    type EditResize = EditResizeEvent
    type EditVertex = EditVertexEvent
    type EditStop = EditStopEvent
    type DeleteStart = DeleteStartEvent
    type DeleteStop = DeleteStopEvent
    type ToolbarOpened = ToolbarOpenedEvent
    type ToolbarClosed = ToolbarClosedEvent
    type MarkerContext = MarkerContextEvent
  }

  namespace GeometryUtil {
    function geodesicArea(coordinates: LatLngLiteral[]): number
    function formattedNumber(n: string | number, precision?: number): string
    function readableArea(
      area: number,
      isMetric?: boolean | string | string[],
      precision?: PrecisionOptions,
    ): string
    function readableDistance(
      distance: number | string,
      isMetric?: boolean | string,
      isFeet?: boolean,
      isNauticalMile?: boolean,
      precision?: PrecisionOptions,
    ): string
    function isVersion07x(): boolean
    function getDefaultShape(poly: Polyline | Polygon | Rectangle): LatLng[]
  }

  namespace LatLngUtil {
    function cloneLatLngs(latlngs: unknown[]): unknown[]
    function cloneLatLng(latlng: LatLngLiteral): LatLng
  }

  namespace LineUtil {
    function segmentsIntersect(p: Point, p1: Point, p2: Point, p3: Point): boolean
    function _checkCounterclockwise(p: Point, p1: Point, p2: Point): boolean
  }

  interface Polyline {
    intersects(): boolean
    newLatLngIntersects(latlng: LatLng, skipFirst?: boolean): boolean
    newPointIntersects(newPoint: Point, skipFirst?: boolean): boolean
    _tooFewPointsForIntersection(extraPoints?: number): boolean
    _lineSegmentsIntersectsRange(p: Point, p1: Point, maxIndex: number, minIndex?: number): boolean
    _getProjectedPoints(): Point[]
  }

  namespace EditToolbar {
    type EditPolyOptions = EditPolyOptionsType
    type EditHandlerOptions = EditHandlerOptionsType
    type DeleteHandlerOptions = DeleteHandlerOptionsType

    class Edit extends Handler {
      static readonly TYPE: string
      type: string
      constructor(map: Map, options: EditHandlerOptionsType)
      revertLayers(): void
      save(): void
    }

    class Delete extends Handler {
      static readonly TYPE: string
      type: string
      constructor(map: Map, options: DeleteHandlerOptionsType)
      revertLayers(): void
      save(): void
      removeAllLayers(): void
    }
  }

  namespace EditOptions {
    type EditPolyVerticesEditOptions = EditPolyVerticesEditOptionsType
    type EditSimpleShapeOptions = EditSimpleShapeOptionsType
  }

  namespace Edit {
    class SimpleShape extends Handler {
      constructor(shape: Layer, options?: EditSimpleShapeOptionsType)
      updateMarkers(): void
      _move(latlng: LatLng): void
      _resize(latlng: LatLng): void
    }

    class CircleMarker extends SimpleShape {
      constructor(shape: L.CircleMarker, options?: EditSimpleShapeOptionsType)
    }

    class Circle extends CircleMarker {
      constructor(shape: L.Circle, options?: EditSimpleShapeOptionsType)
    }

    class Marker extends Handler {
      constructor(marker: L.Marker, options?: Record<string, unknown>)
    }

    class Poly extends Handler {
      constructor(poly: L.Polyline | L.Polygon)
      updateMarkers(): void
    }

    class Polyline extends Poly {}

    class PolyVerticesEdit extends Handler {
      constructor(
        poly: L.Polyline | L.Polygon,
        latlngs: LatLngExpression[],
        options?: EditPolyVerticesEditOptionsType,
      )
      updateMarkers(): void
    }

    class Rectangle extends SimpleShape {
      constructor(shape: L.Rectangle, options?: EditSimpleShapeOptionsType)
    }
  }

  namespace Map {
    class TouchExtend extends Handler {
      constructor(map: L.Map)
    }
  }

  namespace Marker {
    class Touch extends L.Marker {
      constructor(latlng: LatLngExpression, options?: MarkerOptions)
    }
  }

  namespace Localization {
    type DrawLocal = DrawLocalType
  }

  let drawVersion: string
  let drawLocal: DrawLocalType
  let toolbar: Control.Draw | undefined
}
