import type * as LTypes from 'leaflet'
import { beforeEach, describe, expect, it } from 'vitest'
import { L, VERSION } from '../index.js'

describe('L.Control.Draw', () => {
  let map: LTypes.Map
  let control: LTypes.Control.Draw
  let container: HTMLElement | undefined

  beforeEach(() => {
    map = L.map(document.createElement('div')).setView([0, 0], 15)
    control = new L.Control.Draw({})
    map.addControl(control)
    container = control.getContainer()
  })

  it('renders the draw toolbar container onto the map', () => {
    expect(container).toBeDefined()
    expect(container?.innerHTML).toBeTruthy()
    expect(container?.querySelectorAll('.leaflet-draw-toolbar a').length).toBeGreaterThan(0)
  })

  it('exposes L.drawVersion matching VERSION', () => {
    expect(L.drawVersion).toBe(VERSION)
  })

  it('updates handler options via setDrawingOptions', () => {
    control.setDrawingOptions({
      rectangle: {
        shapeOptions: {
          color: '#0000ff',
        },
      },
    })

    const drawToolbar = control._toolbars[L.DrawToolbar.TYPE] as unknown as {
      _modes: Record<string, { handler: { options: { shapeOptions: { color: string } } } }>
    }
    expect(drawToolbar._modes.rectangle.handler.options.shapeOptions.color).toBe('#0000ff')
  })

  it('automatically adds drawControl when map option drawControl is true', () => {
    const autoMap = L.map(document.createElement('div'), {
      drawControl: true,
    }).setView([0, 0], 15) as LTypes.DrawMap

    expect(autoMap.drawControl).toBeInstanceOf(L.Control.Draw)
  })
})

