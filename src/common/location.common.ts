import { MapboxViewBase } from '../mapbox-sdk.common';

export enum TrackingMode {
  NORMAL,
  COMPASS,
  GPS,
}

export interface LocationOptions {
  mode?: TrackingMode;
  animated?: boolean;
}

export abstract class MapboxLocation {
  protected view: MapboxViewBase;

  constructor(view: MapboxViewBase) {
    this.view = view;
  }

  abstract startTracking(options?: LocationOptions): Promise<void>;
  abstract stopTracking();
}
