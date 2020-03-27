import { Layers } from './layers/layers.ios';
import { MapboxView, MGLMapViewDelegateImpl } from '../mapbox-sdk.ios';
import { MapboxStyle, LayerType } from '../common/style.common';
import { MapboxViewBase } from '../mapbox-sdk.common';

export class Style extends MapboxStyle {
  mapView: MGLMapView;

  constructor(mapboxView: MapboxView) {
    super(mapboxView);
    this.mapView = this.mapView;
    this.layers = new Layers(mapboxView);
  }

  getStyle() {
    return this.mapView.style;
  }

  getUri() {
    return null; // TODO
  }

  setStyleUri(uri: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.mapView.styleURL = NSURL.URLWithString(uri);
      let delegate: MGLMapViewDelegateImpl = <MGLMapViewDelegateImpl>this.mapView.delegate;
      delegate.setStyleLoadedCallback((mapView, style) => {
        console.log('setStyleUri():mapViewDidFinishLoadingStyle');
        this.view.notify({
          eventName: MapboxViewBase.styleLoadedEvent,
          object: this.view,
        });
        resolve();
      });
    });
  }

  addImage(name: string, filePath: string) {
    this.mapView.style.setImageForName(this.getImage(filePath).ios, name);
  }

  addSource(source: any) {
    this.mapView.style.addSource(source);
  }

  addLayer(layer: any) {
    this.mapView.style.addLayer(layer);
  }

  removeLayer(layer: any) {
    this.mapView.style.removeLayer(layer);
  }

  addVectorSource(sourceId: string, uri: string): any {
    let source = this.getSource(sourceId);
    if (source != null) {
      return source;
    }
    source = MGLVectorTileSource.alloc().initWithIdentifierConfigurationURL(sourceId, NSURL.URLWithString(uri));
    this.addSource(source);
    return source;
  }

  getSource(sourceId: string) {
    return this.mapView.style.sourceWithIdentifier(sourceId);
  }
}
