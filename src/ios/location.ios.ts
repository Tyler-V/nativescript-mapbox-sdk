import { MapboxView, MGLMapViewDelegateImpl } from '../mapbox-sdk.ios';
import { MapboxLocation, LocationOptions } from '../common/location.common';
import { CameraPosition } from './../common/map.common';

const _stringToCameraMode = (mode: LocationOptions['cameraMode']): any => {
  switch (mode) {
    case 'NONE':
      return 0;
    case 'TRACKING':
      return 1;
    case 'NONE_COMPASS':
      return 2;
    case 'TRACKING_COMPASS':
      return 2;
    case 'NONE_GPS':
      return 3;
    case 'TRACKING_GPS':
      return 3;
    case 'TRACKING_GPS_NORTH':
      return 3;
  }
};

export class Location extends MapboxLocation {
  private locationComponent;
  private cameraTrackingChangedListener;

  constructor(mapboxView: MapboxView) {
    super(mapboxView);
  }

  private _getLocationComponent() {}

  private _getLocationComponentOptions() {}

  startTracking(options: LocationOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.view.mapView.userTrackingMode = _stringToCameraMode(options.cameraMode);
        resolve();
      } catch (ex) {
        console.log('Error in mapbox.trackUser: ' + ex);
        reject(ex);
      }
    });
  }

  stopTracking() {
    this.view.mapView.userTrackingMode = MGLUserTrackingMode.None;
  }
}
