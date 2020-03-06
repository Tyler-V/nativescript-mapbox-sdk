import { MapboxMap, CameraPosition, LatLngBounds } from './../common/map.common';
import { MapboxView } from '../mapbox-sdk.ios';
import { LatLng } from '../mapbox-sdk.common';

export class Map extends MapboxMap {
  constructor(mapboxView: MapboxView) {
    super(mapboxView);
  }

  animateCamera(options: CameraPosition, duration: number = 1000): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!options.latLng) {
          reject('A position is required');
          return;
        }
        const viewportSize = CGSizeMake(this.view.getMeasuredWidth(), this.view.getMeasuredHeight());
        const altitude = MGLAltitudeForZoomLevel(options.zoom, options.tilt, options.latLng.lat, viewportSize);

        let camera = MGLMapCamera.alloc();
        camera.centerCoordinate = CLLocationCoordinate2DMake(options.latLng.lat, options.latLng.lng);
        camera.heading = options.bearing;
        camera.pitch = options.tilt;
        camera.altitude = altitude;

        this.view.mapView.setCameraWithDurationAnimationTimingFunction(
          camera,
          duration / 3000,
          CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseInEaseOut)
        );

        this.view.mapView.setZoomLevelAnimated(options.zoom, false);

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

  getZoom() {
    const zoom = this.view.mapView.zoomLevel;
    return zoom;
  }

  getTilt() {
    const tilt = this.view.mapView.camera.pitch;
    return tilt;
  }

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
