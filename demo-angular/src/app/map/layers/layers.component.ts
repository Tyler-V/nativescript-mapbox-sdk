import { Page } from 'tns-core-modules/ui/page';
import { ModalDialogParams } from 'nativescript-angular/modal-dialog';
import { Component, OnInit } from '@angular/core';
import { MapService } from './../map.service';
import { LayerType } from 'nativescript-mapbox-sdk';
import { Color } from 'tns-core-modules/color';

declare const android, com, java: any;
const get = com.mapbox.mapboxsdk.style.expressions.Expression.get;
const eq = com.mapbox.mapboxsdk.style.expressions.Expression.eq;
const literal = com.mapbox.mapboxsdk.style.expressions.Expression.literal;
const bool = com.mapbox.mapboxsdk.style.expressions.Expression.bool;
const toBool = com.mapbox.mapboxsdk.style.expressions.Expression.toBool;
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
        this.mapService.mapbox.style.removeLayer(this.mapService.heatmapLayer);
        this.mapService.heatmapLayer = null;
        this.params.closeCallback();
    }

    addHeatmapLayer() {
        const maxZoom = 12;
        this.mapService.heatmapLayer = this.mapService.mapbox.style.createLayer(LayerType.HEATMAP, 'heatmap-layer-id', 'wells', null, maxZoom);

        const array = [
            ['0', '1'],
            ['5', '0'],
        ];
        this.mapService.mapbox.style.heatmap.heatmapWeight(array);

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

        this.mapService.heatmapLayer.setProperties([_heatmapColor, _heatmapRadius, _heatmapIntensity, _heatmapOpacity]);
        this.mapService.mapbox.style.addLayer(this.mapService.heatmapLayer);

        this.params.closeCallback();
    }

    removeSymbolLayer() {
        this.mapService.mapbox.style.removeLayer(this.mapService.symbolLayer);
        this.mapService.symbolLayer = null;
        this.params.closeCallback();
    }

    addSymbolLayer() {
        this.mapService.symbolLayer = this.mapService.mapbox.style.createLayer(LayerType.SYMBOL, 'symbol-layer-id', 'wells', null, null);

        this.mapService.mapbox.style.addImage('OIL', 'images/types/oil.png');
        this.mapService.mapbox.style.addImage('GAS', 'images/types/gas.png');
        this.mapService.mapbox.style.addImage('OILGAS', 'images/types/oilgas.png');
        this.mapService.mapbox.style.addImage('EOR', 'images/types/eor.png');
        this.mapService.mapbox.style.addImage('SWD', 'images/types/swd.png');
        this.mapService.mapbox.style.addImage('OTHER', 'images/types/other.png');

        this.mapService.symbolLayer.setProperties([
            iconImage(get('TYPE')),
            iconSize(new java.lang.Float(2.0)),
            iconAllowOverlap(new java.lang.Boolean(true)),
            iconIgnorePlacement(new java.lang.Boolean(true)),
            textAllowOverlap(new java.lang.Boolean(true)),
        ]);

        this.mapService.mapbox.style.addLayer(this.mapService.symbolLayer);
        this.params.closeCallback();
    }

    filter() {
        const randomBoolean = () => Math.random() >= 0.5;
        this.OIL = randomBoolean();
        this.OILGAS = randomBoolean();
        this.GAS = randomBoolean();
        this.EOR = randomBoolean();
        this.SWD = randomBoolean();
        this.OTHER = randomBoolean();
        this.SHOW_ALL_WELLS = randomBoolean();

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
