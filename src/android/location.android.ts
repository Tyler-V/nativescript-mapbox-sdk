import { MapboxView } from '../mapbox-sdk.android';
import { MapboxLocation, LocationOptions, TrackingMode } from '../common/location.common';

declare const android, com, java, org: any;

export class Location extends MapboxLocation {
  private locationComponent;

  constructor(mapboxView: MapboxView) {
    super(mapboxView);
  }

  private _getLocationComponent() {
    if (!this.locationComponent) {
      this.locationComponent = this.view.mapboxMap.getLocationComponent();
    }
    return this.locationComponent;
  }

  private _getLocationComponentOptions() {
    return com.mapbox.mapboxsdk.location.LocationComponentActivationOptions.builder(this.view._context, this.view.mapStyle)
      .useDefaultLocationEngine(true)
      .locationEngineRequest(
        new com.mapbox.android.core.location.LocationEngineRequest.Builder(750)
          .setFastestInterval(750)
          .setMaxWaitTime(750 * 5)
          .setPriority(com.mapbox.android.core.location.LocationEngineRequest.PRIORITY_HIGH_ACCURACY)
          .build()
      )
      .build();
  }

  _getRenderMode(mode: TrackingMode) {
    switch (mode) {
      case TrackingMode.COMPASS:
        return com.mapbox.mapboxsdk.location.modes.RenderMode.COMPASS;
      case TrackingMode.GPS:
        return com.mapbox.mapboxsdk.location.modes.RenderMode.GPS;
      default:
        return com.mapbox.mapboxsdk.location.modes.RenderMode.NORMAL;
    }
  }

  _getCameraMode(mode: TrackingMode) {
    switch (mode) {
      case TrackingMode.COMPASS:
        return com.mapbox.mapboxsdk.location.modes.CameraMode.TRACKING_COMPASS;
      case TrackingMode.GPS:
        return com.mapbox.mapboxsdk.location.modes.CameraMode.TRACKING_GPS;
      default:
        return com.mapbox.mapboxsdk.location.modes.RenderMode.TRACKING;
    }
  }

  startTracking(options: LocationOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!options) {
        options = {
          mode: TrackingMode.NORMAL,
          animated: false,
        };
      }
      const locationComponent = this._getLocationComponent();
      locationComponent.activateLocationComponent(this._getLocationComponentOptions());
      locationComponent.setLocationComponentEnabled(true);
      locationComponent.setRenderMode(this._getRenderMode(options.mode));
      locationComponent.setCameraMode(
        this._getCameraMode(options.mode),
        new com.mapbox.mapboxsdk.location.OnLocationCameraTransitionListener({
          onLocationCameraTransitionCanceled: (currentMode: number) => {},
          onLocationCameraTransitionFinished: (currentMode: number) => {
            if (options.animated) {
              locationComponent.zoomWhileTracking(
                16,
                2000,
                new com.mapbox.mapboxsdk.maps.MapboxMap.CancelableCallback({
                  onCancel: () => {},
                  onFinish: () => {
                    resolve();
                  },
                })
              );
            } else {
              resolve();
            }
          },
        })
      );
    });
  }

  stopTracking() {
    const locationComponent = this._getLocationComponent();
    locationComponent.setCameraMode(com.mapbox.mapboxsdk.location.modes.CameraMode.NONE);
    locationComponent.setRenderMode(com.mapbox.mapboxsdk.location.modes.RenderMode.NORMAL);
    locationComponent.setLocationComponentEnabled(false);
  }
}
