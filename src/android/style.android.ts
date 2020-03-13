import { LayerType, MapboxHeatmap, Color } from '../common/style.common';
import { MapboxView } from '../mapbox-sdk.android';
import { MapboxViewBase } from '../mapbox-sdk.common';
import { MapboxStyle } from '../common/style.common';

declare const com, java: any;

export class Style extends MapboxStyle {
  constructor(mapboxView: MapboxView) {
    super(mapboxView);
    this.heatmap = new Heatmap();
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

  addImage(name: string, filePath: string) {
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

  addVectorSource(sourceId: string, uri: string) {
    const vectorSource = new com.mapbox.mapboxsdk.style.sources.VectorSource(sourceId, uri);
    this.addSource(vectorSource);
  }

  createLayer(layerType: LayerType, layerId: string, sourceId: string, minZoom: number, maxZoom: number) {
    let layer;
    switch (layerType) {
      case LayerType.HEATMAP:
        layer = new com.mapbox.mapboxsdk.style.layers.HeatmapLayer(layerId, sourceId);
        break;
      case LayerType.SYMBOL:
        layer = new com.mapbox.mapboxsdk.style.layers.SymbolLayer(layerId, sourceId);
        break;
    }
    layer.setSourceLayer(sourceId);
    if (minZoom) layer.setMinZoom(minZoom);
    if (maxZoom) layer.setMaxZoom(maxZoom);
    return layer;
  }
}

const heatmapColor = com.mapbox.mapboxsdk.style.layers.PropertyFactory.heatmapColor;
const heatmapIntensity = com.mapbox.mapboxsdk.style.layers.PropertyFactory.heatmapIntensity;
const heatmapOpacity = com.mapbox.mapboxsdk.style.layers.PropertyFactory.heatmapOpacity;
const heatmapRadius = com.mapbox.mapboxsdk.style.layers.PropertyFactory.heatmapRadius;
const heatmapWeight = com.mapbox.mapboxsdk.style.layers.PropertyFactory.heatmapWeight;

const heatmapDensity = com.mapbox.mapboxsdk.style.expressions.Expression.heatmapDensity;
const interpolate = com.mapbox.mapboxsdk.style.expressions.Expression.interpolate;
const linear = com.mapbox.mapboxsdk.style.expressions.Expression.linear;
const zoom = com.mapbox.mapboxsdk.style.expressions.Expression.zoom;
const stop = com.mapbox.mapboxsdk.style.expressions.Expression.stop;
const rgba = com.mapbox.mapboxsdk.style.expressions.Expression.rgba;
const rgb = com.mapbox.mapboxsdk.style.expressions.Expression.rgb;

export const color = (color: Color) => {
  if (color.alpha) {
    return rgba(number(color.red), number(color.green), number(color.blue), number(color.alpha));
  } else {
    return rgb(number(color.red), number(color.green), number(color.blue));
  }
};

export const number = (input: number) => {
  if (Number.isInteger(input)) {
    return new java.lang.Integer(input);
  } else {
    return new java.lang.Double(input);
  }
};

export const isColor = (input: any) => {
  try {
    return input.__proto__.constructor.name === 'Color';
  } catch {
    return false;
  }
};

export const marshall = (input: any) => {
  if (isColor(input)) {
    return color(input);
  } else if (typeof input === 'number') {
    return number(input);
  }
  return input;
};

export const expressionStops = (stops: any[][]) => {
  const array = [];
  for (let input of stops) {
    const _stop = marshall(input[0]);
    const _value = marshall(input[1]);
    array.push(stop(_stop, _value));
  }
  return array;
};

export class Heatmap extends MapboxHeatmap {
  create(layerId: string, sourceId: string, minZoom: number, maxZoom: number) {
    this.layerId = layerId;
    this.sourceId = sourceId;
    this.minZoom = minZoom;
    this.maxZoom = maxZoom;
    this.layer = new com.mapbox.mapboxsdk.style.layers.HeatmapLayer(layerId, sourceId);
    this.layer.setSourceLayer(sourceId);
    if (minZoom) this.layer.setMinZoom(minZoom);
    if (maxZoom) this.layer.setMaxZoom(maxZoom);
    return this.layer;
  }

  setHeatmapColor(layer: any, stops: any[][]) {
    const _heatmapColor = heatmapColor(interpolate(linear(), heatmapDensity(), expressionStops(stops)));
    layer.setProperties([_heatmapColor]);
  }

  setHeatmapIntensity(layer: any, stops: number[][]) {
    const _heatmapIntensity = heatmapIntensity(interpolate(linear(), zoom(), expressionStops(stops)));
    layer.setProperties([_heatmapIntensity]);
  }

  setHeatmapRadius(layer: any, stops: number[][]) {
    const _heatmapRadius = heatmapRadius(interpolate(linear(), zoom(), expressionStops(stops)));
    layer.setProperties([_heatmapRadius]);
  }

  setHeatmapOpacity(layer: any, stops: number[][]) {
    const _heatmapOpacity = heatmapOpacity(interpolate(linear(), zoom(), expressionStops(stops)));
    layer.setProperties([_heatmapOpacity]);
  }

  setHeatmapWeight(layer: any, stops: number[][]) {
    const _heatmapWeight = heatmapWeight(interpolate(linear(), zoom(), expressionStops(stops)));
    layer.setProperties([_heatmapWeight]);
  }
}
