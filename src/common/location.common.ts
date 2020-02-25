import { MapboxViewBase } from '../mapbox-sdk.common';

export enum CameraMode {
  NONE = 'NONE',
  NONE_COMPASS = 'NONE_COMPASS',
  NONE_GPS = 'NONE_GPS',
  TRACKING = 'TRACKING',
  TRACKING_COMPASS = 'TRACKING_COMPASS',
  TRACKING_GPS = 'TRACKING_GPS',
  TRACKING_GPS_NORTH = 'TRACKING_GPS_NORTH',
}

export enum RenderMode {
  COMPASS = 'COMPASS',
  GPS = 'GPS',
  NORMAL = 'NORMAL',
}

export interface LocationOptions {
  cameraMode: CameraMode;
  renderMode: RenderMode;
  zoom?: number;
  tilt?: number;
  animationDuration?: number;
  onCameraTrackingChanged?: (currentMode: number) => void;
  onCameraTrackingDismissed?: () => void;
}

export abstract class MapboxLocation {
  protected mapboxView: MapboxViewBase;

  constructor(mapboxView: MapboxViewBase) {
    this.mapboxView = mapboxView;
  }

  abstract startTracking(options: LocationOptions): Promise<void>;
  abstract stopTracking();
}
