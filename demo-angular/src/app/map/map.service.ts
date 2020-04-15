import { Injectable } from '@angular/core';
import { Mapbox } from 'nativescript-mapbox-sdk';

@Injectable({
    providedIn: 'root',
})
export class MapService {
    mapboxView: any;
    mapView: any;
    mapbox: Mapbox;

    offlineRegions: any[];
    isTracking: boolean = false;
    heatmapLayer;
    symbolLayer;

    constructor() {}
}
