import { Color } from 'tns-core-modules/color';

import { MapboxView } from '../mapbox-sdk.android';
import { MapboxAnnotation } from '../common/annotation.common';

declare const android, com, java, org: any;

export class Annotation extends MapboxAnnotation {
  constructor(mapboxView: MapboxView) {
    super(mapboxView);
  }

  private _getCircleManager() {
    return new com.mapbox.mapboxsdk.plugins.annotation.CircleManager(this.view.mapView, this.view.mapboxMap, this.view.mapStyle);
  }

  public addCircle() {
    const circleOptions = new com.mapbox.mapboxsdk.plugins.annotation.CircleOptions()
      .withLatLng(new com.mapbox.mapboxsdk.geometry.LatLng(39.8283, -98.5795))
      .withCircleColor(com.mapbox.mapboxsdk.utils.ColorUtils.colorToRgbaString(new Color('YELLOW').android))
      .withCircleRadius(new java.lang.Float(20.0))
      .withCircleBlur(new java.lang.Float(1.0))
      .withCircleStrokeColor(com.mapbox.mapboxsdk.utils.ColorUtils.colorToRgbaString(new Color('RED').android))
      .withCircleStrokeWidth(new java.lang.Float(1.0))
      .withDraggable(true);

    this._getCircleManager().create(circleOptions);
  }
}
