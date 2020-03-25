import { MapboxView } from './../../mapbox-sdk.android';
import { MapboxLayers } from '../../common/layers/layers.common';
import { Heatmap } from './heatmap.android';

export class Layers extends MapboxLayers {
  constructor(mapboxView: MapboxView) {
    super(mapboxView);
    this.heatmap = new Heatmap(mapboxView);
  }
}
