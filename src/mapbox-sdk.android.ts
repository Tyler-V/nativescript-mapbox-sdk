import { MapboxViewBase } from './mapbox-sdk.common';
import { Map } from './android/map.android';
import { Offline } from './android/offline.android';
import { Style } from './android/style.android';
import { Location } from './android/location.android';
import { Annotation } from './android/annotation.android';
import * as utils from 'tns-core-modules/utils/utils';

export { TrackingMode, LocationOptions } from './common/location.common';
export { MapStyle, LayerType } from './common/style.common';

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
    if (!this.mapView && this.config.accessToken) {
      let settings = this.config;
      const context = utils.ad.getApplicationContext();
      const instance = com.mapbox.mapboxsdk.Mapbox.getInstance(context, this.config.accessToken); // com.mapbox.mapboxsdk.Mapbox

      let drawMap = () => {
        const mapboxMapOptions = this.getMapboxMapOptions();

        this.mapView = new com.mapbox.mapboxsdk.maps.MapView(this._context, mapboxMapOptions);

        this.mapView.getMapAsync(
          new com.mapbox.mapboxsdk.maps.OnMapReadyCallback({
            onMapReady: (mapboxMap) => {
              this.mapboxMap = mapboxMap;

              if (settings.mapStyle) {
                this.mapbox.style.setStyleUri(settings.mapStyle);
              }

              this.notify({
                eventName: MapboxViewBase.mapReadyEvent,
                object: this,
              });
            },
          })
        );

        this.nativeView.addView(this.mapView);
      };

      setTimeout(drawMap, settings.delay ? settings.delay : 0);
    }
  }

  private getMapboxMapOptions() {
    const mapboxMapOptions = com.mapbox.mapboxsdk.maps.MapboxMapOptions.createFromAttributes(this._context)
      .compassEnabled(!this.config.hideCompass)
      .rotateGesturesEnabled(!this.config.disableRotation)
      .scrollGesturesEnabled(!this.config.disableScroll)
      .tiltGesturesEnabled(!this.config.disableTilt)
      .zoomGesturesEnabled(!this.config.disableZoom)
      .attributionEnabled(!this.config.hideAttribution)
      .logoEnabled(!this.config.hideLogo);

    if (this.config.center && this.config.center.lat && this.config.center.lng) {
      const cameraPositionBuilder = new com.mapbox.mapboxsdk.camera.CameraPosition.Builder()
        .target(new com.mapbox.mapboxsdk.geometry.LatLng(this.config.center.lat, this.config.center.lng))
        .zoom(this.config.zoomLevel);
      mapboxMapOptions.camera(cameraPositionBuilder.build());
    }

    return mapboxMapOptions;
  }
}
