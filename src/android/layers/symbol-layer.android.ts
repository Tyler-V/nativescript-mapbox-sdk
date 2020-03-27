import { MapboxSymbolLayer } from '../../common/layers/symbol-layer.common';

declare const com, java: any;
const get = com.mapbox.mapboxsdk.style.expressions.Expression.get;
const iconImage = com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconImage;
const iconAllowOverlap = com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconAllowOverlap;
const iconIgnorePlacement = com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconIgnorePlacement;
const textAllowOverlap = com.mapbox.mapboxsdk.style.layers.PropertyFactory.textAllowOverlap;
const iconSize = com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconSize;

export class SymbolLayer extends MapboxSymbolLayer {
  create(layerId: string, sourceId: string, minZoom?: number, maxZoom?: number) {
    const layer = new com.mapbox.mapboxsdk.style.layers.SymbolLayer(layerId, sourceId);
    layer.setSourceLayer(sourceId);
    if (minZoom) layer.setMinZoom(minZoom);
    if (maxZoom) layer.setMaxZoom(maxZoom);
    layer.setProperties([
      iconImage(get('TYPE')),
      iconSize(new java.lang.Float(2.0)),
      iconAllowOverlap(new java.lang.Boolean(true)),
      iconIgnorePlacement(new java.lang.Boolean(true)),
      textAllowOverlap(new java.lang.Boolean(true)),
    ]);
    return layer;
  }
}
