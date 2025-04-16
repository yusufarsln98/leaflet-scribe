[![npm version](https://badge.fury.io/js/leaflet-scribe.svg)](https://badge.fury.io/js/leaflet-scribe)
[![NPM Downloads](https://img.shields.io/npm/dt/leaflet-scribe.svg)](https://www.npmjs.com/package/leaflet-scribe)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/yusufarsln98/leaflet-scribe/refs/heads/master/MIT-LICENSE.md)

# Leaflet Scribe
Adds support for drawing and editing vectors and markers on [Leaflet maps](https://github.com/Leaflet/Leaflet).

> **Note:** Leaflet Scribe is forked from the original Leaflet drawing tool (leaflet-draw) with enhancements and improvements.

Supports [Leaflet](https://github.com/Leaflet/Leaflet/releases) 0.7.x and 1.0.0+ branches.

## In this readme

- [Customizing Language](#customizing-language-and-text-in-leaflet-scribe)
- [Common tasks](#common-tasks)
- [Contributing](#contributing)
- [Thanks](#thanks)

## Customizing language and text in Leaflet Scribe

Leaflet Scribe uses the `L.drawLocal` configuration object to set any text used in the plugin. Customizing this will allow support for changing the text or supporting another language.

E.g.

```js
    // Set the button title text for the polygon button
    L.drawLocal.draw.toolbar.buttons.polygon = 'Draw a sexy polygon!';
    
    // Set the tooltip start text for the rectangle
    L.drawLocal.draw.handlers.rectangle.tooltip.start = 'Not telling...';
```

## Common tasks

The following examples outline some common tasks.

### Example Leaflet Scribe config

The following example will show you how to:

1. Change the position of the control's toolbar.
2. Customize the styles of a vector layer.
3. Use a custom marker.
4. Disable the delete functionality.

```js
    var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png',
        cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: 18}),
        map = new L.Map('map', {layers: [cloudmade], center: new L.LatLng(-37.7772, 175.2756), zoom: 15 });
    
    var editableLayers = new L.FeatureGroup();
    map.addLayer(editableLayers);
    
    var MyCustomMarker = L.Icon.extend({
        options: {
            shadowUrl: null,
            iconAnchor: new L.Point(12, 12),
            iconSize: new L.Point(24, 24),
            iconUrl: 'link/to/image.png'
        }
    });
    
    var options = {
        position: 'topright',
        draw: {
            polyline: {
                shapeOptions: {
                    color: '#f357a1',
                    weight: 10
                }
            },
            polygon: {
                allowIntersection: false,
                drawError: {
                    color: '#e1e100',
                    message: '<strong>Oh snap!<strong> you can\'t draw that!'
                },
                shapeOptions: {
                    color: '#bada55'
                }
            },
            circle: false,
            rectangle: {
                shapeOptions: {
                    clickable: false
                }
            },
            marker: {
                icon: new MyCustomMarker()
            }
        },
        edit: {
            featureGroup: editableLayers,
            remove: false
        }
    };
    
    var drawControl = new L.Control.Draw(options);
    map.addControl(drawControl);
    
    map.on(L.Draw.Event.CREATED, function (e) {
        var type = e.layerType,
            layer = e.layer;
    
        if (type === 'marker') {
            layer.bindPopup('A popup!');
        }
    
        editableLayers.addLayer(layer);
    });
```

### Changing a drawing handlers options

You can change a draw handlers options after initialisation by using the `setDrawingOptions` method on the Leaflet Scribe control.

E.g. to change the colour of the rectangle:

```js
drawControl.setDrawingOptions({
    rectangle: {
    	shapeOptions: {
        	color: '#0000FF'
        }
    }
});
```

## Contributing
 
To test you can install the npm dependencies:

    npm install

and then use:

    jake test

## Thanks

Touch friendly version was created by Michael Guild (https://github.com/michaelguild13).
