import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ModalDialogService, ModalDialogOptions } from 'nativescript-angular/modal-dialog';
import { RenderMode, CameraMode } from 'nativescript-mapbox-sdk';
import * as geolocation from 'nativescript-geolocation';
import { MapService } from './map.service';
import { StylesComponent } from './styles/styles.component';
import { OfflineComponent } from './offline/offline.component';

@Component({
    selector: 'map',
    moduleId: module.id,
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
    accessToken: string = 'sk.eyJ1IjoidHZvcnBhaGwiLCJhIjoiY2s1dml5YXlxMHNncTNnbXgzNXVnYXQ0NyJ9.y0ofxDzXB4vi6KW372rLEQ';
    mapStyle: string = 'mapbox://styles/mapbox/streets-v11';
    latitude: number = 39.8283;
    longitude: number = -98.5795;
    zoom: number = 2.5;
    minZoom: number = 0;
    maxZoom: number = 22;
    bearing: number = 0;
    tilt: number = 0;

    isTracking: boolean = false;

    constructor(private mapService: MapService, private modalService: ModalDialogService, private vcRef: ViewContainerRef) {}

    ngOnInit(): void {}

    onMapReady(args) {
        console.log(args.eventName);
        this.mapService.mapbox = args.object.mapbox;
    }

    onStyleLoaded(args) {
        console.log(args.eventName);
    }

    showLocation() {
        geolocation.enableLocationRequest().then(() => {
            this.mapService.mapbox.location.startTracking({
                cameraMode: CameraMode.NONE,
                renderMode: RenderMode.NORMAL,
            });
        });
    }

    trackUser() {
        geolocation.enableLocationRequest().then(() => {
            this.mapService.mapbox.location.startTracking({
                cameraMode: CameraMode.TRACKING_COMPASS,
                renderMode: RenderMode.COMPASS,
                zoom: 16,
                tilt: 0,
                animationDuration: 1000,
                onCameraTrackingDismissed: () => {
                    this.mapService.mapbox.location.stopTracking();
                },
            });
        });
    }

    drivingMode() {
        if (this.isTracking) {
            this.isTracking = false;
            this.mapService.mapbox.location.stopTracking();
            this.mapService.mapbox.map.setAllGesturesEnabled(true);
        } else {
            geolocation.enableLocationRequest().then(() => {
                this.isTracking = true;
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

    showOfflineModal() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            fullscreen: false,
        };

        return this.modalService.showModal(OfflineComponent, options);
    }

    showStylesModal() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            fullscreen: false,
        };

        return this.modalService.showModal(StylesComponent, options);
    }
}
