import { MapboxViewBase } from '../../mapbox-sdk.common';
import { MapboxColor } from '../color.common';
import { LayerOptions } from './layers.common';

export interface HeatmapLayerOptions extends LayerOptions {}

export abstract class MapboxHeatmap {
  protected view: MapboxViewBase;

  constructor(view: MapboxViewBase) {
    this.view = view;
  }

  abstract create(layerId: string, sourceId: string, options: HeatmapLayerOptions);
  abstract setHeatmapColor(layer: any, stops: (number | MapboxColor)[][]): void;
  abstract setHeatmapIntensity(layer: any, stops: number[][]): void;
  abstract setHeatmapRadius(layer: any, stops: number[][]): void;
  abstract setHeatmapOpacity(layer: any, stops: number[][]): void;
  abstract setHeatmapWeight(layer: any, stops: number[][]): void;
}
