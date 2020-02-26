import { MapboxView } from "../mapbox-sdk.ios";
import { MapboxAnnotation } from "../common/annotation.common";

export class Annotation extends MapboxAnnotation {
  constructor(mapboxView: MapboxView) {
    super(mapboxView);
  }

  private _getCircleManager() {}

  public addCircle() {}
}
