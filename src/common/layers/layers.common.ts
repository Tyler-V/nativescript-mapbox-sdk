import { MapboxViewBase } from '../../mapbox-sdk.common';
import { MapboxHeatmap } from './heatmap.common';

export abstract class MapboxLayers {
  protected view: MapboxViewBase;
  public heatmap: MapboxHeatmap;

  constructor(view: MapboxViewBase) {
    this.view = view;
  }
}
