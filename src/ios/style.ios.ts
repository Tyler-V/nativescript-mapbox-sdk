import { MapboxView, MGLMapViewDelegateImpl } from '../mapbox-sdk.ios';
import { MapboxStyle, LayerType, MapboxHeatmap } from '../common/style.common';
import { MapboxViewBase } from '../mapbox-sdk.common';
import { MapboxColor } from '../common/color.common';
import { Color } from 'tns-core-modules/color';

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

export const isColor = (input: any) => {
  try {
    return input.__proto__.constructor.name === 'MapboxColor';
  } catch {
    return false;
  }
};

export const color = (color: MapboxColor) => {
  return new Color(color.alpha ? color.alpha : 255, color.red, color.green, color.blue).ios;
};

export const marshall = (input: number | MapboxColor) => {
  if (isColor(input)) {
    return color(input as MapboxColor);
  }
  return input;
};

export const expressionStops = (expression: (number | MapboxColor)[][]) => {
  const stops = [];
  const values = [];
  for (let i = 0; i < expression.length; i++) {
    stops.push(marshall(expression[i][0]));
    values.push(marshall(expression[i][1]));
  }
  let nsDictionary = new (NSDictionary as any)(values, stops);
  let nsArray = NSArray.arrayWithArray([nsDictionary]);
  return nsArray;
};

export class Heatmap extends MapboxHeatmap {
  create(layerId: string, sourceId: string, minZoom?: number, maxZoom?: number) {
    const source = this.view.mapbox.style.getSource(sourceId);
    const layer = MGLHeatmapStyleLayer.alloc().initWithIdentifierSource(layerId, source);
    layer.sourceLayerIdentifier = sourceId;
    if (minZoom) layer.minimumZoomLevel = minZoom;
    if (maxZoom) layer.maximumZoomLevel = maxZoom;
    return layer;
  }

  setHeatmapColor(layer: MGLHeatmapStyleLayer, stops: (number | MapboxColor)[][]) {
    const colorDictionary1 = {
      0.0: UIColor.blueColor,
      0.25: UIColor.brownColor,
      0.5: UIColor.redColor,
      0.75: UIColor.greenColor,
      1: UIColor.orangeColor,
    };

    layer.heatmapColor = NSExpression.expressionWithFormatArgumentArray("mgl_interpolate:withCurveType:parameters:stops:($heatmapDensity, 'linear', nil, %@)", [
      colorDictionary1,
    ]);
  }

  setHeatmapIntensity(layer: any, stops: number[][]) {
    layer.heatmapIntensity = NSExpression.expressionWithFormatArgumentArray(
      "mgl_interpolate:withCurveType:parameters:stops:($zoomLevel, 'linear', nil, %@)",
      expressionStops(stops)
    );
  }

  setHeatmapRadius(layer: any, stops: number[][]) {
    layer.heatmapRadius = NSExpression.expressionWithFormatArgumentArray(
      "mgl_interpolate:withCurveType:parameters:stops:($zoomLevel, 'linear', nil, %@)",
      expressionStops(stops)
    );
  }

  setHeatmapOpacity(layer: any, stops: number[][]) {
    layer.heatmapOpacity = NSExpression.expressionWithFormatArgumentArray(
      "mgl_interpolate:withCurveType:parameters:stops:($zoomLevel, 'linear', nil, %@)",
      expressionStops(stops)
    );
  }

  setHeatmapWeight(layer: any, stops: number[][]) {
    layer.heatmapWeight = NSExpression.expressionWithFormatArgumentArray(
      "mgl_interpolate:withCurveType:parameters:stops:($zoomLevel, 'linear', nil, %@)",
      expressionStops(stops)
    );
  }
}
