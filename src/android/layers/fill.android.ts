import { MapboxFillLayer, FillLayerOptions } from '../../common/layers/fill.common';
import { mapboxColorToColor } from '../../android/utils.android';

const fillColor = com.mapbox.mapboxsdk.style.layers.PropertyFactory.fillColor;
const fillOpacity = com.mapbox.mapboxsdk.style.layers.PropertyFactory.fillOpacity;
const fillAntialias = com.mapbox.mapboxsdk.style.layers.PropertyFactory.fillAntialias;
const fillOutlineColor = com.mapbox.mapboxsdk.style.layers.PropertyFactory.fillOutlineColor;

export class FillLayer extends MapboxFillLayer {
  create(layerId: string, sourceId: string, options?: FillLayerOptions) {
    const layer = new com.mapbox.mapboxsdk.style.layers.FillLayer(layerId, sourceId);
    layer.setSourceLayer(sourceId);

    if (options) {
      if (options.minZoom) layer.setMinZoom(options.minZoom);
      if (options.maxZoom) layer.setMaxZoom(options.maxZoom);
      const properties = [];
      if (options.fillColor) properties.push(fillColor(mapboxColorToColor(options.fillColor)));
      if (options.fillOpacity) properties.push(fillOpacity(new java.lang.Float(options.fillOpacity)));
      if (options.fillAntialias !== undefined) properties.push(fillAntialias(new java.lang.Boolean(options.fillAntialias)));
      if (options.fillOutlineColor) properties.push(fillOutlineColor(mapboxColorToColor(options.fillOutlineColor)));
      layer.setProperties(properties);
    }

    return layer;
  }
}
