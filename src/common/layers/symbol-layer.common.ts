import { MapboxViewBase } from '../../mapbox-sdk.common';

export abstract class MapboxSymbolLayer {
  protected view: MapboxViewBase;

  constructor(view: MapboxViewBase) {
    this.view = view;
  }

  abstract create(layerId: string, sourceId: string, minZoom?: number, maxZoom?: number);
}
