import { MapboxView, MGLMapViewDelegateImpl } from '../mapbox-sdk.ios';
import { MapboxStyle, LayerType } from '../common/style.common';
import { MapboxViewBase } from '../mapbox-sdk.common';

export class Style extends MapboxStyle {
  constructor(mapboxView: MapboxView) {
    super(mapboxView);
  }

  getStyle() {
    return null; // TODO
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
    this.view.mapView.addSource(source);
  }

  addLayer(layer: any) {
    this.view.mapView.addLayer(layer);
  }

  removeLayer(layer: any) {
    this.view.mapView.removeLayer(layer);
  }

  addVectorSource(sourceId: string, uri: string) {
    let vectorSource = MGLVectorTileSource.alloc().initWithIdentifierConfigurationURL(sourceId, NSURL.URLWithString(uri));
    this.addSource(vectorSource);
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
