import { MapboxLineLayer, LineLayerOptions } from '../../common/layers/line.common';
import { mapboxColorToColor } from '../utils.android';

const lineWidth = com.mapbox.mapboxsdk.style.layers.PropertyFactory.lineWidth;
const lineColor = com.mapbox.mapboxsdk.style.layers.PropertyFactory.lineColor;

export class LineLayer extends MapboxLineLayer {
  create(layerId: string, sourceId: string, options?: LineLayerOptions) {
    const layer = new com.mapbox.mapboxsdk.style.layers.LineLayer(layerId, sourceId);
    layer.setSourceLayer(sourceId);

    if (options) {
      if (options.minZoom) layer.setMinZoom(options.minZoom);
      if (options.maxZoom) layer.setMaxZoom(options.maxZoom);
      const properties = [];
      if (options.lineWidth) properties.push(lineWidth(new java.lang.Float(options.lineWidth)));
      if (options.lineColor) properties.push(lineColor(mapboxColorToColor(options.lineColor)));
      layer.setProperties(properties);
    }

    return layer;
  }
}
