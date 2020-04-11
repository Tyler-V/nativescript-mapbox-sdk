import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ModalDialogService, ModalDialogOptions } from 'nativescript-angular/modal-dialog';
import { LatLng, SymbolLayerOptions, MapboxColor, LayerOptions, Feature } from 'nativescript-mapbox-sdk';
import { MapService } from './map.service';
import { StylesComponent } from './styles/styles.component';
import { OfflineComponent } from './offline/offline.component';
import { LocationComponent } from './location/location.component';
import { LayersComponent } from './layers/layers.component';
import { isAndroid, isIOS } from 'tns-core-modules/platform';
import { android as androidApp } from 'tns-core-modules/application';

declare const com, java, android;

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
            const features = this.mapService.mapbox.map.queryRenderedFeatures(latLng, 'symbol-layer-id');
            console.log(features);
            if (features.length > 0) {
                this.setupSymbolLayer(features[0]);
            }
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
        this.mapService.mapbox.style.addVectorSource('wells', 'mapbox://tvorpahl.b31830kk');
        this.addHeatmapLayer();
        this.addSymbolLayer();
    }

    onCameraMove(args) {
        console.log(args.eventName);
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

    setupSymbolLayer(feature: Feature) {
        let resourceId = androidApp.context
            .getResources()
            .getIdentifier('activity_query_feature_window_symbol_layer', 'layout', androidApp.context.getPackageName());

        const inflater = android.view.LayoutInflater.from(androidApp.foregroundActivity);
        const bubbleLayout = inflater.inflate(resourceId, null);

        const titleTextViewId = androidApp.context.getResources().getIdentifier('info_window_title', 'id', androidApp.context.getPackageName());
        const titleTextView = bubbleLayout.findViewById(titleTextViewId);
        titleTextView.setText(feature.properties.NAME);

        const propertiesListTextId = androidApp.context
            .getResources()
            .getIdentifier('info_window_feature_properties_list', 'id', androidApp.context.getPackageName());
        const propertiesListTextView = bubbleLayout.findViewById(propertiesListTextId);
        propertiesListTextView.setText(feature.properties.API);

        const image = this.generateBitmapFromView(bubbleLayout);
        this.mapService.mapbox.style.addImage('callout-image-id', image);

        const symbolLayer = new com.mapbox.mapboxsdk.style.layers.SymbolLayer('callout-layer-id', 'wells');
        symbolLayer.setSourceLayer('wells');

        const floatArray = (<any>Array).create('java.lang.Float', 2);
        floatArray[0] = new java.lang.Float(0);
        floatArray[1] = new java.lang.Float(-15);

        const properties = [];
        properties.push(com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconImage('callout-image-id'));
        properties.push(com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconAnchor('bottom'));
        properties.push(com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconAllowOverlap(new java.lang.Boolean(false)));
        properties.push(com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconIgnorePlacement(new java.lang.Boolean(false)));
        properties.push(com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconOffset(floatArray));
        symbolLayer.setProperties(properties);

        this.mapService.mapbox.style.addLayer(symbolLayer);
    }

    generateBitmapFromView(view) {
        const measureSpec = android.view.View.MeasureSpec.makeMeasureSpec(0, android.view.View.MeasureSpec.UNSPECIFIED);
        view.measure(measureSpec, measureSpec);
        const measuredWidth = view.getMeasuredWidth();
        const measuredHeight = view.getMeasuredHeight();
        view.layout(0, 0, measuredWidth, measuredHeight);
        const bitmap = android.graphics.Bitmap.createBitmap(measuredWidth, measuredHeight, android.graphics.Bitmap.Config.ARGB_8888);
        bitmap.eraseColor(android.graphics.Color.TRANSPARENT);
        const canvas = new android.graphics.Canvas(bitmap);
        view.draw(canvas);
        return bitmap;
    }
}
