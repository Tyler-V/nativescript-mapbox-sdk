import { MapboxView, MGLMapViewDelegateImpl } from '../mapbox-sdk.ios';
import { MapboxLocation, LocationOptions } from '../common/location.common';

const _getTrackingMode = (input: LocationOptions['cameraMode']): MGLUserTrackingMode => {
  if (input === 'TRACKING') {
    return MGLUserTrackingMode.Follow;
  } else if (input === 'TRACKING_COMPASS') {
    return MGLUserTrackingMode.FollowWithHeading;
  } else if (input === 'TRACKING_GPS') {
    return MGLUserTrackingMode.FollowWithCourse;
  } else {
    return MGLUserTrackingMode.None;
  }
};

const _stringToCameraMode = (mode: LocationOptions['cameraMode']): any => {
  switch (mode) {
    case 'NONE':
      console.log('NONE');
      return 0;

    case 'TRACKING_COMPASS':
      console.log('TRACKING_COMPASS');
      return 1;

    case 'TRACKING_GPS':
      console.log('TRACKING_GPS');
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
      let camera = this.view.mapView.camera;
      const durationMs = options.animationDuration ? options.animationDuration : 5000;

      try {
        if (!this.view.mapView) {
          reject('No map has been loaded');
          return;
        }
        this.view.mapView.showsUserLocation = true;
        this.view.mapView.userTrackingMode = _stringToCameraMode(options.cameraMode);
        camera.pitch = options.tilt;

        this.view.mapView.setCameraWithDurationAnimationTimingFunction(
          camera,
          durationMs / 1000,
          CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseInEaseOut)
        );
        this.view.mapView.setZoomLevelAnimated(options.zoom, true);

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
