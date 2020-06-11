import { LayerOptions } from './layers.common';
import { MapboxViewBase } from '../../mapbox-sdk.common';
import { MapboxColor } from '../color.common';

export interface FillLayerOptions extends LayerOptions {
  fillColor?: MapboxColor;
  fillOpacity?: number;
  fillAntialias?: boolean;
  fillOutlineColor?: MapboxColor;
}

export abstract class MapboxFillLayer {
  protected view: MapboxViewBase;

  constructor(view: MapboxViewBase) {
    this.view = view;
  }

  abstract create(layerId: string, sourceId: string, options?: FillLayerOptions);
}
