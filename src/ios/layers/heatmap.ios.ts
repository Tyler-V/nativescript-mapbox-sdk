import { MapboxHeatmap, HeatmapLayerOptions } from '../../common/layers/heatmap.common';
import { MapboxColor } from '../../common/color.common';
import { toExpressionStop } from '../utils.ios';

export class Heatmap extends MapboxHeatmap {
  create(layerId: string, sourceId: string, options?: HeatmapLayerOptions) {
    const source = this.view.mapbox.style.getSource(sourceId);
    const layer = MGLHeatmapStyleLayer.alloc().initWithIdentifierSource(layerId, source);
    layer.sourceLayerIdentifier = sourceId;
    if (options.minZoom) layer.minimumZoomLevel = options.minZoom;
    if (options.maxZoom) layer.maximumZoomLevel = options.maxZoom;
    return layer;
  }

  setHeatmapColor(layer: MGLHeatmapStyleLayer, stops: (number | MapboxColor)[][]) {
    layer.heatmapColor = NSExpression.expressionWithFormatArgumentArray(
      "mgl_interpolate:withCurveType:parameters:stops:($heatmapDensity, 'linear', nil, %@)",
      toExpressionStop(stops)
    );
  }

  setHeatmapIntensity(layer: any, stops: number[][]) {
    layer.heatmapIntensity = NSExpression.expressionWithFormatArgumentArray(
      "mgl_interpolate:withCurveType:parameters:stops:($zoomLevel, 'linear', nil, %@)",
      toExpressionStop(stops)
    );
  }

  setHeatmapRadius(layer: any, stops: number[][]) {
    layer.heatmapRadius = NSExpression.expressionWithFormatArgumentArray(
      "mgl_interpolate:withCurveType:parameters:stops:($zoomLevel, 'linear', nil, %@)",
      toExpressionStop(stops)
    );
  }

  setHeatmapOpacity(layer: any, stops: number[][]) {
    layer.heatmapOpacity = NSExpression.expressionWithFormatArgumentArray(
      "mgl_interpolate:withCurveType:parameters:stops:($zoomLevel, 'linear', nil, %@)",
      toExpressionStop(stops)
    );
  }

  setHeatmapWeight(layer: any, stops: number[][]) {
    layer.heatmapWeight = NSExpression.expressionWithFormatArgumentArray(
      "mgl_interpolate:withCurveType:parameters:stops:($zoomLevel, 'linear', nil, %@)",
      toExpressionStop(stops)
    );
  }
}
