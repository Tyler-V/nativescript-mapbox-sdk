import { MapboxViewBase, LatLng } from '../mapbox-sdk.common';

export interface CameraOptions {
  bearing?: number;
  tilt?: number;
  animationDuration?: number;
}

export interface LatLngCameraOptions extends CameraOptions {
  zoom?: number;
}

export interface BoundsCameraOptions extends CameraOptions {
  padding?: number;
}

export interface LatLngBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export abstract class MapboxMap {
  protected view: MapboxViewBase;

  constructor(view: MapboxViewBase) {
    this.view = view;
  }

  abstract addOnMapClickListener(listener: (latLng: LatLng) => void);
  abstract addOnMapLongClickListener(listener: (latLng: LatLng) => void);

  abstract getZoom(): number;
  abstract getTilt(): number;
  abstract getBearing(): number;
  abstract getCenter(): LatLng;
  abstract getBounds(): LatLngBounds;

  abstract setMinimumZoomLevel(zoomLevel: number): void;
  abstract setMaximumZoomLevel(zoomLevel: number): void;
  abstract setAllGesturesEnabled(enabled: boolean);
  abstract setCompassEnabled(enabled: boolean);
  abstract setLogoEnabled(enabled: boolean);

  abstract setCameraToLatLng(latLng: LatLng, options?: LatLngCameraOptions): Promise<void>;
  abstract setCameraToBounds(latLngBounds: LatLngBounds, options?: BoundsCameraOptions): Promise<void>;
  abstract setCameraToCoordinates(latLngs: LatLng[], options?: BoundsCameraOptions): Promise<void>;

  abstract queryRenderedFeatures(point: LatLng, ...layerIds: string[]): Array<GeoJSON.Feature>;
  abstract queryRenderedFeaturesByBounds(bounds?: LatLngBounds, ...layerIds: string[]): Array<GeoJSON.Feature>;
}
