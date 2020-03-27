import { MapboxSymbolLayer } from '../../common/layers/symbol-layer.common';

export class SymbolLayer extends MapboxSymbolLayer {
  create(layerId: string, sourceId: string, minZoom?: number, maxZoom?: number) {
    const source = this.view.mapbox.style.getSource(sourceId);
    const layer = MGLSymbolStyleLayer.alloc().initWithIdentifierSource(layerId, source);
    layer.sourceLayerIdentifier = sourceId;
    if (minZoom) layer.minimumZoomLevel = minZoom;
    if (maxZoom) layer.maximumZoomLevel = maxZoom;
    layer.iconImageName = NSExpression.expressionForKeyPath('TYPE');
    layer.iconScale = NSExpression.expressionForConstantValue(2.0);
    layer.iconAllowsOverlap = NSExpression.expressionForConstantValue(true);
    layer.iconIgnoresPlacement = NSExpression.expressionForConstantValue(true);
    return layer;
  }
}
