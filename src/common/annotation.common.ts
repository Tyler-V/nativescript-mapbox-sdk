import { MapboxViewBase } from '../mapbox-sdk.common';

export abstract class MapboxAnnotation {
  protected view: MapboxViewBase;

  constructor(view: MapboxViewBase) {
    this.view = view;
  }

  abstract addCircle();
}
