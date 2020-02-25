import { MapboxView, MGLMapViewDelegateImpl } from "../mapbox-sdk.ios";
import { MapboxStyle } from "../common/style.common";
import { MapboxViewBase } from '../mapbox-sdk.common';

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
    let that = this;
    return new Promise((resolve, reject) => {
      try {

      let delegate: MGLMapViewDelegateImpl = <MGLMapViewDelegateImpl>this.mapboxView.nativeMapView.delegate ;

      delegate.setStyleLoadedCallback( () => {
        console.log( "Mapbox:setMapStyle(): style loaded callback returned." );

        resolve();
      });
      this.mapboxView.nativeMapView.styleURL = NSURL.URLWithString(uri);
      // that.mapboxView.mapboxStyle = NSURL.URLWithString(uri).absoluteString;
      this.mapboxView.notify({
        eventName: MapboxViewBase.styleLoadedEvent,
        object: this.mapboxView
    });

      } catch (ex) {
        console.log("Error in mapbox.setMapStyle: " + ex);
        reject(ex);
      }
    });
  }

  addSource(source: any) {
    this.mapboxView.mapboxStyle.addSource(source);
  }

  addLayer(layer: any) {
    this.mapboxView.mapboxStyle.addLayer(layer);
  }
}
