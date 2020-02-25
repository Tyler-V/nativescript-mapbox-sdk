import { MapboxMap, CameraPosition } from "./../common/map.common";
import { MapboxView } from "../mapbox-sdk.ios";
import { LatLng } from "../mapbox-sdk.common";

export class Map extends MapboxMap {

  constructor(mapboxView: MapboxView) {
    super(mapboxView);
  }

  animateCamera(options: CameraPosition, duration: number = 2000): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        let theMap: MGLMapView = this.mapboxView["nativeMapView"];
        let target = [theMap.latitude, theMap.longitude];
        if (target === undefined) {
          reject("Please set the 'target' parameter");
          return;
        }

        let cam = theMap.camera;

        cam.centerCoordinate = CLLocationCoordinate2DMake(target[0], target[1]);

        if (options.bearing) {
          cam.heading = options.bearing;
        }

        if (options.tilt) {
          cam.pitch = options.tilt;
        }

        theMap.setCameraWithDurationAnimationTimingFunction(
            cam,
            duration / 1000,
            CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseInEaseOut));

        setTimeout(() => {
          resolve();
        }, duration);
      } catch (ex) {
        console.log("Error in mapbox.animateCamera: " + ex);
        reject(ex);
      }
    });
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
