import { MapboxView } from './../../mapbox-sdk.android';
import { MapboxLayers } from '../../common/layers/layers.common';
import { Heatmap } from './heatmap.android';
import { SymbolLayer } from './symbol.android';
import { FillLayer } from './fill.android';
import { LineLayer } from './line.android';

export class Layers extends MapboxLayers {
  constructor(mapboxView: MapboxView) {
    super(mapboxView);
    this.heatmap = new Heatmap(mapboxView);
    this.symbolLayer = new SymbolLayer(mapboxView);
    this.fillLayer = new FillLayer(mapboxView);
    this.lineLayer = new LineLayer(mapboxView);
  }
}
