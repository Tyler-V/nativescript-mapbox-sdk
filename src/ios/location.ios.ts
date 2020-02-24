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

  private _getLocationComponent() {
    debugger;
    if (!this.locationComponent) {
      const theMap: MGLMapView = this.mapboxView["nativeMapView"];
      const loc: MGLUserLocation = theMap.userLocation;
      this.locationComponent = loc;
    }
    return this.locationComponent;
  }

  private _getLocationComponentOptions() {
    return new Promise((resolve, reject) => {
      try {
        const theMap: MGLMapView = this.mapboxView["nativeMapView"] ||  this._mapbox;
        const loc: MGLUserLocation = theMap.userLocation;
        let delegate: MGLMapViewDelegateImpl = <MGLMapViewDelegateImpl>theMap.delegate ;
        if (loc === null) {
          reject("Location not available");
        } else {
          resolve({
            location: {
              lat: loc.coordinate.latitude,
              lng: loc.coordinate.longitude
            },
            speed: loc.location ? loc.location.speed : 0
          });
          // let camera = new MGLMapCamera(location);
          // theMap.setCameraAnimated(camera, true);
        }
        return theMap.userLocation;
    } catch (ex) {
      console.log("Error in mapbox.getUserLocation: " + ex);
      reject(ex);
    }
  });
}

  startTracking(options: LocationOptions): Promise<void> {
    debugger;
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
