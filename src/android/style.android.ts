import { Layers } from './layers/layers.android';
import { LayerType } from '../common/style.common';
import { MapboxView } from '../mapbox-sdk.android';
import { MapboxViewBase } from '../mapbox-sdk.common';
import { MapboxStyle } from '../common/style.common';

export class Style extends MapboxStyle {
  constructor(mapboxView: MapboxView) {
    super(mapboxView);
    this.layers = new Layers(mapboxView);
  }

  getStyle() {
    return this.view.mapStyle;
  }

  getUri() {
    return this.view.mapStyle.getUri();
  }

  getImage(name: string) {
    return this.view.mapStyle.getImage(name);
  }

  getSource(sourceId: string): any {
    return this.view.mapStyle.getSource(sourceId);
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
    this.view.mapStyle.addImageAsync(name, image);
  }

  addImageFromPath(name: string, filePath: string) {
    this.view.mapStyle.addImageAsync(name, this.getImageFromPath(filePath).android);
  }

  addLayer(layer: any) {
    this.view.mapStyle.addLayer(layer);
  }

  addLayerAt(layer: any, index: number) {
    this.view.mapStyle.addLayerAt(layer, index);
  }

  addLayerBelow(layer: any, below: string) {
    this.view.mapStyle.addLayerBelow(layer, below);
  }

  addLayerAbove(layer: any, above: string) {
    this.view.mapStyle.addLayerAbove(layer, above);
  }

  removeLayer(layer: any) {
    this.view.mapStyle.removeLayer(layer);
  }

  addSource(source: any) {
    this.view.mapStyle.addSource(source);
  }

  addGeoJsonSource(sourceId: string, geoJson: string) {
    let source = this.getSource(sourceId);
    if (source != null) {
      this.view.mapStyle.removeSource(sourceId);
    }
    source = new com.mapbox.mapboxsdk.style.sources.GeoJsonSource(sourceId, geoJson);
    this.addSource(source);
    return source;
  }

  addVectorSource(sourceId: string, uri: string): any {
    let source = this.getSource(sourceId);
    if (source != null) {
      this.view.mapStyle.removeSource(sourceId);
    }
    source = new com.mapbox.mapboxsdk.style.sources.VectorSource(sourceId, uri);
    this.addSource(source);
    return source;
  }

  removeImage(name: string) {
    this.view.mapStyle.removeImage(name);
  }
}
