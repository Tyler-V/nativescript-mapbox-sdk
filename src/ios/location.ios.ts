import { MapboxView } from "../mapbox-sdk.ios";
import { MapboxLocation, LocationOptions } from "../common/location.common";

export class Location extends MapboxLocation {
  private locationComponent;
  private cameraTrackingChangedListener;

  constructor(mapboxView: MapboxView) {
    super(mapboxView);
  }

  private _getLocationComponent() {}

  private _getLocationComponentOptions() {}

  startTracking(options: LocationOptions): Promise<void> {
    return null;
  }

  stopTracking() {}
}
