import { Page, isIOS, isAndroid } from 'tns-core-modules/ui/page';
import { ModalDialogParams } from 'nativescript-angular/modal-dialog';
import { Component, OnInit } from '@angular/core';
import { MapService } from './../map.service';
import { LayerType, Color } from 'nativescript-mapbox-sdk';

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

    constructor(public mapService: MapService, private params: ModalDialogParams, private page: Page) {
        this.page.on('unloaded', () => {
            this.params.closeCallback();
        });
    }

    ngOnInit(): void {}

    goBack() {
        this.params.closeCallback();
    }

    removeHeatmapLayer() {
        if (isIOS) {
            return; // TODO
        }

        this.mapService.mapbox.style.removeLayer(this.mapService.heatmapLayer);
        this.mapService.heatmapLayer = null;
        this.params.closeCallback();
    }

    addHeatmapLayer() {
        if (isAndroid) {
            this.androidHeatmap();
        } else if (isIOS) {
            this.iosHeatmap();
        }

        this.params.closeCallback();
    }

    androidHeatmap() {
        const maxZoom = 12;
        this.mapService.heatmapLayer = this.mapService.mapbox.style.heatmap.create('heatmap-layer-id', 'wells', null, maxZoom);
        this.mapService.mapbox.style.heatmap.setHeatmapColor(this.mapService.heatmapLayer, [
            [0, new Color(255, 255, 255, 0.01)],
            [0.25, new Color(4, 179, 183)],
            [0.5, new Color(204, 211, 61)],
            [0.75, new Color(252, 167, 55)],
            [1.0, new Color(255, 78, 70)],
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
        const source = this.mapService.mapView.style.addVectorSource('wells', 'mapbox://tvorpahl.b31830kk');
        let heatmapLayer = MGLHeatmapStyleLayer.alloc().initWithIdentifierSource('wells', source);
        heatmapLayer.maximumZoomLevel = 12;

        // let colorDictionary: [NSNumber: UIColor] = [
        //     0.0: .clear,
        //     0.01: .white,
        //     0.15: UIColor(red: 0.19, green: 0.30, blue: 0.80, alpha: 1.0),
        //     0.5: UIColor(red: 0.73, green: 0.23, blue: 0.25, alpha: 1.0),
        //     1: .yellow
        //     ]

        // let colorDictionary = [
        //     [0.0, UIColor.colorWithRedGreenBlueAlpha(255, 255, 255, 0.01)],
        //     [0.25, UIColor.colorWithRedGreenBlueAlpha(4, 179, 183, 255)],
        //     [0.5, UIColor.colorWithRedGreenBlueAlpha(204, 211, 61, 255)],
        //     [0.75, UIColor.colorWithRedGreenBlueAlpha(252, 167, 55, 255)],
        //     [1.0, UIColor.colorWithRedGreenBlueAlpha(255, 78, 70, 255)],
        // ];

        // [0: 0,
        //     6: 1]

        // const nsArray = NSArray.arrayWithObject()

        // heatmapLayer.heatmapWeight = NSExpression.expressionWithFormatArgumentArray("mgl_interpolate:withCurveType:parameters:stops:(magnitude, 'linear', nil, %@)",
        // [0: 0,
        //  6: 1]);

        this.mapService.mapbox.style.addLayer(heatmapLayer);
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
