import { MapboxView } from '../mapbox-sdk.android';
import { MapboxLocation, LocationOptions } from '../common/location.common';

declare const android, com, java, org: any;

export class Location extends MapboxLocation {
  private locationComponent;
  private cameraTrackingChangedListener;

  constructor(mapboxView: MapboxView) {
    super(mapboxView);
  }

  private _getLocationComponent() {
    if (!this.locationComponent) {
      this.locationComponent = this.mapboxView.mapboxMap.getLocationComponent();
    }
    return this.locationComponent;
  }

  private _getLocationComponentOptions() {
    return com.mapbox.mapboxsdk.location.LocationComponentActivationOptions.builder(
      this.mapboxView._context,
      this.mapboxView.mapboxStyle
    )
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

  startTracking(options: LocationOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const locationComponent = this._getLocationComponent();
      locationComponent.activateLocationComponent(this._getLocationComponentOptions());
      locationComponent.setLocationComponentEnabled(true);
      locationComponent.setCameraMode(com.mapbox.mapboxsdk.location.modes.CameraMode[options.cameraMode]);
      locationComponent.setRenderMode(com.mapbox.mapboxsdk.location.modes.RenderMode[options.renderMode]);
      locationComponent.zoomWhileTracking(
        options.zoom,
        options.animationDuration ? options.animationDuration : 0,
        new com.mapbox.mapboxsdk.maps.MapboxMap.CancelableCallback({
          onCancel: () => {},
          onFinish: () => {
            locationComponent.tiltWhileTracking(options.tilt, 1000);
          }
        })
      );

      // if (options.zoom) {
      //   locationComponent.zoomWhileTracking(options.zoom, options.animationDuration ? options.animationDuration : 0);
      // }

      // if (options.tilt) {
      //   locationComponent.tiltWhileTracking(options.tilt, options.animationDuration ? options.animationDuration : 0);
      // }

      if (this.cameraTrackingChangedListener) {
        locationComponent.removeOnCameraTrackingChangedListener(this.cameraTrackingChangedListener);
      }

      if (options.onCameraTrackingChanged || options.onCameraTrackingDismissed) {
        this.cameraTrackingChangedListener = new com.mapbox.mapboxsdk.location.OnCameraTrackingChangedListener({
          onCameraTrackingChanged: (currentMode: number) => {
            if (options.onCameraTrackingChanged) {
              options.onCameraTrackingChanged(currentMode);
            }
          },
          onCameraTrackingDismissed: () => {
            if (options.onCameraTrackingDismissed) {
              options.onCameraTrackingDismissed();
            }
          }
        });
        locationComponent.addOnCameraTrackingChangedListener(this.cameraTrackingChangedListener);
      }

      resolve();
    });
  }

  stopTracking() {
    const locationComponent = this._getLocationComponent();
    if (this.cameraTrackingChangedListener) {
      locationComponent.removeOnCameraTrackingChangedListener(this.cameraTrackingChangedListener);
      this.cameraTrackingChangedListener = null;
    }
    locationComponent.setCameraMode(com.mapbox.mapboxsdk.location.modes.CameraMode.NONE);
    locationComponent.setRenderMode(com.mapbox.mapboxsdk.location.modes.RenderMode.NORMAL);
    locationComponent.setLocationComponentEnabled(false);
  }
}
