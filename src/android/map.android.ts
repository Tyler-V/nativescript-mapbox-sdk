import { MapboxView } from '../mapbox-sdk.android';
import { LatLng } from '../mapbox-sdk.common';
import { MapboxMap, CameraPosition, LatLngBounds, Feature } from './../common/map.common';

declare const android, com, java, org: any;

function _getFeatures(features) {
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

  getZoom(): number {
    const zoom = this.view.mapboxMap.getCameraPosition().zoom;
    return zoom;
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

  queryRenderedFeatures(point: LatLng, ...layerIds: string[]): Array<Feature> {
    const latLng = new com.mapbox.mapboxsdk.geometry.LatLng(point.lat, point.lng);
    const pixel = this.view.mapboxMap.getProjection().toScreenLocation(latLng);

    const features = this.view.mapboxMap.queryRenderedFeatures(pixel, layerIds);

    return _getFeatures(features);
  }

  queryRenderedFeaturesByBounds(bounds: LatLngBounds, ...layerIds: string[]): Array<Feature> {
    const bbox = new com.mapbox.mapboxsdk.geometry.LatLngBounds.Builder()
      .include(new com.mapbox.mapboxsdk.geometry.LatLng(bounds.north, bounds.east))
      .include(new com.mapbox.mapboxsdk.geometry.LatLng(bounds.south, bounds.west))
      .build();
    const west = this.view.mapboxMap.getProjection().toScreenLocation(bbox.getLonWest());
    const south = this.view.mapboxMap.getProjection().toScreenLocation(bbox.getLatSouth());
    const east = this.view.mapboxMap.getProjection().toScreenLocation(bbox.getLonEast());
    const north = this.view.mapboxMap.getProjection().toScreenLocation(bbox.getLatNorth());

    const rect = new android.os.Parcelable.RectF(west, south, east, north);
    const features = this.view.mapboxMap.queryRenderedFeatures(rect, layerIds);

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
