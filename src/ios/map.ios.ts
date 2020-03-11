import { MapboxMap, CameraPosition, LatLngBounds } from './../common/map.common';
import { MapboxView } from '../mapbox-sdk.ios';
import { LatLng } from '../mapbox-sdk.common';
import * as utils from 'tns-core-modules/utils/utils';

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

        options.bearing = options.bearing ? options.bearing : this.getBearing();
        options.tilt = options.tilt ? options.tilt : this.getTilt();
        options.zoom = options.zoom ? options.zoom : this.getZoom();

        const viewportSize = CGSizeMake(this.view.getMeasuredWidth(), this.view.getMeasuredHeight());
        const altitude = MGLAltitudeForZoomLevel(options.zoom, options.tilt, options.latLng.lat, viewportSize);

        let camera = MGLMapCamera.alloc();
        camera.centerCoordinate = CLLocationCoordinate2DMake(options.latLng.lat, options.latLng.lng);
        camera.heading = options.bearing;
        camera.pitch = options.tilt;
        camera.altitude = altitude;

        this.view.mapView.setCameraWithDurationAnimationTimingFunctionCompletionHandler(
          camera,
          duration / 1000,
          CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseInEaseOut),
          () => {
            resolve();
          }
        );
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

  getBearing() {
    const bearing = this.view.mapView.camera.heading;
    return bearing;
  }

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

  queryRenderedFeatures(point: LatLng, ...layerIds: string[]) {
    const { x, y } = this.view.mapView.convertCoordinateToPointToView({ latitude: point.lat, longitude: point.lng }, this.view.mapView);
    const features = this.view.mapView.visibleFeaturesAtPointInStyleLayersWithIdentifiers({ x, y }, layerIds);

    const results = [];
    for (let i = 0; i < features.count; i++) {
      const feature: MGLFeature = features.objectAtIndex(i);
      const properties = [];

      if (feature.attributes && feature.attributes.count > 0) {
        const keys = utils.ios.collections.nsArrayToJSArray(feature.attributes.allKeys);

        for (let key of keys) {
          properties.push({
            key,
            value: feature.attributes.valueForKey(key),
          });
        }
      }
      results.push({
        id: feature.identifier,
        properties,
      });
    }

    return results;
  }

  setAllGesturesEnabled(enabled: boolean) {}

  setCompassEnabled(enabled: boolean) {}

  setLogoEnabled(enabled: boolean) {}
}
