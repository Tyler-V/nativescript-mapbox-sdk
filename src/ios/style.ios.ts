import { Layers } from './layers/layers.ios';
import { MapboxView, MGLMapViewDelegateImpl } from '../mapbox-sdk.ios';
import { MapboxStyle, LayerType } from '../common/style.common';
import { MapboxViewBase } from '../mapbox-sdk.common';

export class Style extends MapboxStyle {
  constructor(mapboxView: MapboxView) {
    super(mapboxView);
    this.layers = new Layers(mapboxView);
  }

  getStyle() {
    return this.view.mapView.style;
  }

  getUri() {
    return null; // TODO
  }

  getImage(name: string) {
    return this.view.mapView.style.imageForName(name);
  }

  getSource(sourceId: string) {
    return this.view.mapView.style.sourceWithIdentifier(sourceId);
  }

  setStyleUri(uri: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.view.mapView.styleURL = NSURL.URLWithString(uri);
      let delegate: MGLMapViewDelegateImpl = <MGLMapViewDelegateImpl>this.view.mapView.delegate;
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

  addImage(name: string, image: any) {
    this.view.mapView.style.setImageForName(image, name);
  }

  addImageFromPath(name: string, filePath: string) {
    this.view.mapView.style.setImageForName(this.getImageFromPath(filePath).ios, name);
  }

  addLayer(layer: any) {
    this.view.mapView.style.addLayer(layer);
  }

  addSource(source: any) {
    this.view.mapView.style.addSource(source);
  }

  addGeoJsonSource(sourceId: string, geoJson: string) {
    // TODO
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

  createLayer(layerType: LayerType, layerId: string, sourceId: string, minZoom: number, maxZoom: number) {
    let layer;
    const source = this.view.mapView.style.sourceWithIdentifier(NSURL.URLWithString(sourceId));
    switch (layerType) {
      case LayerType.HEATMAP:
        layer = MGLHeatmapStyleLayer.alloc().initWithIdentifierSource(layerId, source);
        break;
      case LayerType.SYMBOL:
        layer = MGLSymbolStyleLayer.alloc().initWithIdentifierSource(layerId, source);
        break;
    }
    layer.sourceLayerIdentifier = sourceId;
    if (minZoom) layer.minimumZoomLevel = minZoom;
    if (maxZoom) layer.maximumZoomLevel = maxZoom;
    return layer;
  }

  removeLayer(layer: any) {
    this.view.mapView.style.removeLayer(layer);
  }

  removeImage(name: string) {
    this.view.mapView.style.removeImageForName(name);
  }
}
