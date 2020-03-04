import { MapboxView, MGLMapViewDelegateImpl } from '../mapbox-sdk.ios';
import { MapboxLocation, LocationOptions } from '../common/location.common';

const _stringToCameraMode = (mode: LocationOptions['cameraMode']): any => {
  switch (mode) {
    case 'NONE':
      return 0;

    case 'NONE_COMPASS':
      return 0;

    case 'NONE_GPS':
      return 0;

    case 'TRACKING':
      return 1;

    case 'TRACKING_COMPASS':
      return 2;

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
        let camera = this.view.mapView.camera;
        const durationMs = options.animationDuration ? options.animationDuration : 5000;

        this.view.mapView.showsUserLocation = true;
        this.view.mapView.userTrackingMode = _stringToCameraMode(options.cameraMode);

        camera.pitch = options.tilt;

        this.view.mapView.setCameraWithDurationAnimationTimingFunction(
          camera,
          durationMs / 1000,
          CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseInEaseOut)
        );

        // Need to set the camera back to the mapView object.
        this.view.mapView.camera = camera;
        this.view.mapView.setZoomLevelAnimated(options.zoom, false);

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
