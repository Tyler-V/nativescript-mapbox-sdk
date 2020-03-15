import { MapboxView, MGLMapViewDelegateImpl } from '../mapbox-sdk.ios';
import { MapboxStyle, LayerType, MapboxHeatmap } from '../common/style.common';
import { MapboxViewBase } from '../mapbox-sdk.common';
import { MapboxColor } from '../common/color.common';

export class Style extends MapboxStyle {
  constructor(mapboxView: MapboxView) {
    super(mapboxView);
    this.heatmap = new Heatmap(mapboxView);
  }

  getStyle() {
    return this.view.mapView.style;
  }

  getUri() {
    return null; // TODO
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
    this.view.mapView.style.addSource(source);
  }

  addLayer(layer: any) {
    this.view.mapView.style.addLayer(layer);
  }

  removeLayer(layer: any) {
    this.view.mapView.style.removeLayer(layer);
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
    return this.view.mapView.style.sourceWithIdentifier(sourceId);
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
}

export class Heatmap extends MapboxHeatmap {
  create(layerId: string, sourceId: string, minZoom?: number, maxZoom?: number) {
    const source = this.view.mapbox.style.getSource(sourceId);
    const layer = MGLHeatmapStyleLayer.alloc().initWithIdentifierSource(layerId, source);
    layer.sourceLayerIdentifier = sourceId;
    if (minZoom) layer.minimumZoomLevel = minZoom;
    if (maxZoom) layer.maximumZoomLevel = maxZoom;
    return layer;
  }

  setHeatmapColor(layer: any, stops: (number | MapboxColor)[][]) {}

  setHeatmapIntensity(layer: any, stops: number[][]) {}

  setHeatmapRadius(layer: any, stops: number[][]) {}

  setHeatmapOpacity(layer: any, stops: number[][]) {}

  setHeatmapWeight(layer: any, stops: number[][]) {}
}
