import type * as LTypes from 'leaflet'
import { beforeEach, describe, expect, it } from 'vitest'
import { L } from '../index.js'

describe('L.Edit', () => {
  let map: LTypes.Map

  beforeEach(() => {
    map = new L.Map(document.createElement('div')).setView([0, 0], 15)
  })

  describe('L.Edit.Marker', () => {
    let marker: LTypes.Marker

    beforeEach(() => {
      marker = new L.Marker(new L.LatLng(1, 2)).addTo(map)
      marker.editing?.enable()
    })

    it('has the leaflet-edit-marker-selected class applied when enabled', () => {
      const editingClass = 'leaflet-edit-marker-selected'
      const icon = (marker as unknown as { _icon: HTMLElement })._icon

      expect(marker.editing?.enabled()).toBe(true)
      expect(L.DomUtil.hasClass(icon, editingClass)).toBe(true)
    })

    it('lacks the leaflet-edit-marker-selected class when disabled', () => {
      const editingClass = 'leaflet-edit-marker-selected'
      const icon = (marker as unknown as { _icon: HTMLElement })._icon

      marker.editing?.disable()

      expect(marker.editing?.enabled()).toBe(false)
      expect(L.DomUtil.hasClass(icon, editingClass)).toBe(false)
    })
  })

  describe('L.Edit.CircleMarker', () => {
    let circleMarker: LTypes.CircleMarker

    beforeEach(() => {
      circleMarker = new L.CircleMarker(new L.LatLng(1, 2), {}).addTo(map)
      circleMarker.editing?.enable()
    })

    it('moves the circlemarker to the correct latlng', () => {
      const newLatLng = new L.LatLng(3, 5)
      ;(circleMarker.editing as LTypes.Edit.CircleMarker)._move(newLatLng)

      expect(circleMarker.getLatLng()).toEqual(newLatLng)
    })
  })

  describe('L.Edit.Circle', () => {
    let circle: LTypes.Circle

    beforeEach(() => {
      circle = new L.Circle(new L.LatLng(1, 2), 5).addTo(map)
      circle.editing?.enable()
    })

    it('moves the circle to the correct latlng', () => {
      const newLatLng = new L.LatLng(3, 5)
      ;(circle.editing as LTypes.Edit.Circle)._move(newLatLng)

      expect(circle.getLatLng()).toEqual(newLatLng)
    })
  })

  describe('L.Edit.Poly', () => {
    let edit: LTypes.EditToolbar.Edit
    let drawnItems: LTypes.FeatureGroup
    let poly: LTypes.Polyline

    beforeEach(() => {
      drawnItems = new L.FeatureGroup().addTo(map)
      edit = new L.EditToolbar.Edit(map, {
        featureGroup: drawnItems,
        poly: {
          allowIntersection: false,
        },
        selectedPathOptions: L.EditToolbar.prototype.options.edit.selectedPathOptions,
      })
      poly = new L.Polyline([L.latLng(41, -87), L.latLng(42, -88)])
    })

    it('changes the style of the polyline during editing mode', () => {
      const originalOptions = L.extend({}, poly.options)

      drawnItems.addLayer(poly)
      edit.enable()

      expect(poly.editing?.enabled()).toBe(true)
      expect(poly.options).not.toEqual(originalOptions)
    })

    it('reverts to original styles when editing is toggled', () => {
      const originalOptions = L.extend(
        { maintainColor: false, poly: { allowIntersection: false } },
        poly.options,
      )

      drawnItems.addLayer(poly)
      edit.enable()
      edit.disable()

      expect(poly.options).toEqual(originalOptions)
    })

    it('sets allowIntersection to false when configured', () => {
      drawnItems.addLayer(poly)
      edit.enable()

      expect(poly.editing?.enabled()).toBe(true)
      expect(poly.options.poly?.allowIntersection).toBe(false)
    })
  })

  describe('L.EditToolbar.Delete', () => {
    let drawnItems: LTypes.FeatureGroup
    let marker: LTypes.Marker
    let circle: LTypes.Circle
    let poly: LTypes.Polyline
    let deleteToolbar: LTypes.EditToolbar.Delete

    beforeEach(() => {
      drawnItems = new L.FeatureGroup().addTo(map)
      deleteToolbar = new L.EditToolbar.Delete(map, {
        featureGroup: drawnItems,
      })
      marker = new L.Marker(new L.LatLng(1, 2))
      circle = new L.Circle(new L.LatLng(1, 2), 5)
      poly = new L.Polyline([L.latLng(41, -87), L.latLng(42, -88)])
      drawnItems.addLayer(marker).addLayer(circle).addLayer(poly)
    })

    it('starts with 3 features on the draw layer', () => {
      expect(drawnItems.getLayers().length).toBe(3)
    })

    it('clears all features when removeAllLayers is called', () => {
      deleteToolbar.enable()
      deleteToolbar.removeAllLayers()
      deleteToolbar.disable()
      expect(drawnItems.getLayers().length).toBe(0)
    })

    it('fires DELETESTART, DELETED, and DELETESTOP events on the map', () => {
      const events: string[] = []
      map.on(L.Draw.Event.DELETESTART, (event: LTypes.LeafletEvent) => {
        events.push(event.type)
      })
      map.on(L.Draw.Event.DELETED, (event: LTypes.LeafletEvent) => {
        events.push(event.type)
      })
      map.on(L.Draw.Event.DELETESTOP, (event: LTypes.LeafletEvent) => {
        events.push(event.type)
      })

      deleteToolbar.enable()
      deleteToolbar.removeAllLayers()
      deleteToolbar.disable()

      expect(events).toEqual([
        L.Draw.Event.DELETESTART,
        L.Draw.Event.DELETED,
        L.Draw.Event.DELETESTOP,
      ])
    })
  })
})

