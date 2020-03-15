import { isIOS, isAndroid } from 'tns-core-modules/platform';
import { ModalDialogParams } from 'nativescript-angular/modal-dialog';
import { Component, OnInit } from '@angular/core';
import { MapService } from './../map.service';
import { LayerType, MapboxColor } from 'nativescript-mapbox-sdk';
import { Color as tnsColor } from 'tns-core-modules/color';

declare const android, com, java: any;

@Component({
    selector: 'layers',
    moduleId: module.id,
    templateUrl: './layers.component.html',
    styleUrls: ['./layers.component.scss'],
})
export class LayersComponent implements OnInit {
    SHOW_ALL_WELLS = true;
    OIL = true;
    OILGAS = true;
    GAS = true;
    EOR = true;
    SWD = true;
    OTHER = true;

    vectorSource: any;

    constructor(public mapService: MapService, private params: ModalDialogParams) {}

    ngOnInit(): void {}

    goBack() {
        this.params.closeCallback();
    }

    removeHeatmapLayer() {
        this.mapService.mapbox.style.removeLayer(this.mapService.heatmapLayer);
        this.mapService.heatmapLayer = null;
        this.params.closeCallback();
    }

    addHeatmapLayer() {
        this.vectorSource = this.mapService.mapbox.style.addVectorSource('wells', 'mapbox://tvorpahl.b31830kk');
        if (isAndroid) {
            this.androidHeatmap();
        } else if (isIOS) {
            this.iosHeatmap();
        }

        this.params.closeCallback();
    }

    androidHeatmap() {
        const maxZoom = 12;
        this.mapService.heatmapLayer = this.mapService.mapbox.style.heatmap.create('heatmap-layer-id', this.vectorSource, 'wells', null, maxZoom);
        this.mapService.mapbox.style.heatmap.setHeatmapColor(this.mapService.heatmapLayer, [
            [0, new MapboxColor(255, 255, 255, 0.01)],
            [0.25, new MapboxColor(4, 179, 183)],
            [0.5, new MapboxColor(204, 211, 61)],
            [0.75, new MapboxColor(252, 167, 55)],
            [1.0, new MapboxColor(255, 78, 70)],
        ]);
        this.mapService.mapbox.style.heatmap.setHeatmapIntensity(this.mapService.heatmapLayer, [
            [0, 1],
            [maxZoom, 0.5],
        ]);
        this.mapService.mapbox.style.heatmap.setHeatmapRadius(this.mapService.heatmapLayer, [
            [0, 5],
            [maxZoom, 5],
        ]);
        this.mapService.mapbox.style.heatmap.setHeatmapOpacity(this.mapService.heatmapLayer, [
            [0, 1],
            [maxZoom, 1],
        ]);
        this.mapService.mapbox.style.addLayer(this.mapService.heatmapLayer);
    }

    iosHeatmap() {
        const maxZoom = 12;
        this.mapService.heatmapLayer = this.mapService.mapbox.style.heatmap.create('heatmap-layer-id', this.vectorSource, 'wells', null, maxZoom);

        let heatmapColorDictionary = new (NSDictionary as any)(
            [
                new tnsColor(0.01, 255, 255, 255).ios,
                new tnsColor(255, 4, 179, 183).ios,
                new tnsColor(255, 204, 211, 61).ios,
                new tnsColor(255, 252, 167, 55).ios,
                new tnsColor(255, 255, 78, 70).ios,
            ],
            [0, 0.25, 0.5, 0.75, 1.0]
        );
        let heatmapColorArray = NSArray.arrayWithArray([heatmapColorDictionary]);
        this.mapService.heatmapLayer.heatmapColor = NSExpression.expressionWithFormatArgumentArray(
            "mgl_interpolate:withCurveType:parameters:stops:($heatmapDensity, 'linear', nil, %@)",
            heatmapColorArray
        );

        // [0, 1],
        // [maxZoom, 0.5]
        let heatmapIntensityDictionary = new (NSDictionary as any)([1, 0.5], [0, maxZoom]);
        let heatmapIntensityArray = NSArray.arrayWithArray([heatmapIntensityDictionary]);
        this.mapService.heatmapLayer.heatmapIntensity = NSExpression.expressionWithFormatArgumentArray(
            "mgl_interpolate:withCurveType:parameters:stops:($zoomLevel, 'linear', nil, %@)",
            heatmapIntensityArray
        );

        // [0, 5],
        // [maxZoom, 5]
        let heatmapRadiusDictionary = new (NSDictionary as any)([5, 5], [0, maxZoom]);
        let heatmapRadiusArray = NSArray.arrayWithArray([heatmapRadiusDictionary]);
        this.mapService.heatmapLayer.heatmapRadius = NSExpression.expressionWithFormatArgumentArray(
            "mgl_interpolate:withCurveType:parameters:stops:($zoomLevel, 'linear', nil, %@)",
            heatmapRadiusArray
        );

        // [0, 1],
        // [maxZoom, 1]
        let heatmapOpacityDictionary = new (NSDictionary as any)([1, 1], [0, maxZoom]);
        let heatmapOpacityArray = NSArray.arrayWithArray([heatmapOpacityDictionary]);
        this.mapService.heatmapLayer.heatmapOpacity = NSExpression.expressionWithFormatArgumentArray(
            "mgl_interpolate:withCurveType:parameters:stops:($zoomLevel, 'linear', nil, %@)",
            heatmapOpacityArray
        );

        this.mapService.mapbox.style.addLayer(this.mapService.heatmapLayer);
    }

