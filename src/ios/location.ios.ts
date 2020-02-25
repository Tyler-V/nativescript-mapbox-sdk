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

  private _getLocationComponent() { }

  private _getLocationComponentOptions() { }

  startTracking(options: LocationOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      let camera = this.mapboxView.mapboxView.camera;
      camera.pitch = options.tilt;
      const durationMs = options.animationDuration ? options.animationDuration : 5000;

      try {
        if (!this.mapboxView.mapboxView) {
          reject('No map has been loaded');
          return;
        }
        this.mapboxView.mapboxView.showsUserLocation = true;
        this.mapboxView.mapboxView.setUserTrackingModeAnimated(_getTrackingMode(options.cameraMode), true);
        this.mapboxView.mapboxView.userTrackingMode = _stringToCameraMode(options.cameraMode);

        this.mapboxView.mapboxView.setCameraWithDurationAnimationTimingFunction(
          camera,
          durationMs / 1000,
          CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseInEaseOut)
        );

        resolve();
      } catch (ex) {
        console.log('Error in mapbox.trackUser: ' + ex);
        reject(ex);
      }
    });
  }

  stopTracking() {
    this.mapboxView.mapboxView.camera.pitch = 0;
    this.mapboxView.mapboxView.camera.heading = 180;
    this.mapboxView.mapboxView.userTrackingMode = 0;
  }
}
