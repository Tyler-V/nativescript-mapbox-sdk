import { LayerOptions } from './layers.common';
import { MapboxViewBase } from '../../mapbox-sdk.common';

export interface SymbolLayerOptions extends LayerOptions {
  iconImageKey?: string;
  iconSize?: number;
  iconAllowOverlap?: boolean;
  iconIgnorePlacement?: boolean;
}

export abstract class MapboxSymbolLayer {
  protected view: MapboxViewBase;

  constructor(view: MapboxViewBase) {
    this.view = view;
  }

  abstract create(layerId: string, sourceId: string, options: SymbolLayerOptions);
}
