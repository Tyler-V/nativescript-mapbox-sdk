import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ModalDialogService, ModalDialogOptions } from 'nativescript-angular/modal-dialog';
import { LatLng, RenderMode, CameraMode } from 'nativescript-mapbox-sdk';
import * as geolocation from 'nativescript-geolocation';
import { MapService } from './map.service';
import { StylesComponent } from './styles/styles.component';
import { OfflineComponent } from './offline/offline.component';

declare const android, com, java, org: any;
const get = com.mapbox.mapboxsdk.style.expressions.Expression.get;
const eq = com.mapbox.mapboxsdk.style.expressions.Expression.eq;
const iconImage = com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconImage;
const iconAllowOverlap = com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconAllowOverlap;
const iconIgnorePlacement = com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconIgnorePlacement;
const textAllowOverlap = com.mapbox.mapboxsdk.style.layers.PropertyFactory.textAllowOverlap;
const any = com.mapbox.mapboxsdk.style.expressions.Expression.any;
const all = com.mapbox.mapboxsdk.style.expressions.Expression.all;
const heatmapColor = com.mapbox.mapboxsdk.style.layers.PropertyFactory.heatmapColor;
const heatmapIntensity = com.mapbox.mapboxsdk.style.layers.PropertyFactory.heatmapIntensity;
const heatmapOpacity = com.mapbox.mapboxsdk.style.layers.PropertyFactory.heatmapOpacity;
const heatmapRadius = com.mapbox.mapboxsdk.style.layers.PropertyFactory.heatmapRadius;
const interpolate = com.mapbox.mapboxsdk.style.expressions.Expression.interpolate;
const heatmapDensity = com.mapbox.mapboxsdk.style.expressions.Expression.heatmapDensity;
const linear = com.mapbox.mapboxsdk.style.expressions.Expression.linear;
const rgb = com.mapbox.mapboxsdk.style.expressions.Expression.rgb;
const rgba = com.mapbox.mapboxsdk.style.expressions.Expression.rgba;
const zoom = com.mapbox.mapboxsdk.style.expressions.Expression.zoom;
const stop = com.mapbox.mapboxsdk.style.expressions.Expression.stop;
const iconSize = com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconSize;

