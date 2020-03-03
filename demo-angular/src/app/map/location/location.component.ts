import { Page } from 'tns-core-modules/ui/page';
import { ModalDialogParams } from 'nativescript-angular/modal-dialog';
import { Component, OnInit } from '@angular/core';
import { MapService } from './../map.service';
import * as geolocation from 'nativescript-geolocation';
import { CameraMode, RenderMode } from 'nativescript-mapbox-sdk';

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
            this.mapService.mapbox.location.startTracking({
                cameraMode: CameraMode.NONE,
                renderMode: RenderMode.NORMAL,
            });
        });
    }

    trackLocation() {
        this.params.closeCallback();
        geolocation.enableLocationRequest().then(() => {
            this.mapService.isTracking = true;
            this.mapService.mapbox.location.startTracking({
                cameraMode: CameraMode.TRACKING_COMPASS,
                renderMode: RenderMode.COMPASS,
                zoom: 16,
                animationDuration: 1000,
                onCameraTrackingDismissed: () => {
                    this.mapService.mapbox.location.stopTracking();
                    this.mapService.isTracking = false;
                },
            });
        });
    }

    drivingMode() {
        this.params.closeCallback();
        geolocation.enableLocationRequest().then(() => {
            this.mapService.isTracking = true;
            this.mapService.mapbox.map.setAllGesturesEnabled(false);
            this.mapService.mapbox.location.startTracking({
                cameraMode: CameraMode.TRACKING_GPS,
                renderMode: RenderMode.GPS,
                zoom: 19,
                tilt: 45,
                animationDuration: 2000,
            });
        });
    }
}
