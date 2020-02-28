import { MapboxMap, CameraPosition } from './../common/map.common';
import { MapboxView } from '../mapbox-sdk.android';
import { LatLng, Feature } from '../mapbox-sdk.common';

declare const android, com, java, org: any;

export class Map extends MapboxMap {
  constructor(mapboxView: MapboxView) {
    super(mapboxView);
  }

  animateCamera(options: CameraPosition, duration: number = 2000): Promise<void> {
    return new Promise((resolve, reject) => {
      const position = new com.mapbox.mapboxsdk.camera.CameraPosition.Builder()
        .target(new com.mapbox.mapboxsdk.geometry.LatLng(options.latLng.lat, options.latLng.lng))
        .zoom(options.zoom)
        .bearing(options.bearing ? options.bearing : 0)
        .tilt(options.tilt ? options.tilt : 0)
        .build();

      this.view.mapboxMap.animateCamera(
        com.mapbox.mapboxsdk.camera.CameraUpdateFactory.newCameraPosition(position),
        duration,
        new com.mapbox.mapboxsdk.maps.MapboxMap.CancelableCallback({
          onCancel: () => reject('Cancelled'),
          onFinish: () => resolve(),
        })
      );
    });
  }

  addOnMapClickListener(listener: (latLng: LatLng) => void) {
    this.view.mapboxMap.addOnMapClickListener(
      new com.mapbox.mapboxsdk.maps.MapboxMap.OnMapClickListener({
        onMapClick: (latLng) => {
          listener({
            lat: latLng.getLatitude(),
            lng: latLng.getLongitude(),
          });
          return false;
        },
      })
    );
  }

  addOnMapLongClickListener(listener: (latLng: LatLng) => void) {
    this.view.mapboxMap.addOnMapLongClickListener(
      new com.mapbox.mapboxsdk.maps.MapboxMap.OnMapLongClickListener({
        onMapLongClick: (latLng) => {
          listener({
            lat: latLng.getLatitude(),
            lng: latLng.getLongitude(),
          });
          return false;
        },
      })
    );
  }

  getMap() {
    return this.view.mapboxMap;
  }

  getZoom() {
    const zoom = this.view.mapboxMap.getCameraPosition().zoom;
    return zoom;
  }

  getTilt() {
    const tilt = this.view.mapboxMap.getCameraPosition().tilt;
    return tilt;
  }

  getBearing() {
    const bearing = this.view.mapboxMap.getCameraPosition().bearing;
    return bearing;
  }

  getCenter() {
    const coordinate = this.view.mapboxMap.getCameraPosition().target;
    return {
      lat: coordinate.getLatitude(),
      lng: coordinate.getLongitude(),
    };
  }

  getBounds() {
    const latLngBounds = this.view.mapboxMap.getProjection().getVisibleRegion().latLngBounds;
    return {
      north: latLngBounds.getLatNorth(),
      east: latLngBounds.getLonEast(),
      south: latLngBounds.getLatSouth(),
      west: latLngBounds.getLonWest(),
    };
  }

  queryRenderedFeatures(point: LatLng, ...layerIds: string[]) {
    const latLng = new com.mapbox.mapboxsdk.geometry.LatLng(point.lat, point.lng);
    const pixel = this.view.mapboxMap.getProjection().toScreenLocation(latLng);

    const features = this.view.mapboxMap.queryRenderedFeatures(pixel, layerIds);
    const results: Array<Feature> = [];

    for (let i = 0; i < features.size(); i++) {
      const feature = features.get(i);
      results.push({
        id: feature.id(),
        type: feature.type(),
        properties: JSON.parse(feature.properties().toString()),
      });
    }

    return results;
  }

  setAllGesturesEnabled(enabled: boolean) {
    this.view.mapboxMap.getUiSettings().setAllGesturesEnabled(enabled);
  }

  setCompassEnabled(enabled: boolean) {
    this.view.mapboxMap.getUiSettings().setCompassEnabled(enabled);
  }

  setLogoEnabled(enabled: boolean) {
    this.view.mapboxMap.getUiSettings().setLogoEnabled(enabled);
  }
}
