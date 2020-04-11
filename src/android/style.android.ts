import { Layers } from './layers/layers.android';
import { LayerType } from '../common/style.common';
import { MapboxView } from '../mapbox-sdk.android';
import { MapboxViewBase } from '../mapbox-sdk.common';
import { MapboxStyle } from '../common/style.common';

declare const com, java: any;

export class Style extends MapboxStyle {
  constructor(mapboxView: MapboxView) {
    super(mapboxView);
    this.layers = new Layers(mapboxView);
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
      this.view.mapboxMap.setStyle(
        new com.mapbox.mapboxsdk.maps.Style.Builder().fromUri(uri),
        new com.mapbox.mapboxsdk.maps.Style.OnStyleLoaded({
          onStyleLoaded: (mapboxStyle) => {
            this.view.mapStyle = mapboxStyle;
            this.view.notify({
              eventName: MapboxViewBase.styleLoadedEvent,
              object: this.view,
            });
            resolve();
          },
        })
      );
    });
  }

  addImage(name: string, image: any) {
    this.view.mapStyle.addImage(name, image);
  }

  addImageFromPath(name: string, filePath: string) {
    this.view.mapStyle.addImage(name, this.getImage(filePath).android);
  }

  addSource(source: any) {
    this.view.mapStyle.addSource(source);
  }

  addLayer(layer: any) {
    this.view.mapStyle.addLayer(layer);
  }

  removeLayer(layer: any) {
    this.view.mapStyle.removeLayer(layer);
  }

  addVectorSource(sourceId: string, uri: string): any {
    let source = this.getSource(sourceId);
    if (source != null) {
      return source;
    }
    source = new com.mapbox.mapboxsdk.style.sources.VectorSource(sourceId, uri);
    this.addSource(source);
    return source;
  }

  getSource(sourceId: string): any {
    return this.view.mapStyle.getSource(sourceId);
  }

  removeImage(name: string) {
    this.view.mapStyle.removeImage(name);
  }
}
