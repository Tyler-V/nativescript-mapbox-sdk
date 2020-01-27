import { LatLng } from './../mapbox-sdk.common';
import { MapboxViewBase } from '../mapbox-sdk.common';

export interface CameraPosition {
    latLng: LatLng;
    zoom: number;
    bearing?: number;
    tilt?: number;
}

export abstract class MapboxMap {
    protected mapboxView: MapboxViewBase;

    constructor(mapboxView: MapboxViewBase) {
        this.mapboxView = mapboxView;
    }

    abstract addOnMapClickListener(listener: (latLng: LatLng) => void);
    abstract addOnMapLongClickListener(listener: (latLng: LatLng) => void);

    abstract getMap();
    abstract getZoom();
    abstract getTilt();
    abstract getBearing();
    abstract getCenter();
    abstract getBounds();

    abstract setAllGesturesEnabled(enabled: boolean);
    abstract setCompassEnabled(enabled: boolean);
    abstract setLogoEnabled(enabled: boolean);

    abstract animateCamera(options: CameraPosition): Promise<void>;
    abstract queryRenderedFeatures(point: LatLng, ...layerIds: string[]);
}
