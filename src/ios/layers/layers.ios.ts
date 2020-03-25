import { MapboxView } from '../../mapbox-sdk.ios';
import { MapboxLayers } from '../../common/layers/layers.common';
import { Heatmap } from './heatmap.ios';

export class Layers extends MapboxLayers {
  constructor(mapboxView: MapboxView) {
    super(mapboxView);
    this.heatmap = new Heatmap(mapboxView);
  }
}
