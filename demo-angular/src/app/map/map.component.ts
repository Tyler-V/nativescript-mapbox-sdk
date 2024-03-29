import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ModalDialogService, ModalDialogOptions } from '@nativescript/angular';
import { LatLng, MapPanEvent } from 'nativescript-mapbox-sdk';
import { MapService } from './map.service';
import { StylesComponent } from './styles/styles.component';
import { LocationComponent } from './location/location.component';
import { LayersComponent } from './layers/layers.component';
import { AndroidCalloutService } from './callouts/android-callout.service';
import { IOSCalloutService } from './callouts/ios-callout.service';

@Component({
    selector: 'map',
    moduleId: module.id,
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    providers: [AndroidCalloutService, IOSCalloutService],
})
export class MapComponent implements OnInit {
    showMap: boolean = false;
    accessToken: string = 'sk.eyJ1IjoidHZvcnBhaGwiLCJhIjoiY2s1dml5YXlxMHNncTNnbXgzNXVnYXQ0NyJ9.y0ofxDzXB4vi6KW372rLEQ';
    mapStyle: string = 'mapbox://styles/mapbox/streets-v11';
    latitude: number = 39.8283;
    longitude: number = -98.5795;
    zoom: number = 2.5;
    minZoom: number = 0;
    maxZoom: number = 22;
    bearing: number = 0;
    tilt: number = 0;

    calloutLayer: any;

    constructor(
        private mapService: MapService,
        private modalService: ModalDialogService,
        private vcRef: ViewContainerRef,
        private androidCalloutService: AndroidCalloutService,
        private iosCalloutService: IOSCalloutService
    ) {}

    ngOnInit(): void {}

    onMapReady(event) {
        console.log(event.eventName);
        this.mapService.mapboxView = event.object;
        this.mapService.mapbox = event.object.mapbox;
        this.mapService.mapView = event.object.mapView;

        this.mapService.mapbox.map.addOnMapClickListener((latLng: LatLng) => {
            console.log(`MapClickListener ${JSON.stringify(latLng)}`);
        });

        this.mapService.mapbox.map.addOnMapLongClickListener((latLng: LatLng) => {
            console.log(`MapLongClickListener ${JSON.stringify(latLng)}`);
        });

        this.mapService.mapbox.map.addOnMapPanListener((event: MapPanEvent) => {
            console.log(`MapPanListener ${event}`);
        });

        this.mapService.mapReady.next(true);
    }

    onStyleLoaded(event) {
        console.log(event.eventName);
        this.mapService.mapbox.style.addVectorSource('wells', 'mapbox://tvorpahl.b31830kk');
    }

    onMapIdle(event) {
        console.log(event.eventName);
        console.log(this.mapService.mapbox.map.getZoom());
    }

    showLocationModal() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            fullscreen: false,
        };

        return this.modalService.showModal(LocationComponent, options);
    }

    showOfflineModal() {}

    showStylesModal() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            fullscreen: false,
        };

        return this.modalService.showModal(StylesComponent, options);
    }

    showLayersModal() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            fullscreen: false,
        };

        return this.modalService.showModal(LayersComponent, options);
    }
}
