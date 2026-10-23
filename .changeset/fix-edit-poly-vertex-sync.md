---
'leaflet-scribe': patch
---

Fix `L.Edit.Poly` and `L.Edit.PolyVerticesEdit` vertex/middle-marker index synchronization, refresh edit handlers when `setLatLngs` is called on a polyline/polygon, and ensure `_markerGroup` is removed from the map when a layer is removed while editing is enabled.
