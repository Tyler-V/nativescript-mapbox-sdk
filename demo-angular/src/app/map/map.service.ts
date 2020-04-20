import { Injectable } from '@angular/core';
import { Mapbox } from 'nativescript-mapbox-sdk';
import { ReplaySubject } from 'rxjs';

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

    mapReady: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
    styleLoaded: ReplaySubject<boolean> = new ReplaySubject<boolean>();

    constructor() {}
}
