import { LatLng } from './../mapbox-sdk.common';
import { MapboxViewBase } from '../mapbox-sdk.common';

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

export abstract class MapboxMap {
  protected view: MapboxViewBase;

  constructor(view: MapboxViewBase) {
    this.view = view;
  }

  abstract addOnMapClickListener(listener: (latLng: LatLng) => void);
  abstract addOnMapLongClickListener(listener: (latLng: LatLng) => void);

  abstract getMap();
  abstract getZoom();
  abstract getTilt();
  abstract getBearing();
  abstract getCenter();
  abstract getBounds(): LatLngBounds;

  abstract setAllGesturesEnabled(enabled: boolean);
  abstract setCompassEnabled(enabled: boolean);
  abstract setLogoEnabled(enabled: boolean);

  abstract animateCamera(options: CameraPosition): Promise<void>;
  abstract queryRenderedFeatures(point: LatLng, ...layerIds: string[]);
}
