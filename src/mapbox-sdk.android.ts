import { MapboxViewBase } from './mapbox-sdk.common';

import { Map } from './android/map.android';
import { Offline } from './android/offline.android';
import { Style } from './android/style.android';
import { Location } from './android/location.android';
import { Annotation } from './android/annotation.android';

export { CameraMode, RenderMode, LocationOptions } from './common/location.common';
export { MapStyle } from './common/style.common';

import * as utils from "tns-core-modules/utils/utils";

declare const android, com, java, org: any;

export class MapboxView extends MapboxViewBase {
  constructor() {
    super();
    this.mapbox.map = new Map(this);
    this.mapbox.style = new Style(this);
    this.mapbox.offline = new Offline(this);
    this.mapbox.location = new Location(this);
    this.mapbox.annotation = new Annotation(this);
  }

  public createNativeView(): Object {
    let nativeView = new android.widget.FrameLayout(this._context);

    setTimeout(() => {
      this.initMap();
    });

    return nativeView;
  }

  disposeNativeView(): void {}

  initMap(): void {
    if (!this.mapboxView && this.config.accessToken) {
      let settings = this.config;
      const context = utils.ad.getApplicationContext();
      const instance = com.mapbox.mapboxsdk.Mapbox.getInstance(context, this.config.accessToken);

      let drawMap = () => {
        const mapboxMapOptions = com.mapbox.mapboxsdk.maps.MapboxMapOptions.createFromAttributes(this._context)
          .compassEnabled(!settings.hideCompass)
          .rotateGesturesEnabled(!settings.disableRotation)
          .scrollGesturesEnabled(!settings.disableScroll)
          .tiltGesturesEnabled(!settings.disableTilt)
          .zoomGesturesEnabled(!settings.disableZoom)
          .attributionEnabled(!settings.hideAttribution)
          .logoEnabled(!settings.hideLogo);

        if (settings.center && settings.center.lat && settings.center.lng) {
          const cameraPositionBuilder = new com.mapbox.mapboxsdk.camera.CameraPosition.Builder()
            .target(new com.mapbox.mapboxsdk.geometry.LatLng(settings.center.lat, settings.center.lng))
            .zoom(settings.zoomLevel);
          mapboxMapOptions.camera(cameraPositionBuilder.build());
        }

        this.mapboxView = new com.mapbox.mapboxsdk.maps.MapView(this._context, mapboxMapOptions);

        this.mapboxView.getMapAsync(
          new com.mapbox.mapboxsdk.maps.OnMapReadyCallback({
            onMapReady: mapboxMap => {
              this.mapboxMap = mapboxMap;

              if (settings.mapStyle) {
                this.mapbox.style.setStyleUri(settings.mapStyle);
              }

              this.notify({
                eventName: MapboxViewBase.mapReadyEvent,
                object: this
              });
            }
          })
        );

        this.nativeView.addView(this.mapboxView);
      };

      setTimeout(drawMap, settings.delay ? settings.delay : 0);
    }
  }
}

const _getMapboxMapOptions = (settings, context?) => {
  const mapboxMapOptions = com.mapbox.mapboxsdk.maps.MapboxMapOptions.createFromAttributes(context)
    .compassEnabled(!settings.hideCompass)
    .rotateGesturesEnabled(!settings.disableRotation)
    .scrollGesturesEnabled(!settings.disableScroll)
    .tiltGesturesEnabled(!settings.disableTilt)
    .zoomGesturesEnabled(!settings.disableZoom)
    .attributionEnabled(!settings.hideAttribution)
    .logoEnabled(!settings.hideLogo);

  if (settings.center && settings.center.lat && settings.center.lng) {
    const cameraPositionBuilder = new com.mapbox.mapboxsdk.camera.CameraPosition.Builder()
      .target(new com.mapbox.mapboxsdk.geometry.LatLng(settings.center.lat, settings.center.lng))
      .zoom(settings.zoomLevel);
    mapboxMapOptions.camera(cameraPositionBuilder.build());
  }

  return mapboxMapOptions;
};
