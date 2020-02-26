import { MapboxView } from "../mapbox-sdk.ios";
import { MapboxAnnotation } from "../common/annotation.common";

export class Annotation extends MapboxAnnotation {
  constructor(view: MapboxView) {
    super(view);
  }

  private _getCircleManager() {}

  public addCircle() {}
}