    removeSymbolLayer() {
        if (isIOS) {
            return; // TODO
        }

        this.mapService.mapbox.style.removeLayer(this.mapService.symbolLayer);
        this.mapService.symbolLayer = null;
        this.params.closeCallback();
    }

    addSymbolLayer() {
        if (isIOS) {
            return; // TODO
        }

        this.mapService.symbolLayer = this.mapService.mapbox.style.createLayer(LayerType.SYMBOL, 'symbol-layer-id', 'wells', null, null);

        this.mapService.mapbox.style.addImage('OIL', 'images/types/oil.png');
        this.mapService.mapbox.style.addImage('GAS', 'images/types/gas.png');
        this.mapService.mapbox.style.addImage('OILGAS', 'images/types/oilgas.png');
        this.mapService.mapbox.style.addImage('EOR', 'images/types/eor.png');
        this.mapService.mapbox.style.addImage('SWD', 'images/types/swd.png');
        this.mapService.mapbox.style.addImage('OTHER', 'images/types/other.png');

        const get = com.mapbox.mapboxsdk.style.expressions.Expression.get;
        const iconImage = com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconImage;
        const iconAllowOverlap = com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconAllowOverlap;
        const iconIgnorePlacement = com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconIgnorePlacement;
        const textAllowOverlap = com.mapbox.mapboxsdk.style.layers.PropertyFactory.textAllowOverlap;
        const iconSize = com.mapbox.mapboxsdk.style.layers.PropertyFactory.iconSize;

        this.mapService.symbolLayer.setProperties([
            iconImage(get('TYPE')),
            iconSize(new java.lang.Double(2.0)),
            iconAllowOverlap(new java.lang.Boolean(true)),
            iconIgnorePlacement(new java.lang.Boolean(true)),
            textAllowOverlap(new java.lang.Boolean(true)),
        ]);

        this.mapService.mapbox.style.addLayer(this.mapService.symbolLayer);
        this.params.closeCallback();
    }

    filter() {
        if (isIOS) {
            return; // TODO
        }

        const randomBoolean = () => Math.random() >= 0.5;
        this.OIL = randomBoolean();
        this.OILGAS = randomBoolean();
        this.GAS = randomBoolean();
        this.EOR = randomBoolean();
        this.SWD = randomBoolean();
        this.OTHER = randomBoolean();
        this.SHOW_ALL_WELLS = randomBoolean();

        const get = com.mapbox.mapboxsdk.style.expressions.Expression.get;
        const eq = com.mapbox.mapboxsdk.style.expressions.Expression.eq;
        const any = com.mapbox.mapboxsdk.style.expressions.Expression.any;
        const all = com.mapbox.mapboxsdk.style.expressions.Expression.all;

        const createExpression = (type: string, showAllWells: boolean) => {
            if (showAllWells) {
                return eq(get('TYPE'), type);
            } else {
                return all([eq(get('TYPE'), type), eq(get('VISIBLE'), true)]);
            }
        };

        let expressions = [];
        if (this.OIL) expressions.push(createExpression('OIL', this.SHOW_ALL_WELLS));
        if (this.OILGAS) expressions.push(createExpression('OILGAS', this.SHOW_ALL_WELLS));
        if (this.GAS) expressions.push(createExpression('GAS', this.SHOW_ALL_WELLS));
        if (this.EOR) expressions.push(createExpression('EOR', this.SHOW_ALL_WELLS));
        if (this.SWD) expressions.push(createExpression('SWD', this.SHOW_ALL_WELLS));
        if (this.OTHER) expressions.push(createExpression('OTHER', this.SHOW_ALL_WELLS));
        const expression = any(expressions);

        if (this.mapService.heatmapLayer) this.mapService.heatmapLayer.setFilter(expression);
        if (this.mapService.symbolLayer) this.mapService.symbolLayer.setFilter(expression);

        this.params.closeCallback();
    }
}
