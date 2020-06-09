import { LayerOptions } from './layers.common';
import { MapboxViewBase } from '../../mapbox-sdk.common';
import { MapboxColor } from '../color.common';

export interface LineLayerOptions extends LayerOptions {
  lineWidth?: number;
  lineColor?: MapboxColor;
}

export abstract class MapboxLineLayer {
  protected view: MapboxViewBase;

  constructor(view: MapboxViewBase) {
    this.view = view;
  }

  abstract create(layerId: string, sourceId: string, options?: LineLayerOptions);
}
