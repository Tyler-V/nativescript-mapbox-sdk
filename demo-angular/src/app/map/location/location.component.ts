import { Component, OnInit } from '@angular/core';
import { ModalDialogParams } from '@nativescript/angular';
import { Page } from '@nativescript/core';
import * as geolocation from '@nativescript/geolocation';
import { TrackingMode } from 'nativescript-mapbox-sdk';
import { MapService } from './../map.service';

@Component({
    selector: 'location',
    moduleId: module.id,
    templateUrl: './location.component.html',
    styleUrls: ['./location.component.scss'],
})
export class LocationComponent implements OnInit {
    constructor(public mapService: MapService, private params: ModalDialogParams, private page: Page) {
        this.page.on('unloaded', () => {
            this.params.closeCallback();
        });
    }

    ngOnInit(): void {}

    goBack() {
        this.params.closeCallback();
    }

    stopTracking() {
        this.params.closeCallback();
        this.mapService.isTracking = false;
        this.mapService.mapbox.location.stopTracking();
        this.mapService.mapbox.map.setAllGesturesEnabled(true);
    }

    showLocation() {
        this.params.closeCallback();
        this.mapService.isTracking = true;
        geolocation.enableLocationRequest().then(() => {
            this.mapService.mapbox.location.startTracking();
        });
    }

    trackLocationWithCompass() {
        this.params.closeCallback();
        geolocation.enableLocationRequest().then(() => {
            this.mapService.isTracking = true;
            this.mapService.mapbox.location
                .startTracking({
                    mode: TrackingMode.COMPASS,
                    animated: true,
                })
                .then(() => {
                    console.log('Finished Animation');
                });
        });
    }

    trackLocationWithGPS() {
        this.params.closeCallback();
        geolocation.enableLocationRequest().then(() => {
            this.mapService.isTracking = true;
            this.mapService.mapbox.map.setAllGesturesEnabled(false);
            this.mapService.mapbox.location
                .startTracking({
                    mode: TrackingMode.GPS,
                    animated: true,
                })
                .then(() => {
                    console.log('Finished Animation');
                });
        });
    }
}
