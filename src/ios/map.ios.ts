import { MapboxMap, CameraPosition, LatLngBounds } from './../common/map.common';
import { MapboxView } from '../mapbox-sdk.ios';
import { LatLng } from '../mapbox-sdk.common';

export class Map extends MapboxMap {
  constructor(mapboxView: MapboxView) {
    super(mapboxView);
  }

  animateCamera(options: CameraPosition, duration: number = 2000): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        let target = [this.view.mapView.latitude, this.view.mapView.longitude];
        if (target === undefined) {
          reject("Please set the 'target' parameter");
          return;
        }

        let cam = this.view.mapView.camera;

        cam.centerCoordinate = CLLocationCoordinate2DMake(target[0], target[1]);

        if (options.bearing) {
          cam.heading = options.bearing;
        }

        if (options.tilt) {
          cam.pitch = options.tilt;
        }

        this.view.mapView.setCameraWithDurationAnimationTimingFunction(
          cam,
          duration / 1000,
          CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseInEaseOut)
        );

        setTimeout(() => {
          resolve();
        }, duration);
      } catch (ex) {
        console.log('Error in mapbox.animateCamera: ' + ex);
        reject(ex);
      }
    });
  }

  addOnMapClickListener(listener: (latLng: LatLng) => void) {}

  addOnMapLongClickListener(listener: (latLng: LatLng) => void) {}

  getMap() {
    return this.view.mapboxMap;
  }

  getZoom() {}

  getTilt() {}

  getBearing() {}

  getCenter() {}

  getBounds(): LatLngBounds {
    let visibleCoordinateBounds = this.view.mapView.visibleCoordinateBounds;
    return {
      north: visibleCoordinateBounds.ne.latitude,
      east: visibleCoordinateBounds.ne.longitude,
      south: visibleCoordinateBounds.sw.latitude,
      west: visibleCoordinateBounds.sw.longitude,
    };
  }

  queryRenderedFeatures(point: LatLng, ...layerIds: string[]) {}

  setAllGesturesEnabled(enabled: boolean) {}

  setCompassEnabled(enabled: boolean) {}

  setLogoEnabled(enabled: boolean) {}
}
