import { isIOS, isAndroid } from 'tns-core-modules/platform';
import { ModalDialogParams } from 'nativescript-angular/modal-dialog';
import { Component, OnInit } from '@angular/core';
import { MapService } from './../map.service';
import { MapboxColor, SymbolLayerOptions } from 'nativescript-mapbox-sdk';
import { LayerOptions } from 'nativescript-mapbox-sdk/common/layers/layers.common';

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

    ngOnInit() {}

    goBack() {
        this.params.closeCallback();
    }

    removeHeatmapLayer() {
        this.mapService.mapbox.style.removeLayer(this.mapService.heatmapLayer);
        this.mapService.heatmapLayer = null;
        this.params.closeCallback();
    }

    addHeatmapLayer() {
        const options: LayerOptions = {
            maxZoom: 12,
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
            [0, 1],
            [options.maxZoom, 0.5],
        ]);
        this.mapService.mapbox.style.layers.heatmap.setHeatmapRadius(this.mapService.heatmapLayer, [
            [0, 5],
            [options.maxZoom, 5],
        ]);
        this.mapService.mapbox.style.layers.heatmap.setHeatmapOpacity(this.mapService.heatmapLayer, [
            [0, 1],
            [options.maxZoom, 1],
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
        this.mapService.mapbox.style.addImageFromPath('OIL', 'images/types/oil.png');
        this.mapService.mapbox.style.addImageFromPath('GAS', 'images/types/gas.png');
        this.mapService.mapbox.style.addImageFromPath('OILGAS', 'images/types/oilgas.png');
        this.mapService.mapbox.style.addImageFromPath('EOR', 'images/types/eor.png');
        this.mapService.mapbox.style.addImageFromPath('SWD', 'images/types/swd.png');
        this.mapService.mapbox.style.addImageFromPath('OTHER', 'images/types/other.png');

        const options: SymbolLayerOptions = {
            minZoom: 12,
            iconImageKey: 'TYPE',
            iconSize: isAndroid ? 2 : 0.75,
            iconAllowOverlap: true,
            iconIgnorePlacement: true,
        };
        this.mapService.symbolLayer = this.mapService.mapbox.style.layers.symbolLayer.create('symbol-layer-id', 'wells', options);
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

        if (isIOS) {
            const createPredicate = (type: string, showAllWells: boolean) => {
                if (showAllWells) {
                    return NSPredicate.predicateWithFormatArgumentArray('TYPE = %d', NSArray.arrayWithObject(type));
                } else {
                    return NSPredicate.predicateWithFormatArgumentArray('TYPE = %d AND VISIBLE = %d', NSArray.arrayWithArray([type, 'FALSE']));
                }
            };

            let predicates = [];
            if (this.OIL) predicates.push(createPredicate('OIL', this.SHOW_ALL_WELLS));
            if (this.OILGAS) predicates.push(createPredicate('OILGAS', this.SHOW_ALL_WELLS));
            if (this.GAS) predicates.push(createPredicate('GAS', this.SHOW_ALL_WELLS));
            if (this.EOR) predicates.push(createPredicate('EOR', this.SHOW_ALL_WELLS));
            if (this.SWD) predicates.push(createPredicate('SWD', this.SHOW_ALL_WELLS));
            if (this.OTHER) predicates.push(createPredicate('OTHER', this.SHOW_ALL_WELLS));

            if (this.mapService.symbolLayer)
                this.mapService.symbolLayer.predicate = NSCompoundPredicate.orPredicateWithSubpredicates(NSArray.arrayWithArray(predicates));
            if (this.mapService.heatmapLayer)
                this.mapService.heatmapLayer.predicate = NSCompoundPredicate.orPredicateWithSubpredicates(NSArray.arrayWithArray(predicates));
        } else {
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
        }

        this.params.closeCallback();
    }
}
