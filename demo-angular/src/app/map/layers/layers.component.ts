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

    constructor(public mapService: MapService, private params: ModalDialogParams) {}

    ngOnInit() {
        this.mapService.mapbox.style.addVectorSource('wells', 'mapbox://tvorpahl.b31830kk');
    }

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
        this.mapService.heatmapLayer = this.mapService.mapbox.style.layers.heatmap.create('heatmap-layer-id', 'wells', null, maxZoom);
        this.mapService.mapbox.style.layers.heatmap.setHeatmapColor(this.mapService.heatmapLayer, [
            [0, new MapboxColor(255, 255, 255, 0.01)],
            [0.25, new MapboxColor(4, 179, 183)],
            [0.5, new MapboxColor(204, 211, 61)],
            [0.75, new MapboxColor(252, 167, 55)],
            [1.0, new MapboxColor(255, 78, 70)],
        ]);
        this.mapService.mapbox.style.layers.heatmap.setHeatmapIntensity(this.mapService.heatmapLayer, [
            [0, 1],
            [maxZoom, 0.5],
        ]);
        this.mapService.mapbox.style.layers.heatmap.setHeatmapRadius(this.mapService.heatmapLayer, [
            [0, 5],
            [maxZoom, 5],
        ]);
        this.mapService.mapbox.style.layers.heatmap.setHeatmapOpacity(this.mapService.heatmapLayer, [
            [0, 1],
            [maxZoom, 1],
        ]);
        this.mapService.mapbox.style.addLayer(this.mapService.heatmapLayer);

        this.params.closeCallback();
    }

    removeSymbolLayer() {
        this.mapService.mapbox.style.removeLayer(this.mapService.symbolLayer);
        this.mapService.symbolLayer = null;

        this.params.closeCallback();
    }

    addSymbolLayer() {
        this.mapService.mapbox.style.addImage('OIL', 'images/types/oil.png');
        this.mapService.mapbox.style.addImage('GAS', 'images/types/gas.png');
        this.mapService.mapbox.style.addImage('OILGAS', 'images/types/oilgas.png');
        this.mapService.mapbox.style.addImage('EOR', 'images/types/eor.png');
        this.mapService.mapbox.style.addImage('SWD', 'images/types/swd.png');
        this.mapService.mapbox.style.addImage('OTHER', 'images/types/other.png');

        this.mapService.symbolLayer = this.mapService.mapbox.style.layers.symbolLayer.create('symbol-layer-id', 'wells', null, null);
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
