import { Injectable } from '@angular/core';
import { Mapbox } from 'nativescript-mapbox-sdk';

@Injectable({
    providedIn: 'root'
})
export class MapService {
    mapbox: Mapbox;
    offlineRegions: any[];

    constructor() {}
}
