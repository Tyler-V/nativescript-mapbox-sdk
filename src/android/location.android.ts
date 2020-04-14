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
      this.locationComponent.activateLocationComponent(this._getLocationComponentOptions());
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

  private _getRenderMode(mode: TrackingMode) {
    switch (mode) {
      case TrackingMode.COMPASS:
        return com.mapbox.mapboxsdk.location.modes.RenderMode.COMPASS;
      case TrackingMode.GPS:
        return com.mapbox.mapboxsdk.location.modes.RenderMode.GPS;
      default:
        return com.mapbox.mapboxsdk.location.modes.RenderMode.NORMAL;
    }
  }

  private _getCameraMode(mode: TrackingMode, animated: boolean) {
    switch (mode) {
      case TrackingMode.COMPASS:
        if (animated) {
          return com.mapbox.mapboxsdk.location.modes.CameraMode.TRACKING_COMPASS;
        } else {
          return com.mapbox.mapboxsdk.location.modes.CameraMode.NONE_COMPASS;
        }
      case TrackingMode.GPS:
        if (animated) {
          return com.mapbox.mapboxsdk.location.modes.CameraMode.TRACKING_GPS;
        } else {
          return com.mapbox.mapboxsdk.location.modes.CameraMode.NONE_GPS;
        }
      default:
        if (animated) {
          return com.mapbox.mapboxsdk.location.modes.CameraMode.TRACKING;
        } else {
          return com.mapbox.mapboxsdk.location.modes.CameraMode.NONE;
        }
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
      locationComponent.setLocationComponentEnabled(true);
      locationComponent.setRenderMode(this._getRenderMode(options.mode));
      locationComponent.setCameraMode(
        this._getCameraMode(options.mode, options.animated),
        new com.mapbox.mapboxsdk.location.OnLocationCameraTransitionListener({
          onLocationCameraTransitionCanceled: (currentMode: number) => {},
          onLocationCameraTransitionFinished: (currentMode: number) => {
            if (options.animated) {
              locationComponent.zoomWhileTracking(
                15,
                1000,
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
    // locationComponent.setLocationComponentEnabled(false);
  }
}
