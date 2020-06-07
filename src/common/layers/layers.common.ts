import { MapboxViewBase } from '../../mapbox-sdk.common';
import { MapboxHeatmap } from './heatmap.common';
import { MapboxSymbolLayer } from './symbol.common';
import { MapboxFillLayer } from './fill.common';

export interface LayerOptions {
  minZoom?: number;
  maxZoom?: number;
}

export abstract class MapboxLayers {
  protected view: MapboxViewBase;
  public heatmap: MapboxHeatmap;
  public symbolLayer: MapboxSymbolLayer;
  public fillLayer: MapboxFillLayer;

  constructor(view: MapboxViewBase) {
    this.view = view;
  }
}
