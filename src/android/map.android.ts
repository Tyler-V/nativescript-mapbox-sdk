import { MapboxView } from '../mapbox-sdk.android';
import { LatLng } from '../mapbox-sdk.common';
import { MapboxMap, LatLngBounds, LatLngCameraOptions, BoundsCameraOptions, MapPanEvent } from './../common/map.common';

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

  private setCamera(cameraUpdate, animationDuration: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (animationDuration) {
        this.view.mapboxMap.animateCamera(
          cameraUpdate,
          animationDuration,
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

  setCameraToLatLng(latLng: LatLng, options?: LatLngCameraOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const cameraPosition = new com.mapbox.mapboxsdk.camera.CameraPosition.Builder()
        .target(new com.mapbox.mapboxsdk.geometry.LatLng(latLng.lat, latLng.lng))
        .zoom(options.zoom ? options.zoom : this.getZoom())
        .bearing(options.bearing ? options.bearing : this.getBearing())
        .tilt(options.tilt ? options.tilt : this.getTilt())
        .build();
      const cameraUpdate = com.mapbox.mapboxsdk.camera.CameraUpdateFactory.newCameraPosition(cameraPosition);
      resolve(this.setCamera(cameraUpdate, options.animationDuration));
    });
  }

  setCameraToBounds(latLngBounds: LatLngBounds, options?: BoundsCameraOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const bounds = new com.mapbox.mapboxsdk.geometry.LatLngBounds.Builder()
        .include(new com.mapbox.mapboxsdk.geometry.LatLng(latLngBounds.north, latLngBounds.east))
        .include(new com.mapbox.mapboxsdk.geometry.LatLng(latLngBounds.south, latLngBounds.west))
        .build();
      const cameraUpdate = com.mapbox.mapboxsdk.camera.CameraUpdateFactory.newLatLngBounds(
        bounds,
        options.bearing ? options.bearing : this.getBearing(),
        options.tilt ? options.tilt : this.getTilt(),
        options.padding ? options.padding : 0
      );
      resolve(this.setCamera(cameraUpdate, options.animationDuration));
    });
  }

  setCameraToCoordinates(latLngs: LatLng[], options?: BoundsCameraOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const latLngBoundsBuilder = new com.mapbox.mapboxsdk.geometry.LatLngBounds.Builder();
      for (let latLng of latLngs) {
        latLngBoundsBuilder.include(new com.mapbox.mapboxsdk.geometry.LatLng(latLng.lat, latLng.lng));
      }
      const bounds = latLngBoundsBuilder.build();
      const cameraUpdate = com.mapbox.mapboxsdk.camera.CameraUpdateFactory.newLatLngBounds(
        bounds,
        options.bearing ? options.bearing : this.getBearing(),
        options.tilt ? options.tilt : this.getTilt(),
        options.padding ? options.padding : 0
      );
      resolve(this.setCamera(cameraUpdate, options.animationDuration));
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

  addOnMapPanListener(listener: (event: MapPanEvent) => void) {
    this.view.mapboxMap.addOnMoveListener(
      new com.mapbox.mapboxsdk.maps.MapboxMap.OnMoveListener({
        onMoveBegin: (detector) => {
          listener(MapPanEvent.Begin);
        },
        onMove: (detector) => {
          listener(MapPanEvent.Pan);
        },
        onMoveEnd: (detector) => {
          listener(MapPanEvent.End);
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
}
