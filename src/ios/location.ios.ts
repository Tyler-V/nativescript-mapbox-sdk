import { MapboxView, MGLMapViewDelegateImpl } from "../mapbox-sdk.ios";
import { MapboxLocation, LocationOptions } from "../common/location.common";


const _getTrackingMode = (input: LocationOptions["cameraMode"]): MGLUserTrackingMode => {
    if (input === "TRACKING") {
      return MGLUserTrackingMode.Follow;
    } else if (input === "TRACKING_COMPASS") {
      return MGLUserTrackingMode.FollowWithHeading;
    } else if (input === "TRACKING_GPS") {
      return MGLUserTrackingMode.FollowWithCourse;
    } else {
      return MGLUserTrackingMode.None;
    }
};

export class Location extends MapboxLocation {
  _mapbox: any = {};

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
        if (!this.mapboxView["nativeMapView"]) {
          reject("No map has been loaded");
          return;
        }
        this.mapboxView["nativeMapView"].showsUserLocation = true;
        this.mapboxView["nativeMapView"].setUserTrackingModeAnimated(_getTrackingMode(options.cameraMode), options.animated === true);
        this.mapboxView["nativeMapView"].userTrackingMode =  1;

        resolve();
      } catch (ex) {
        console.log("Error in mapbox.trackUser: " + ex);
        reject(ex);
      }
    });
  }

  stopTracking() {}
}
