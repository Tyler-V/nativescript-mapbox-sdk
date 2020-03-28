import { MapboxHeatmap, HeatmapLayerOptions } from '../../common/layers/heatmap.common';
import { MapboxColor } from '../../common/color.common';
import { toExpressionStop } from '../utils.android';

declare const com: any;

const heatmapColor = com.mapbox.mapboxsdk.style.layers.PropertyFactory.heatmapColor;
const heatmapIntensity = com.mapbox.mapboxsdk.style.layers.PropertyFactory.heatmapIntensity;
const heatmapOpacity = com.mapbox.mapboxsdk.style.layers.PropertyFactory.heatmapOpacity;
const heatmapRadius = com.mapbox.mapboxsdk.style.layers.PropertyFactory.heatmapRadius;
const heatmapWeight = com.mapbox.mapboxsdk.style.layers.PropertyFactory.heatmapWeight;

const heatmapDensity = com.mapbox.mapboxsdk.style.expressions.Expression.heatmapDensity;
const interpolate = com.mapbox.mapboxsdk.style.expressions.Expression.interpolate;
const linear = com.mapbox.mapboxsdk.style.expressions.Expression.linear;
const zoom = com.mapbox.mapboxsdk.style.expressions.Expression.zoom;

export class Heatmap extends MapboxHeatmap {
  create(layerId: string, sourceId: string, options?: HeatmapLayerOptions) {
    const layer = new com.mapbox.mapboxsdk.style.layers.HeatmapLayer(layerId, sourceId);
    layer.setSourceLayer(sourceId);

    if (options) {
      if (options.minZoom) layer.setMinZoom(options.minZoom);
      if (options.maxZoom) layer.setMaxZoom(options.maxZoom);
    }

    return layer;
  }

  setHeatmapColor(layer: any, stops: (number | MapboxColor)[][]) {
    const _heatmapColor = heatmapColor(interpolate(linear(), heatmapDensity(), toExpressionStop(stops)));
    layer.setProperties([_heatmapColor]);
  }

  setHeatmapIntensity(layer: any, stops: number[][]) {
    const _heatmapIntensity = heatmapIntensity(interpolate(linear(), zoom(), toExpressionStop(stops)));
    layer.setProperties([_heatmapIntensity]);
  }

  setHeatmapRadius(layer: any, stops: number[][]) {
    const _heatmapRadius = heatmapRadius(interpolate(linear(), zoom(), toExpressionStop(stops)));
    layer.setProperties([_heatmapRadius]);
  }

  setHeatmapOpacity(layer: any, stops: number[][]) {
    const _heatmapOpacity = heatmapOpacity(interpolate(linear(), zoom(), toExpressionStop(stops)));
    layer.setProperties([_heatmapOpacity]);
  }

  setHeatmapWeight(layer: any, stops: number[][]) {
    const _heatmapWeight = heatmapWeight(interpolate(linear(), zoom(), toExpressionStop(stops)));
    layer.setProperties([_heatmapWeight]);
  }
}
