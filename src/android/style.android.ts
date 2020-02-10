import { MapboxView } from '../mapbox-sdk.android';
import { MapboxViewBase } from '../mapbox-sdk.common';
import { MapboxStyle } from '../common/style.common';

declare const android, com, java, org: any;

export class Style extends MapboxStyle {
  constructor(mapboxView: MapboxView) {
    super(mapboxView);
  }

  getStyle() {
    return this.mapboxView.mapboxStyle;
  }

  getUri() {
    const uri = this.mapboxView.mapboxStyle.getUri();
    return uri;
  }

  setStyleUri(uri: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.mapboxView.mapboxMap.setStyle(
        new com.mapbox.mapboxsdk.maps.Style.Builder().fromUri(uri),
        new com.mapbox.mapboxsdk.maps.Style.OnStyleLoaded({
          onStyleLoaded: (mapboxStyle) => {
            this.mapboxView.mapboxStyle = mapboxStyle;
            this.mapboxView.notify({
              eventName: MapboxViewBase.styleLoadedEvent,
              object: this.mapboxView,
            });
            resolve();
          },
        })
      );
    });
  }

  addImage(name: string, filePath: string) {
    this.mapboxView.mapboxStyle.addImage(name, this.getImage(filePath).android);
  }

  addSource(source: any) {
    this.mapboxView.mapboxStyle.addSource(source);
  }

  addLayer(layer: any) {
    this.mapboxView.mapboxStyle.addLayer(layer);
  }
}
