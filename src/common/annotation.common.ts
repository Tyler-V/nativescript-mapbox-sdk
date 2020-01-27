import { MapboxViewBase } from '../mapbox-sdk.common';

export abstract class MapboxAnnotation {
  protected mapboxView: MapboxViewBase;

  constructor(mapboxView: MapboxViewBase) {
    this.mapboxView = mapboxView;
  }

  abstract addCircle();
}
