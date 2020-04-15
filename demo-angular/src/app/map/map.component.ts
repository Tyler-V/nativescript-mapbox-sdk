import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ModalDialogService, ModalDialogOptions } from 'nativescript-angular/modal-dialog';
import { LatLng, SymbolLayerOptions, MapboxColor, LayerOptions, Feature } from 'nativescript-mapbox-sdk';
import { MapService } from './map.service';
import { StylesComponent } from './styles/styles.component';
import { OfflineComponent } from './offline/offline.component';
import { LocationComponent } from './location/location.component';
import { LayersComponent } from './layers/layers.component';
import { isAndroid, isIOS } from 'tns-core-modules/platform';
import { AndroidCalloutService } from './callouts/android-callout.service';
import { IOSCalloutService } from './callouts/ios-callout.service';

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

    calloutLayer: any;
    annotation: MGLPointAnnotation;

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

        if (isIOS) {
            this.mapService.mapboxView.on('tapOnCalloutForAnnotation', (data) => {
                console.log('navigate to well detail');
            });
            this.mapService.mapbox.map.addOnMapClickListener((latLng: LatLng) => {
                const symbolLayers = this.mapService.mapbox.map.queryRenderedFeatures(latLng, 'symbol-layer-id');
                if (symbolLayers.length > 0) {
                    this.iosCalloutService.addAnnotation(symbolLayers[0]);
                }
            });
        }

        if (isAndroid) {
            this.mapService.mapbox.map.addOnMapClickListener((latLng: LatLng) => {
                const calloutLayers = this.mapService.mapbox.map.queryRenderedFeatures(latLng, 'callout-layer-id');
                if (calloutLayers.length > 0) {
                    this.androidCalloutService.removeCalloutLayer();
                    console.log('navigate to well detail');
                    return;
                } else {
                    const symbolLayers = this.mapService.mapbox.map.queryRenderedFeatures(latLng, 'symbol-layer-id');
                    if (symbolLayers.length > 0) {
                        this.androidCalloutService.addCalloutLayer(symbolLayers[0]);
                    } else {
                        this.androidCalloutService.removeCalloutLayer();
                    }
                }
            });
        }

        this.mapService.mapbox.map.addOnMapLongClickListener((latLng: LatLng) => {
            console.log(latLng);
            const bounds = this.mapService.mapbox.map.getBounds();
            const features = this.mapService.mapbox.map.queryRenderedFeaturesByBounds(bounds);
            console.log(features);
        });
    }

    onStyleLoaded(event) {
        console.log(event.eventName);
        this.mapService.mapbox.style.addVectorSource('wells', 'mapbox://tvorpahl.b31830kk');
        this.addHeatmapLayer();
        this.addSymbolLayer();
    }

    onCameraMove(event) {
        console.log(event.eventName);
        console.log(this.mapService.mapbox.map.getZoom());
    }

    showLocationModal() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            fullscreen: true,
        };

        return this.modalService.showModal(LocationComponent, options);
    }

    showOfflineModal() {}

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

    private addHeatmapLayer() {
        const options: LayerOptions = {
            maxZoom: 13,
        };
        this.mapService.heatmapLayer = this.mapService.mapbox.style.layers.heatmap.create('heatmap-layer-id', 'wells', options);
        this.mapService.mapbox.style.layers.heatmap.setHeatmapColor(this.mapService.heatmapLayer, [
            [0, new MapboxColor(255, 255, 255, 0.01)],
            [0.25, new MapboxColor(4, 179, 183)],
            [0.5, new MapboxColor(204, 211, 61)],
            [0.75, new MapboxColor(252, 167, 55)],
            [1.0, new MapboxColor(255, 78, 70)],
        ]);
        this.mapService.mapbox.style.layers.heatmap.setHeatmapIntensity(this.mapService.heatmapLayer, [
            [0, 3],
            [options.maxZoom, 1],
        ]);
        this.mapService.mapbox.style.layers.heatmap.setHeatmapRadius(this.mapService.heatmapLayer, [
            [0, 3],
            [10, 8],
            [options.maxZoom, 25],
        ]);
        this.mapService.mapbox.style.layers.heatmap.setHeatmapOpacity(this.mapService.heatmapLayer, [
            [0, 1],
            [options.maxZoom, 1],
        ]);
        this.mapService.mapbox.style.addLayer(this.mapService.heatmapLayer);
    }

    private addSymbolLayer() {
        this.mapService.mapbox.style.addImageFromPath('OIL', 'images/types/oil.png');
        this.mapService.mapbox.style.addImageFromPath('GAS', 'images/types/gas.png');
        this.mapService.mapbox.style.addImageFromPath('OILGAS', 'images/types/oilgas.png');
        this.mapService.mapbox.style.addImageFromPath('EOR', 'images/types/eor.png');
        this.mapService.mapbox.style.addImageFromPath('SWD', 'images/types/swd.png');
        this.mapService.mapbox.style.addImageFromPath('OTHER', 'images/types/other.png');

        const options: SymbolLayerOptions = {
            minZoom: 13,
            iconImageKey: 'TYPE',
            iconSize: isAndroid ? 2 : 0.75,
            iconAllowOverlap: true,
            iconIgnorePlacement: true,
        };
        this.mapService.symbolLayer = this.mapService.mapbox.style.layers.symbolLayer.create('symbol-layer-id', 'wells', options);
        this.mapService.mapbox.style.addLayer(this.mapService.symbolLayer);
    }
}
