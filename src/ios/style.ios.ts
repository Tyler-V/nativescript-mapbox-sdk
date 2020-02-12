import { MapboxView } from "../mapbox-sdk.ios";
import { MapboxStyle } from "../common/style.common";

export class Style extends MapboxStyle {
  constructor(mapboxView: MapboxView) {
    super(mapboxView);
  }

  getStyle() {}

  getUri() {
    return null;
  }

  setStyleUri(uri: string): Promise<void> {
    return null;
  }

  addSource(source: any) {}

  addLayer(layer: any) {}
}
