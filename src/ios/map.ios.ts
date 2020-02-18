import { MapboxMap, CameraPosition } from "./../common/map.common";
import { MapboxView } from "../mapbox-sdk.ios";
import { LatLng } from "../mapbox-sdk.common";

export class Map extends MapboxMap {
  constructor(mapboxView: MapboxView) {
    super(mapboxView);
  }

  animateCamera(options: CameraPosition, duration: number = 2000): Promise<void> {
    return null;
  }

  addOnMapClickListener(listener: (latLng: LatLng) => void) {}

  addOnMapLongClickListener(listener: (latLng: LatLng) => void) {}

  getMap() {
    return this.mapboxView.mapboxMap;
  }

  getZoom() {}

  getTilt() {}

  getBearing() {}

  getCenter() {}

  getBounds() {}

  queryRenderedFeatures(point: LatLng, ...layerIds: string[]) {}

  setAllGesturesEnabled(enabled: boolean) {}

  setCompassEnabled(enabled: boolean) {}

  setLogoEnabled(enabled: boolean) {}
}