@Component({
    selector: 'map',
    moduleId: module.id,
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
    accessToken: string;
    mapStyle: string;
    latitude = 39.8283;
    longitude = -98.5795;
    zoom = 2.5;
    minZoom = 0;
    maxZoom = 22;
    bearing = 0;
    tilt = 0;

    showMap: boolean;

    isTracking: boolean = false;

    constructor(private mapService: MapService, private modalService: ModalDialogService, private vcRef: ViewContainerRef) {
        this.accessToken = 'sk.eyJ1IjoidHZvcnBhaGwiLCJhIjoiY2s1dml5YXlxMHNncTNnbXgzNXVnYXQ0NyJ9.y0ofxDzXB4vi6KW372rLEQ';
        this.mapStyle = 'mapbox://styles/mapbox/streets-v11';
    }

    ngOnInit(): void {}

    onMapReady(args) {
        console.log(args.eventName);
        this.mapService.mapbox = args.object.mapbox;
        this.mapService.mapbox.map.addOnMapClickListener((latLng: LatLng) => {
            this.mapService.mapbox.annotation.addCircle();
        });
        this.mapService.mapbox.map.addOnMapLongClickListener((latLng: LatLng) => {
            const features = this.mapService.mapbox.map.queryRenderedFeatures(latLng);
            console.log(features);
        });
    }

    onStyleLoaded(args) {
        this.addVectorSource();
        this.addSymbolLayer();
        this.addHeatmapLayer();
    }

    addVectorSource() {
        const vectorSource = new com.mapbox.mapboxsdk.style.sources.VectorSource('wells', 'mapbox://tvorpahl.b39qo3tq');
        this.mapService.mapbox.style.addSource(vectorSource);
    }

    addHeatmapLayer() {
        const heatmapLayer = new com.mapbox.mapboxsdk.style.layers.HeatmapLayer('heatmap-layer-id', 'wells');
        heatmapLayer.setSourceLayer('wells');
        const maxZoom = 12;
        heatmapLayer.setMaxZoom(maxZoom);

        const _heatmapColor = heatmapColor(
            interpolate(linear(), heatmapDensity(), [
                stop(
                    new java.lang.Float(0.01),
                    rgba(new java.lang.Integer(255), new java.lang.Integer(255), new java.lang.Integer(255), new java.lang.Integer(0.01))
                ),
                stop(new java.lang.Float(0.25), rgb(new java.lang.Integer(4), new java.lang.Integer(179), new java.lang.Integer(183))),
                stop(new java.lang.Float(0.5), rgb(new java.lang.Integer(204), new java.lang.Integer(211), new java.lang.Integer(61))),
                stop(new java.lang.Float(0.75), rgb(new java.lang.Integer(252), new java.lang.Integer(167), new java.lang.Integer(55))),
                stop(new java.lang.Float(0.9), rgb(new java.lang.Integer(255), new java.lang.Integer(78), new java.lang.Integer(70))),
            ])
        );

        const _heatmapIntensity = heatmapIntensity(
            interpolate(linear(), zoom(), [
                stop(new java.lang.Integer(0), new java.lang.Float(1.0)),
                stop(new java.lang.Integer(maxZoom), new java.lang.Float(0.5)),
            ])
        );

        const _heatmapRadius = heatmapRadius(
            interpolate(linear(), zoom(), [
                stop(new java.lang.Integer(0), new java.lang.Integer(5)),
                stop(new java.lang.Integer(maxZoom), new java.lang.Integer(10)),
            ])
        );

        const _heatmapOpacity = heatmapOpacity(
            interpolate(linear(), zoom(), [
                stop(new java.lang.Integer(0), new java.lang.Float(1.0)),
                stop(new java.lang.Integer(maxZoom), new java.lang.Float(1.0)),
            ])
        );

        heatmapLayer.setProperties([_heatmapColor, _heatmapRadius, _heatmapIntensity, _heatmapOpacity]);

        const VISIBLE = true;
        heatmapLayer.setFilter(
            any([
                all([eq(get('TYPE'), 'OIL'), eq(get('VISIBLE'), VISIBLE)]),
                all([eq(get('TYPE'), 'GAS'), eq(get('VISIBLE'), VISIBLE)]),
                all([eq(get('TYPE'), 'OILGAS'), eq(get('VISIBLE'), VISIBLE)]),
                all([eq(get('TYPE'), 'EOR'), eq(get('VISIBLE'), VISIBLE)]),
                all([eq(get('TYPE'), 'SWD'), eq(get('VISIBLE'), VISIBLE)]),
                all([eq(get('TYPE'), 'OTHER'), eq(get('VISIBLE'), VISIBLE)]),
            ])
        );

        this.mapService.mapbox.style.addLayer(heatmapLayer);
    }

    addSymbolLayer() {
        const symbolLayer = new com.mapbox.mapboxsdk.style.layers.SymbolLayer('symbol-layer-id', 'wells');
        symbolLayer.setSourceLayer('wells');
        symbolLayer.setMinZoom(12);

        this.mapService.mapbox.style.addImage('OIL', 'images/types/oil.png');
        this.mapService.mapbox.style.addImage('GAS', 'images/types/gas.png');
        this.mapService.mapbox.style.addImage('OILGAS', 'images/types/oilgas.png');
        this.mapService.mapbox.style.addImage('EOR', 'images/types/eor.png');
        this.mapService.mapbox.style.addImage('SWD', 'images/types/swd.png');
        this.mapService.mapbox.style.addImage('OTHER', 'images/types/other.png');

        symbolLayer.setProperties([
            iconImage(get('TYPE')),
            iconSize(new java.lang.Float(2.0)),
            iconAllowOverlap(new java.lang.Boolean(true)),
            iconIgnorePlacement(new java.lang.Boolean(true)),
            textAllowOverlap(new java.lang.Boolean(true)),
        ]);

        const VISIBLE = true;
        symbolLayer.setFilter(
            any([
                all([eq(get('TYPE'), 'OIL'), eq(get('VISIBLE'), VISIBLE)]),
                all([eq(get('TYPE'), 'GAS'), eq(get('VISIBLE'), VISIBLE)]),
                all([eq(get('TYPE'), 'OILGAS'), eq(get('VISIBLE'), VISIBLE)]),
                all([eq(get('TYPE'), 'EOR'), eq(get('VISIBLE'), VISIBLE)]),
                all([eq(get('TYPE'), 'SWD'), eq(get('VISIBLE'), VISIBLE)]),
                all([eq(get('TYPE'), 'OTHER'), eq(get('VISIBLE'), VISIBLE)]),
            ])
        );

        this.mapService.mapbox.style.addLayer(symbolLayer);
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
