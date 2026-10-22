import type * as LTypes from 'leaflet'
import { L, type DrawConstructorOptions } from '../../core/index.js'
import type { EditControlProps } from '../types/index.js'

export interface ResolvedLeafletContext {
  map: LTypes.Map
  layerContainer?: LTypes.LayerGroup | LTypes.FeatureGroup | undefined
}

/**
 * Instantiates a new `L.Control.Draw` from `<EditControl>` props and the active React-Leaflet context.
 */
export function createDrawElement(
  props: EditControlProps,
  context: ResolvedLeafletContext,
): LTypes.Control.Draw {
  const { layerContainer } = context
  const { draw, edit, position } = props

  const options: DrawConstructorOptions = {
    edit:
      edit === false
        ? false
        : {
            ...edit,
            featureGroup: (edit?.featureGroup || layerContainer) as LTypes.FeatureGroup,
          },
  }

  if (draw === false) {
    options.draw = false
  } else if (draw) {
    options.draw = { ...draw }
  }

  if (position) {
    options.position = position
  }

  return new L.Control.Draw(options)
}

