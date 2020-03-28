import { MapboxViewBase } from '../../mapbox-sdk.common';
import { MapboxHeatmap } from './heatmap.common';
import { MapboxSymbolLayer } from './symbol.common';

export interface LayerOptions {
  minZoom?: number;
  maxZoom?: number;
}

export abstract class MapboxLayers {
  protected view: MapboxViewBase;
  public heatmap: MapboxHeatmap;
  public symbolLayer: MapboxSymbolLayer;

  constructor(view: MapboxViewBase) {
    this.view = view;
  }
}
