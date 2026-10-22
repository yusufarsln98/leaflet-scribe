import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EditControl, L } from '../index.js'

let mockMap: L.Map
let mockFeatureGroup: L.FeatureGroup

vi.mock('@react-leaflet/core', () => ({
  useLeafletContext: () => ({
    map: mockMap,
    layerContainer: mockFeatureGroup,
  }),
}))

describe('<EditControl />', () => {
  beforeEach(() => {
    const container = document.createElement('div')
    mockMap = new L.Map(container).setView([51.505, -0.09], 13)
    mockFeatureGroup = new L.FeatureGroup().addTo(mockMap)
  })

  it('mounts L.Control.Draw onto the map and invokes onMounted', () => {
    const onMounted = vi.fn()

    const { unmount } = render(
      <EditControl
        position="topright"
        onMounted={onMounted}
        draw={{ rectangle: false }}
      />,
    )

    expect(onMounted).toHaveBeenCalledTimes(1)
    const controlInstance = onMounted.mock.calls[0][0]
    expect(controlInstance).toBeInstanceOf(L.Control.Draw)
    expect(mockMap.getContainer().querySelector('.leaflet-draw')).not.toBeNull()

    unmount()
    expect(mockMap.getContainer().querySelector('.leaflet-draw')).toBeNull()
  })

  it('adds created layers to the FeatureGroup and triggers onCreated', () => {
    const onCreated = vi.fn()

    render(<EditControl position="topleft" onCreated={onCreated} />)

    const marker = new L.Marker([51.505, -0.09])
    mockMap.fire(L.Draw.Event.CREATED, {
      layer: marker,
      layerType: 'marker',
    })

    expect(mockFeatureGroup.hasLayer(marker)).toBe(true)
    expect(onCreated).toHaveBeenCalledTimes(1)
    expect(onCreated.mock.calls[0][0].layer).toBe(marker)
    expect(onCreated.mock.calls[0][0].layerType).toBe('marker')
  })

  it('forwards draw and edit lifecycle events to callback props', () => {
    const onEdited = vi.fn()
    const onDeleted = vi.fn()
    const onDrawStart = vi.fn()
    const onEditStart = vi.fn()
    const onDeleteStart = vi.fn()

    render(
      <EditControl
        position="topleft"
        onEdited={onEdited}
        onDeleted={onDeleted}
        onDrawStart={onDrawStart}
        onEditStart={onEditStart}
        onDeleteStart={onDeleteStart}
      />,
    )

    const layers = new L.LayerGroup()
    mockMap.fire(L.Draw.Event.EDITED, { layers })
    mockMap.fire(L.Draw.Event.DELETED, { layers })
    mockMap.fire(L.Draw.Event.DRAWSTART, { layerType: 'polygon' })
    mockMap.fire(L.Draw.Event.EDITSTART, { handler: 'edit' })
    mockMap.fire(L.Draw.Event.DELETESTART, { handler: 'remove' })

    expect(onEdited).toHaveBeenCalledTimes(1)
    expect(onDeleted).toHaveBeenCalledTimes(1)
    expect(onDrawStart).toHaveBeenCalledTimes(1)
    expect(onEditStart).toHaveBeenCalledTimes(1)
    expect(onDeleteStart).toHaveBeenCalledTimes(1)
  })

  it('does not remount the control when only callback references change, and recreates when draw/position options change', () => {
    const onMounted = vi.fn()

    const { rerender } = render(
      <EditControl
        position="topleft"
        onMounted={onMounted}
        onCreated={() => {}}
        draw={{ circle: false }}
      />,
    )

    expect(onMounted).toHaveBeenCalledTimes(1)

    // Rerender with identical draw/edit/position but new inline callback
    rerender(
      <EditControl
        position="topleft"
        onMounted={onMounted}
        onCreated={() => {}}
        draw={{ circle: false }}
      />,
    )
    expect(onMounted).toHaveBeenCalledTimes(1)

    // Rerender with updated position
    rerender(
      <EditControl
        position="bottomright"
        onMounted={onMounted}
        onCreated={() => {}}
        draw={{ circle: false }}
      />,
    )
    expect(onMounted).toHaveBeenCalledTimes(2)
  })
})

