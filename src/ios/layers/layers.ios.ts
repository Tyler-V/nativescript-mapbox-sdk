import { MapboxView } from '../../mapbox-sdk.ios';
import { MapboxLayers } from '../../common/layers/layers.common';
import { Heatmap } from './heatmap.ios';
import { SymbolLayer } from './symbol-layer.ios';

export class Layers extends MapboxLayers {
  constructor(mapboxView: MapboxView) {
    super(mapboxView);
    this.heatmap = new Heatmap(mapboxView);
    this.symbolLayer = new SymbolLayer(mapboxView);
  }
}
