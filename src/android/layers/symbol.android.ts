import { MapboxSymbolLayer, SymbolLayerOptions } from '../../common/layers/symbol.common';

declare const com, java: any;
const get = com.mapbox.mapboxsdk.style.expressions.Expression.get;
const iconImage = com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconImage;
const iconAllowOverlap = com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconAllowOverlap;
const iconIgnorePlacement = com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconIgnorePlacement;
const iconSize = com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconSize;

export class SymbolLayer extends MapboxSymbolLayer {
  create(layerId: string, sourceId: string, options?: SymbolLayerOptions) {
    const layer = new com.mapbox.mapboxsdk.style.layers.SymbolLayer(layerId, sourceId);
    layer.setSourceLayer(sourceId);

    if (options.minZoom) layer.setMinZoom(options.minZoom);
    if (options.maxZoom) layer.setMaxZoom(options.maxZoom);

    const properties = [];
    if (options.iconImageKey) properties.push(iconImage(get(options.iconImageKey)));
    if (options.iconSize) properties.push(iconSize(new java.lang.Float(options.iconSize)));
    if (options.iconAllowOverlap) properties.push(iconAllowOverlap(new java.lang.Boolean(options.iconAllowOverlap)));
    if (options.iconIgnorePlacement) properties.push(iconIgnorePlacement(new java.lang.Boolean(options.iconIgnorePlacement)));
    layer.setProperties(properties);

    return layer;
  }
}
