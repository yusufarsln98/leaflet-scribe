'use client'

import { useEffect, useRef } from 'react'
import { useLeafletContext } from '@react-leaflet/core'
import type * as LTypes from 'leaflet'
import { L, type DrawCreatedEvent } from '../../core/index.js'
import {
  EDIT_CONTROL_EVENTS,
  type EditControlEventProp,
  type EditControlProps,
} from '../types/index.js'
import { createDrawElement, deepEqual } from '../utils/index.js'

/**
 * React-Leaflet component that mounts and synchronizes a `L.Control.Draw`
 * toolbar with its parent `<FeatureGroup>`.
 */
export function EditControl(props: EditControlProps): null {
  const leafletContext = useLeafletContext()
  const map = (props.leaflet?.map || leafletContext.map) as LTypes.Map
  const layerContainer = (props.leaflet?.layerContainer ||
    leafletContext.layerContainer) as LTypes.FeatureGroup | undefined

  const drawRef = useRef<LTypes.Control.Draw | null>(null)
  const propsRef = useRef<EditControlProps>(props)
  const latestPropsRef = useRef<EditControlProps>(props)
  latestPropsRef.current = props

  useEffect(() => {
    const onDrawCreate = (e: LTypes.LeafletEvent) => {
      const createdEvent = e as DrawCreatedEvent
      const container = layerContainer || map
      container.addLayer(createdEvent.layer)
      latestPropsRef.current.onCreated?.(createdEvent)
    }

    const boundListeners: Array<{
      eventName: string
      listener: LTypes.LeafletEventHandlerFn
    }> = []

    const eventKeys = Object.keys(EDIT_CONTROL_EVENTS) as EditControlEventProp[]
    for (const key of eventKeys) {
      const eventName = EDIT_CONTROL_EVENTS[key]
      const listener: LTypes.LeafletEventHandlerFn = (evt) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handler = latestPropsRef.current[key] as ((e: any) => void) | undefined
        handler?.(evt)
      }
      map.on(eventName, listener)
      boundListeners.push({ eventName, listener })
    }

    map.on(L.Draw.Event.CREATED, onDrawCreate)

    const control = createDrawElement(latestPropsRef.current, { map, layerContainer })
    drawRef.current = control
    propsRef.current = latestPropsRef.current
    map.addControl(control)
    latestPropsRef.current.onMounted?.(control)

    return () => {
      map.off(L.Draw.Event.CREATED, onDrawCreate)

      for (const { eventName, listener } of boundListeners) {
        map.off(eventName, listener)
      }

      if (drawRef.current) {
        drawRef.current.remove()
        drawRef.current = null
      }
    }
  }, [map, layerContainer])

  useEffect(() => {
    if (
      deepEqual(props.draw, propsRef.current.draw) &&
      deepEqual(props.edit, propsRef.current.edit) &&
      props.position === propsRef.current.position
    ) {
      return
    }

    if (drawRef.current) {
      drawRef.current.remove()
    }

    const nextControl = createDrawElement(props, { map, layerContainer })
    drawRef.current = nextControl
    propsRef.current = props
    nextControl.addTo(map)

    props.onMounted?.(nextControl)
  }, [props, map, layerContainer])

  return null
}

export default EditControl

