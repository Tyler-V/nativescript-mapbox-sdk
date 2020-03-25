import { MapboxViewBase, LatLng } from '../mapbox-sdk.common';

export interface CameraPosition {
  latLng: LatLng;
  zoom: number;
  bearing?: number;
  tilt?: number;
}

export interface LatLngBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface Feature {
  id: any;
  type: string;
  properties: Object;
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

  abstract setAllGesturesEnabled(enabled: boolean);
  abstract setCompassEnabled(enabled: boolean);
  abstract setLogoEnabled(enabled: boolean);

  abstract animateCamera(options: CameraPosition, duration: number): Promise<void>;
  abstract queryRenderedFeatures(point: LatLng, ...layerIds: string[]): Array<Feature>;
  abstract queryRenderedFeaturesByBounds(bounds?: LatLngBounds, ...layerIds: string[]): Array<Feature>;
  abstract setCameraToBounds(latLngBounds: LatLngBounds, padding?: number, animated?: boolean): Promise<void>;
  abstract setCameraToCoordinates(latLngs: LatLng[], padding?: number, duration?: number): Promise<void>;
  abstract setMinimumZoomLevel(zoomLevel: number): void;
  abstract setMaximumZoomLevel(zoomLevel: number): void;
}
