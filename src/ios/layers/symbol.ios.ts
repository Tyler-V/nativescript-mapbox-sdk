import { MapboxSymbolLayer, SymbolLayerOptions } from '../../common/layers/symbol.common';

export class SymbolLayer extends MapboxSymbolLayer {
  create(layerId: string, sourceId: string, options?: SymbolLayerOptions) {
    const source = this.view.mapbox.style.getSource(sourceId);
    const layer = MGLSymbolStyleLayer.alloc().initWithIdentifierSource(layerId, source);
    layer.sourceLayerIdentifier = sourceId;

    if (options.minZoom) layer.minimumZoomLevel = options.minZoom;
    if (options.maxZoom) layer.maximumZoomLevel = options.maxZoom;

    if (options.iconImageKey) layer.iconImageName = NSExpression.expressionForKeyPath(options.iconImageKey);
    if (options.iconSize) layer.iconScale = NSExpression.expressionForConstantValue(options.iconSize);
    if (options.iconAllowOverlap) layer.iconAllowsOverlap = NSExpression.expressionForConstantValue(options.iconAllowOverlap);
    if (options.iconIgnorePlacement) layer.iconIgnoresPlacement = NSExpression.expressionForConstantValue(options.iconIgnorePlacement);

    return layer;
  }
}
