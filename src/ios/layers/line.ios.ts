import { MapboxLineLayer, LineLayerOptions } from '../../common/layers/line.common';

export class LineLayer extends MapboxLineLayer {
  create(layerId: string, sourceId: string, options?: LineLayerOptions) {
    const source = this.view.mapbox.style.getSource(sourceId);
    const layer = MGLLineStyleLayer.alloc().initWithIdentifierSource(layerId, source);
    layer.sourceLayerIdentifier = sourceId;

    if (options) {
      if (options.minZoom) layer.minimumZoomLevel = options.minZoom;
      if (options.maxZoom) layer.maximumZoomLevel = options.maxZoom;
    }

    return layer;
  }
}
