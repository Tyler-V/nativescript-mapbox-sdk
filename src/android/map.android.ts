import { MapboxView } from '../mapbox-sdk.android';
import { LatLng } from '../mapbox-sdk.common';
import { MapboxMap, CameraPosition, LatLngBounds } from './../common/map.common';

declare const android, com, java, org: any;

function _getFeatures(features) {
  const results: Array<GeoJSON.Feature> = [];

  for (let i = 0; i < features.size(); i++) {
    const feature = features.get(i);

    results.push({
      id: feature.id(),
      type: feature.type(),
      properties: JSON.parse(feature.properties().toString()),
      geometry: {
        type: 'Point',
        coordinates: [feature.geometry().longitude(), feature.geometry().latitude()],
      },
    });
  }

  return results;
}
export class Map extends MapboxMap {
  constructor(mapboxView: MapboxView) {
    super(mapboxView);
  }

  animateCamera(options: CameraPosition, duration: number = 1000): Promise<void> {
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
          onCancel: () => resolve(),
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

  getZoom(): number {
    const zoom = this.view.mapboxMap.getCameraPosition().zoom;
    return zoom;
  }

  setMinimumZoomLevel(zoomLevel: number): void {
    this.view.mapboxMap.setMinZoomPreference(zoomLevel);
  }

  setMaximumZoomLevel(zoomLevel: number): void {
    this.view.mapboxMap.setMaxZoomPreference(zoomLevel);
  }

  getTilt(): number {
    const tilt = this.view.mapboxMap.getCameraPosition().tilt;
    return tilt;
  }

  getBearing(): number {
    const bearing = this.view.mapboxMap.getCameraPosition().bearing;
    return bearing;
  }

  getCenter(): LatLng {
    const coordinate = this.view.mapboxMap.getCameraPosition().target;
    return {
      lat: coordinate.getLatitude(),
      lng: coordinate.getLongitude(),
    };
  }

  getBounds(): LatLngBounds {
    const latLngBounds = this.view.mapboxMap.getProjection().getVisibleRegion().latLngBounds;
    return {
      north: latLngBounds.getLatNorth(),
      east: latLngBounds.getLonEast(),
      south: latLngBounds.getLatSouth(),
      west: latLngBounds.getLonWest(),
    };
  }

  queryRenderedFeatures(point: LatLng, ...layerIds: string[]): Array<GeoJSON.Feature> {
    const latLng = new com.mapbox.mapboxsdk.geometry.LatLng(point.lat, point.lng);
    const pixel = this.view.mapboxMap.getProjection().toScreenLocation(latLng);
    const features = this.view.mapboxMap.queryRenderedFeatures(pixel, layerIds);
    return _getFeatures(features);
  }

  queryRenderedFeaturesByBounds(bounds?: LatLngBounds, ...layerIds: string[]): Array<GeoJSON.Feature> {
    let coordinates;

    if (!bounds) {
      bounds = this.getBounds();
    }

    const latLngBounds = new com.mapbox.mapboxsdk.geometry.LatLngBounds.Builder()
      .include(new com.mapbox.mapboxsdk.geometry.LatLng(bounds.north, bounds.east))
      .include(new com.mapbox.mapboxsdk.geometry.LatLng(bounds.south, bounds.west))
      .build();

    const northWest = this.view.mapboxMap.getProjection().toScreenLocation(latLngBounds.getNorthWest());
    const southEast = this.view.mapboxMap.getProjection().toScreenLocation(latLngBounds.getSouthEast());
    coordinates = new android.graphics.RectF(northWest.x, northWest.y, southEast.x, southEast.y);

    const features = this.view.mapboxMap.queryRenderedFeatures(coordinates, layerIds);
    return _getFeatures(features);
  }

  setAllGesturesEnabled(enabled: boolean): void {
    this.view.mapboxMap.getUiSettings().setAllGesturesEnabled(enabled);
  }

  setCompassEnabled(enabled: boolean): void {
    this.view.mapboxMap.getUiSettings().setCompassEnabled(enabled);
  }

  setLogoEnabled(enabled: boolean): void {
    this.view.mapboxMap.getUiSettings().setLogoEnabled(enabled);
  }

  setCameraToBounds(latLngBounds: LatLngBounds, padding?: number, animated?: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      const bounds = new com.mapbox.mapboxsdk.geometry.LatLngBounds.Builder()
        .include(new com.mapbox.mapboxsdk.geometry.LatLng(latLngBounds.north, latLngBounds.east))
        .include(new com.mapbox.mapboxsdk.geometry.LatLng(latLngBounds.south, latLngBounds.west))
        .build();

      const cameraUpdate = com.mapbox.mapboxsdk.camera.CameraUpdateFactory.newLatLngBounds(bounds, padding);

      if (animated) {
        this.view.mapboxMap.animateCamera(
          cameraUpdate,
          1000,
          new com.mapbox.mapboxsdk.maps.MapboxMap.CancelableCallback({
            onCancel: () => resolve(),
            onFinish: () => resolve(),
          })
        );
      } else {
        this.view.mapboxMap.moveCamera(cameraUpdate);
        resolve();
      }
    });
  }

  setCameraToCoordinates(latLngs: LatLng[], padding?: number, animated?: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      const latLngBoundsBuilder = new com.mapbox.mapboxsdk.geometry.LatLngBounds.Builder();
      for (let latLng of latLngs) {
        latLngBoundsBuilder.include(new com.mapbox.mapboxsdk.geometry.LatLng(latLng.lat, latLng.lng));
      }
      const bounds = latLngBoundsBuilder.build();

      const cameraUpdate = com.mapbox.mapboxsdk.camera.CameraUpdateFactory.newLatLngBounds(bounds, padding);

      if (animated) {
        this.view.mapboxMap.animateCamera(
          cameraUpdate,
          4000,
          new com.mapbox.mapboxsdk.maps.MapboxMap.CancelableCallback({
            onCancel: () => resolve(),
            onFinish: () => resolve(),
          })
        );
      } else {
        this.view.mapboxMap.moveCamera(cameraUpdate);
        resolve();
      }
    });
  }
}
