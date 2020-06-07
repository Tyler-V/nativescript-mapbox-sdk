import { MapboxFillLayer, FillLayerOptions } from '../../common/layers/fill.common';

export class FillLayer extends MapboxFillLayer {
  create(layerId: string, sourceId: string, options?: FillLayerOptions) {
    const source = this.view.mapbox.style.getSource(sourceId);
    const layer = MGLSymbolStyleLayer.alloc().initWithIdentifierSource(layerId, source);
    layer.sourceLayerIdentifier = sourceId;

    if (options) {
      if (options.minZoom) layer.minimumZoomLevel = options.minZoom;
      if (options.maxZoom) layer.maximumZoomLevel = options.maxZoom;
    }

    return layer;
  }
}
