import { MapboxView, MGLMapViewDelegateImpl } from '../mapbox-sdk.ios';
import { MapboxStyle } from '../common/style.common';
import { MapboxViewBase } from '../mapbox-sdk.common';

export class Style extends MapboxStyle {
  constructor(mapboxView: MapboxView) {
    super(mapboxView);
  }

  getStyle() {
    return this.view.mapStyle;
  }

  getUri() {
    const uri = this.view.mapStyle.getUri();
    return uri;
  }

  setStyleUri(uri: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        let delegate: MGLMapViewDelegateImpl = <MGLMapViewDelegateImpl>this.view.mapView.delegate;
        delegate.setStyleLoadedCallback(() => {
          console.log('Mapbox:setMapStyle(): style loaded callback returned.');
          resolve();
        });
        this.view.mapView.styleURL = NSURL.URLWithString(uri);
        this.view.notify({
          eventName: MapboxViewBase.styleLoadedEvent,
          object: this.view,
        });
      } catch (ex) {
        console.log('Error in mapbox.setMapStyle: ' + ex);
        reject(ex);
      }
    });
  }

  addImage(name: string, filePath: string) {
    return Promise.reject('Error, method not implemented.');
  }

  addSource(source: any) {
    this.view.mapStyle.addSource(source);
  }

  addLayer(layer: any) {
    this.view.mapStyle.addLayer(layer);
  }
}
