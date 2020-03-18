import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ModalDialogService, ModalDialogOptions } from 'nativescript-angular/modal-dialog';
import { LatLng } from 'nativescript-mapbox-sdk';
import { MapService } from './map.service';
import { StylesComponent } from './styles/styles.component';
import { OfflineComponent } from './offline/offline.component';
import { LocationComponent } from './location/location.component';
import { LayersComponent } from './layers/layers.component';

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

    constructor(private mapService: MapService, private modalService: ModalDialogService, private vcRef: ViewContainerRef) {}

    ngOnInit(): void {}

    onMapReady(args) {
        console.log(args.eventName);
        this.mapService.mapbox = args.object.mapbox;
        this.mapService.mapView = args.object.mapView;
        this.mapService.mapbox.map.addOnMapClickListener((latLng: LatLng) => {
            console.log(latLng);
            const features = this.mapService.mapbox.map.queryRenderedFeatures(latLng);
            console.log(features);
            this.mapService.mapbox.map.setCameraToBounds({north: 42.652580, south: 42.652580, east: -73.756233, west: -73}, 25, true);
        });
        this.mapService.mapbox.map.addOnMapLongClickListener((latLng: LatLng) => {
            console.log(latLng);
            const bounds = this.mapService.mapbox.map.getBounds();
            const features = this.mapService.mapbox.map.queryRenderedFeaturesByBounds(bounds);
            console.log(features);
        });
    }

    onStyleLoaded(args) {
        console.log(args.eventName);
    }

    showLocationModal() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            fullscreen: true,
        };

        return this.modalService.showModal(LocationComponent, options);
    }

    showOfflineModal() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            fullscreen: true,
        };

        return this.modalService.showModal(OfflineComponent, options);
    }

    showStylesModal() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            fullscreen: true,
        };

        return this.modalService.showModal(StylesComponent, options);
    }

    showLayersModal() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            fullscreen: true,
        };

        return this.modalService.showModal(LayersComponent, options);
    }
}
