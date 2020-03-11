import { MapboxView } from '../mapbox-sdk.ios';
import { MapboxLocation, LocationOptions, TrackingMode } from '../common/location.common';

export class Location extends MapboxLocation {
  constructor(mapboxView: MapboxView) {
    super(mapboxView);
  }

  _getUserTrackingMode(mode: TrackingMode) {
    switch (mode) {
      case TrackingMode.COMPASS:
        return MGLUserTrackingMode.FollowWithHeading;
      case TrackingMode.GPS:
        return MGLUserTrackingMode.FollowWithCourse;
      default:
        return MGLUserTrackingMode.Follow;
    }
  }

  startTracking(options: LocationOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      this.view.mapView.userTrackingMode = this._getUserTrackingMode(options.mode);
      this.view.mapView.setUserTrackingModeAnimatedCompletionHandler(this._getUserTrackingMode(options.mode), options.animated, () => {
        resolve();
      });
    });
  }

  stopTracking() {
    this.view.mapView.userTrackingMode = MGLUserTrackingMode.None;
  }
}
